use serde::Serialize;
use std::fmt;

#[derive(Debug, Clone, Serialize)]
pub enum PtyErrorCode {
    SpawnFailed,
    SessionNotFound,
    WriteFailed,
    ResizeFailed,
    KillFailed,
}

#[derive(Debug, Clone, Serialize)]
pub struct PtyError {
    pub code: PtyErrorCode,
    pub message: String,
}

impl fmt::Display for PtyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}: {}", self.code, self.message)
    }
}

impl std::error::Error for PtyError {}

impl PtyError {
    pub fn spawn_failed(msg: impl Into<String>) -> Self {
        Self {
            code: PtyErrorCode::SpawnFailed,
            message: msg.into(),
        }
    }

    pub fn session_not_found(id: u32) -> Self {
        Self {
            code: PtyErrorCode::SessionNotFound,
            message: format!("Session {} not found", id),
        }
    }

    pub fn write_failed(msg: impl Into<String>) -> Self {
        Self {
            code: PtyErrorCode::WriteFailed,
            message: msg.into(),
        }
    }

    pub fn resize_failed(msg: impl Into<String>) -> Self {
        Self {
            code: PtyErrorCode::ResizeFailed,
            message: msg.into(),
        }
    }

    pub fn kill_failed(msg: impl Into<String>) -> Self {
        Self {
            code: PtyErrorCode::KillFailed,
            message: msg.into(),
        }
    }
}
