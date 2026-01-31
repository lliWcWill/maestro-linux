use dashmap::DashMap;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AiMode {
    Claude,
    Gemini,
    Codex,
    Plain,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SessionStatus {
    Starting,
    Idle,
    Working,
    NeedsInput,
    Done,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionConfig {
    pub id: u32,
    pub mode: AiMode,
    pub branch: Option<String>,
    pub status: SessionStatus,
    pub worktree_path: Option<String>,
}

pub struct SessionManager {
    sessions: DashMap<u32, SessionConfig>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            sessions: DashMap::new(),
        }
    }

    pub fn create_session(&self, id: u32, mode: AiMode) -> SessionConfig {
        let config = SessionConfig {
            id,
            mode,
            branch: None,
            status: SessionStatus::Starting,
            worktree_path: None,
        };
        self.sessions.insert(id, config.clone());
        config
    }

    pub fn get_session(&self, id: u32) -> Option<SessionConfig> {
        self.sessions.get(&id).map(|s| s.clone())
    }

    pub fn update_status(&self, id: u32, status: SessionStatus) -> bool {
        if let Some(mut session) = self.sessions.get_mut(&id) {
            session.status = status;
            true
        } else {
            false
        }
    }

    pub fn assign_branch(&self, id: u32, branch: String, worktree_path: Option<String>) -> Option<SessionConfig> {
        if let Some(mut session) = self.sessions.get_mut(&id) {
            session.branch = Some(branch);
            session.worktree_path = worktree_path;
            Some(session.clone())
        } else {
            None
        }
    }

    pub fn all_sessions(&self) -> Vec<SessionConfig> {
        self.sessions.iter().map(|e| e.value().clone()).collect()
    }

    pub fn remove_session(&self, id: u32) -> Option<SessionConfig> {
        self.sessions.remove(&id).map(|(_, v)| v)
    }
}
