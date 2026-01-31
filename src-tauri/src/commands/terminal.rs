use tauri::{AppHandle, State};

use crate::core::{ProcessManager, PtyError};

#[tauri::command]
pub async fn spawn_shell(
    app_handle: AppHandle,
    state: State<'_, ProcessManager>,
    cwd: Option<String>,
) -> Result<u32, PtyError> {
    let pm = state.inner().clone();
    pm.spawn_shell(app_handle, cwd)
}

#[tauri::command]
pub async fn write_stdin(
    state: State<'_, ProcessManager>,
    session_id: u32,
    data: String,
) -> Result<(), PtyError> {
    let pm = state.inner().clone();
    pm.write_stdin(session_id, &data)
}

#[tauri::command]
pub async fn resize_pty(
    state: State<'_, ProcessManager>,
    session_id: u32,
    rows: u16,
    cols: u16,
) -> Result<(), PtyError> {
    let pm = state.inner().clone();
    pm.resize_pty(session_id, rows, cols)
}

#[tauri::command]
pub async fn kill_session(
    state: State<'_, ProcessManager>,
    session_id: u32,
) -> Result<(), PtyError> {
    let pm = state.inner().clone();
    pm.kill_session(session_id).await
}
