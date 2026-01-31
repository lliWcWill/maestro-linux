import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export async function spawnShell(cwd?: string): Promise<number> {
  return invoke<number>("spawn_shell", { cwd: cwd ?? null });
}

export async function writeStdin(
  sessionId: number,
  data: string,
): Promise<void> {
  return invoke("write_stdin", { sessionId, data });
}

export async function resizePty(
  sessionId: number,
  rows: number,
  cols: number,
): Promise<void> {
  return invoke("resize_pty", { sessionId, rows, cols });
}

export async function killSession(sessionId: number): Promise<void> {
  return invoke("kill_session", { sessionId });
}

export function onPtyOutput(
  sessionId: number,
  callback: (data: string) => void,
): Promise<UnlistenFn> {
  return listen<string>(`pty-output-${sessionId}`, (event) => {
    callback(event.payload);
  });
}
