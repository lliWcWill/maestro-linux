use serde::Serialize;
use std::path::Path;

use super::error::GitError;
use super::runner::Git;

#[derive(Debug, Clone, Serialize)]
pub struct BranchInfo {
    pub name: String,
    pub is_remote: bool,
    pub is_current: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorktreeInfo {
    pub path: String,
    pub head: String,
    pub branch: Option<String>,
    pub is_bare: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct CommitInfo {
    pub hash: String,
    pub short_hash: String,
    pub parent_hashes: Vec<String>,
    pub author_name: String,
    pub author_email: String,
    pub timestamp: i64,
    pub summary: String,
}

impl Git {
    pub async fn list_branches(&self) -> Result<Vec<BranchInfo>, GitError> {
        let output = self
            .run(&[
                "branch",
                "-a",
                "--no-color",
                "--format=%(HEAD)|%(refname:short)|%(refname:rstrip=-2)",
            ])
            .await?;

        let mut branches = Vec::new();
        for line in output.lines() {
            let parts: Vec<&str> = line.splitn(3, '|').collect();
            if parts.len() < 2 {
                continue;
            }
            let is_current = parts[0].trim() == "*";
            let name = parts[1].trim().to_string();

            // Skip HEAD pointer entries like "origin/HEAD"
            if name.contains("HEAD") {
                continue;
            }

            let is_remote = parts
                .get(2)
                .map(|r| r.trim() == "remotes")
                .unwrap_or(false);

            branches.push(BranchInfo {
                name,
                is_remote,
                is_current,
            });
        }
        Ok(branches)
    }

    pub async fn current_branch(&self) -> Result<String, GitError> {
        match self.run(&["symbolic-ref", "--short", "HEAD"]).await {
            Ok(output) => Ok(output.trimmed().to_string()),
            Err(_) => {
                // Detached HEAD — fall back to short hash
                let output = self.run(&["rev-parse", "--short", "HEAD"]).await?;
                Ok(output.trimmed().to_string())
            }
        }
    }

    pub async fn uncommitted_count(&self) -> Result<usize, GitError> {
        let output = self.run(&["status", "--porcelain"]).await?;
        Ok(output.lines().len())
    }

    pub async fn worktree_list(&self) -> Result<Vec<WorktreeInfo>, GitError> {
        let output = self.run(&["worktree", "list", "--porcelain"]).await?;

        let mut worktrees = Vec::new();
        let mut current_path = String::new();
        let mut current_head = String::new();
        let mut current_branch: Option<String> = None;
        let mut current_bare = false;

        for line in output.stdout.lines() {
            if let Some(path) = line.strip_prefix("worktree ") {
                // Save previous entry if we have one
                if !current_path.is_empty() {
                    worktrees.push(WorktreeInfo {
                        path: current_path,
                        head: current_head,
                        branch: current_branch,
                        is_bare: current_bare,
                    });
                }
                current_path = path.to_string();
                current_head = String::new();
                current_branch = None;
                current_bare = false;
            } else if let Some(head) = line.strip_prefix("HEAD ") {
                current_head = head.to_string();
            } else if let Some(branch) = line.strip_prefix("branch refs/heads/") {
                current_branch = Some(branch.to_string());
            } else if line == "bare" {
                current_bare = true;
            }
        }

        // Push last entry
        if !current_path.is_empty() {
            worktrees.push(WorktreeInfo {
                path: current_path,
                head: current_head,
                branch: current_branch,
                is_bare: current_bare,
            });
        }

        Ok(worktrees)
    }

    pub async fn worktree_add(
        &self,
        path: &Path,
        new_branch: Option<&str>,
        base_ref: Option<&str>,
    ) -> Result<WorktreeInfo, GitError> {
        let path_str = path.to_string_lossy();
        let mut args = vec!["worktree", "add"];

        // Collect owned strings to extend their lifetime
        let branch_flag;
        if let Some(branch) = new_branch {
            branch_flag = branch.to_string();
            args.push("-b");
            args.push(&branch_flag);
        }

        args.push(&path_str);

        let base_ref_owned;
        if let Some(base) = base_ref {
            base_ref_owned = base.to_string();
            args.push(&base_ref_owned);
        }

        self.run(&args).await?;

        // Read back the created worktree info
        let head_output = self.run_in(path, &["rev-parse", "HEAD"]).await?;
        let branch_output = self.run_in(path, &["symbolic-ref", "--short", "HEAD"]).await;

        Ok(WorktreeInfo {
            path: path.to_string_lossy().to_string(),
            head: head_output.trimmed().to_string(),
            branch: branch_output.ok().map(|o| o.trimmed().to_string()),
            is_bare: false,
        })
    }

    pub async fn worktree_remove(&self, path: &Path, force: bool) -> Result<(), GitError> {
        let path_str = path.to_string_lossy().to_string();
        let mut args = vec!["worktree", "remove"];
        if force {
            args.push("--force");
        }
        args.push(&path_str);
        self.run(&args).await?;
        Ok(())
    }

    pub async fn worktree_prune(&self) -> Result<(), GitError> {
        self.run(&["worktree", "prune"]).await?;
        Ok(())
    }

    pub async fn commit_log(
        &self,
        max_count: usize,
        all_branches: bool,
    ) -> Result<Vec<CommitInfo>, GitError> {
        let count_str = format!("-{}", max_count);
        let mut args = vec![
            "log",
            "--format=%H|%h|%P|%an|%ae|%at|%s",
            &count_str,
            "--topo-order",
        ];
        if all_branches {
            args.push("--all");
        }

        let output = self.run(&args).await?;

        let mut commits = Vec::new();
        for line in output.lines() {
            let parts: Vec<&str> = line.splitn(7, '|').collect();
            if parts.len() < 7 {
                continue;
            }

            let timestamp = parts[5].parse::<i64>().unwrap_or(0);
            let parent_hashes: Vec<String> = if parts[2].is_empty() {
                Vec::new()
            } else {
                parts[2].split(' ').map(|s| s.to_string()).collect()
            };

            commits.push(CommitInfo {
                hash: parts[0].to_string(),
                short_hash: parts[1].to_string(),
                parent_hashes,
                author_name: parts[3].to_string(),
                author_email: parts[4].to_string(),
                timestamp,
                summary: parts[6].to_string(),
            });
        }

        Ok(commits)
    }
}
