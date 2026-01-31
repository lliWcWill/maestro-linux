mod commands;
mod core;

use core::ProcessManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .manage(ProcessManager::new())
        .invoke_handler(tauri::generate_handler![
            commands::terminal::spawn_shell,
            commands::terminal::write_stdin,
            commands::terminal::resize_pty,
            commands::terminal::kill_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Maestro");
}
