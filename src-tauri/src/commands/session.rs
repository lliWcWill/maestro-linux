use tauri::State;

use crate::core::session_manager::{AiMode, SessionConfig, SessionManager, SessionStatus};

#[tauri::command]
pub async fn get_sessions(state: State<'_, SessionManager>) -> Result<Vec<SessionConfig>, String> {
    Ok(state.all_sessions())
}

#[tauri::command]
pub async fn create_session(
    state: State<'_, SessionManager>,
    id: u32,
    mode: AiMode,
) -> Result<SessionConfig, String> {
    Ok(state.create_session(id, mode))
}

#[tauri::command]
pub async fn update_session_status(
    state: State<'_, SessionManager>,
    session_id: u32,
    status: SessionStatus,
) -> Result<bool, String> {
    Ok(state.update_status(session_id, status))
}

#[tauri::command]
pub async fn assign_session_branch(
    state: State<'_, SessionManager>,
    session_id: u32,
    branch: String,
    worktree_path: Option<String>,
) -> Result<SessionConfig, String> {
    state
        .assign_branch(session_id, branch, worktree_path)
        .ok_or_else(|| format!("Session {} not found", session_id))
}

#[tauri::command]
pub async fn remove_session(
    state: State<'_, SessionManager>,
    session_id: u32,
) -> Result<Option<SessionConfig>, String> {
    Ok(state.remove_session(session_id))
}
