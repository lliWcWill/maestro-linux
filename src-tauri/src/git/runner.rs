use std::path::{Path, PathBuf};
use tokio::process::Command;

use super::error::GitError;

#[derive(Debug)]
pub struct GitOutput {
    pub stdout: String,
    pub stderr: String,
}

impl GitOutput {
    pub fn lines(&self) -> Vec<&str> {
        self.stdout.lines().filter(|l| !l.is_empty()).collect()
    }

    pub fn trimmed(&self) -> &str {
        self.stdout.trim()
    }
}

#[derive(Debug, Clone)]
pub struct Git {
    repo_path: PathBuf,
}

impl Git {
    pub fn new(repo_path: impl Into<PathBuf>) -> Self {
        Self {
            repo_path: repo_path.into(),
        }
    }

    pub async fn run(&self, args: &[&str]) -> Result<GitOutput, GitError> {
        let mut cmd = Command::new("git");
        cmd.arg("-C")
            .arg(&self.repo_path)
            .args(args)
            .env("GIT_TERMINAL_PROMPT", "0")
            .env("LC_ALL", "C")
            .kill_on_drop(true);

        let command_str = format!("git -C {} {}", self.repo_path.display(), args.join(" "));

        let output = cmd.output().await.map_err(|source| {
            if source.kind() == std::io::ErrorKind::NotFound {
                GitError::GitNotFound
            } else {
                GitError::SpawnError {
                    source,
                    command: command_str.clone(),
                }
            }
        })?;

        let stdout = String::from_utf8(output.stdout)?;
        let stderr = String::from_utf8(output.stderr)?;

        if output.status.success() {
            Ok(GitOutput { stdout, stderr })
        } else {
            Err(GitError::CommandFailed {
                code: output.status.code().unwrap_or(-1),
                stderr: stderr.trim().to_string(),
                command: command_str,
            })
        }
    }

    pub async fn run_in(&self, path: &Path, args: &[&str]) -> Result<GitOutput, GitError> {
        Git::new(path).run(args).await
    }
}
