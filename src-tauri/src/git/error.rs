use std::path::PathBuf;

#[derive(Debug, thiserror::Error)]
pub enum GitError {
    #[error("git executable not found. Is git installed?")]
    GitNotFound,

    #[error("git command failed (exit code {code}): {stderr}")]
    CommandFailed {
        code: i32,
        stderr: String,
        command: String,
    },

    #[error("git command was killed by signal")]
    Killed { command: String },

    #[error("failed to spawn git process: {source}")]
    SpawnError {
        source: std::io::Error,
        command: String,
    },

    #[error("invalid UTF-8 in git output")]
    InvalidUtf8(#[from] std::string::FromUtf8Error),

    #[error("failed to parse git output: {message}")]
    ParseError { message: String },

    #[error("repository not found at {path}")]
    NotARepo { path: PathBuf },

    #[error("branch '{branch}' already checked out at {path}")]
    BranchAlreadyCheckedOut { branch: String, path: String },

    #[error("worktree not found: {0}")]
    WorktreeNotFound(String),
}

impl serde::Serialize for GitError {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_str(&self.to_string())
    }
}
