use std::path::{Path, PathBuf};

use sha2::{Digest, Sha256};

use crate::git::{Git, GitError, WorktreeInfo};

fn worktree_base_dir() -> PathBuf {
    directories::ProjectDirs::from("com", "maestro", "maestro")
        .map(|p| p.data_dir().to_path_buf())
        .unwrap_or_else(|| {
            dirs_fallback()
        })
        .join("worktrees")
}

/// Fallback if ProjectDirs fails (e.g., no HOME set)
fn dirs_fallback() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
    PathBuf::from(home)
        .join(".local")
        .join("share")
        .join("maestro")
}

fn repo_hash(repo_path: &Path) -> String {
    let canonical = std::fs::canonicalize(repo_path).unwrap_or_else(|_| repo_path.to_path_buf());
    let digest = Sha256::digest(canonical.to_string_lossy().as_bytes());
    format!("{:x}", digest)[..16].to_string()
}

fn sanitize_branch(branch: &str) -> String {
    branch
        .replace('/', "-")
        .replace('\\', "-")
        .replace(':', "-")
        .replace('*', "-")
        .replace('?', "-")
        .replace('"', "-")
        .replace('<', "-")
        .replace('>', "-")
        .replace('|', "-")
}

pub struct WorktreeManager;

impl WorktreeManager {
    pub fn new() -> Self {
        Self
    }

    /// Compute the worktree path for a given repo + branch
    fn worktree_path(&self, repo_path: &Path, branch: &str) -> PathBuf {
        let hash = repo_hash(repo_path);
        let sanitized = sanitize_branch(branch);
        worktree_base_dir().join(hash).join(sanitized)
    }

    /// Create a worktree for a session.
    /// Returns the worktree path on disk.
    pub async fn create(
        &self,
        branch: &str,
        repo_path: &Path,
    ) -> Result<PathBuf, GitError> {
        let git = Git::new(repo_path);

        // Check if branch is already checked out in another worktree
        let existing = git.worktree_list().await?;
        for wt in &existing {
            if let Some(ref wt_branch) = wt.branch {
                if wt_branch == branch {
                    return Err(GitError::BranchAlreadyCheckedOut {
                        branch: branch.to_string(),
                        path: wt.path.clone(),
                    });
                }
            }
        }

        let wt_path = self.worktree_path(repo_path, branch);

        // Create parent directories
        if let Some(parent) = wt_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| GitError::SpawnError {
                source: e,
                command: format!("create_dir_all {:?}", parent),
            })?;
        }

        git.worktree_add(&wt_path, None, Some(branch)).await?;

        Ok(wt_path)
    }

    /// Remove a worktree by path
    pub async fn remove(&self, repo_path: &Path, wt_path: &Path) -> Result<(), GitError> {
        let git = Git::new(repo_path);
        git.worktree_remove(wt_path, true).await?;
        git.worktree_prune().await?;

        // Clean up empty parent directories
        if let Some(parent) = wt_path.parent() {
            let _ = std::fs::remove_dir(parent); // only succeeds if empty
        }

        Ok(())
    }

    /// List worktrees managed by Maestro (those under our base dir)
    pub async fn list_managed(&self, repo_path: &Path) -> Result<Vec<WorktreeInfo>, GitError> {
        let git = Git::new(repo_path);
        let all = git.worktree_list().await?;

        let base = worktree_base_dir();
        let base_str = base.to_string_lossy();

        Ok(all
            .into_iter()
            .filter(|wt| wt.path.starts_with(base_str.as_ref()))
            .collect())
    }

    /// Prune git worktree refs and scan for orphaned dirs
    pub async fn prune(&self, repo_path: &Path) -> Result<(), GitError> {
        let git = Git::new(repo_path);
        git.worktree_prune().await?;

        // Scan managed directory for orphans not in git worktree list
        let hash = repo_hash(repo_path);
        let managed_dir = worktree_base_dir().join(&hash);

        if !managed_dir.exists() {
            return Ok(());
        }

        let active: Vec<String> = git
            .worktree_list()
            .await?
            .iter()
            .map(|wt| wt.path.clone())
            .collect();

        if let Ok(entries) = std::fs::read_dir(&managed_dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let path_str = path.to_string_lossy().to_string();
                if !active.contains(&path_str) && path.is_dir() {
                    log::info!("Removing orphaned worktree dir: {}", path_str);
                    let _ = std::fs::remove_dir_all(&path);
                }
            }
        }

        Ok(())
    }
}
