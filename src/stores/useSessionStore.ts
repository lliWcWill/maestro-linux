import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

/** AI provider variants supported by the backend orchestrator. */
export type AiMode = "Claude" | "Gemini" | "Codex" | "Plain";

/**
 * Backend-emitted session lifecycle states.
 * Must stay in sync with the Rust `SessionStatus` enum.
 */
export type SessionStatus =
  | "Starting"
  | "Idle"
  | "Working"
  | "NeedsInput"
  | "Done"
  | "Error";

/**
 * Mirrors the Rust `SessionConfig` struct returned by `get_sessions`.
 *
 * @property id - Unique numeric session ID assigned by the backend.
 * @property branch - Git branch the session operates on, or null for the default branch.
 * @property worktree_path - Filesystem path to the git worktree, if one was created.
 */
export interface SessionConfig {
  id: number;
  mode: AiMode;
  branch: string | null;
  status: SessionStatus;
  worktree_path: string | null;
}

/** Shape of the Tauri `session-status-changed` event payload. */
interface SessionStatusPayload {
  session_id: number;
  status: SessionStatus;
}

/**
 * Zustand store slice for session metadata (not PTY I/O -- that lives in terminal.ts).
 *
 * @property sessions - Authoritative list of sessions fetched from the backend.
 * @property fetchSessions - Performs a one-shot IPC fetch to replace the session list.
 * @property initListeners - Subscribes to the global `session-status-changed` Tauri event.
 *   Returns an unlisten function; the caller must ensure this is called exactly once
 *   to avoid duplicate subscriptions (typically via a useEffect cleanup).
 */
interface SessionState {
  sessions: SessionConfig[];
  fetchSessions: () => Promise<void>;
  initListeners: () => Promise<UnlistenFn>;
}

/**
 * Global session store. Not persisted -- sessions are ephemeral and
 * re-fetched from the backend on app launch via `fetchSessions`.
 */
export const useSessionStore = create<SessionState>()((set) => ({
  sessions: [],

  fetchSessions: async () => {
    try {
      const sessions = await invoke<SessionConfig[]>("get_sessions");
      set({ sessions });
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  },

  initListeners: async () => {
    const unlisten = await listen<SessionStatusPayload>(
      "session-status-changed",
      (event) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === event.payload.session_id
              ? { ...s, status: event.payload.status }
              : s,
          ),
        }));
      },
    );
    return unlisten;
  },
}));
