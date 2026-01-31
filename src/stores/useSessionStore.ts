import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export type AiMode = "Claude" | "Gemini" | "Codex" | "Plain";

export type SessionStatus =
  | "Starting"
  | "Idle"
  | "Working"
  | "NeedsInput"
  | "Done"
  | "Error";

export interface SessionConfig {
  id: number;
  mode: AiMode;
  branch: string | null;
  status: SessionStatus;
  worktree_path: string | null;
}

interface SessionStatusPayload {
  session_id: number;
  status: SessionStatus;
}

interface SessionState {
  sessions: SessionConfig[];
  fetchSessions: () => Promise<void>;
  initListeners: () => Promise<UnlistenFn>;
}

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
