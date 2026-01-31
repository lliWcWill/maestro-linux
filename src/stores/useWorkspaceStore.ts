import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { LazyStore } from "@tauri-apps/plugin-store";

// --- Types ---

export type WorkspaceTab = {
  id: string;
  name: string;
  projectPath: string;
  active: boolean;
  sessions: string[];
};

type WorkspaceState = {
  tabs: WorkspaceTab[];
};

type WorkspaceActions = {
  openProject: (path: string) => void;
  selectTab: (id: string) => void;
  closeTab: (id: string) => void;
};

// --- Tauri LazyStore-backed StateStorage adapter ---

const lazyStore = new LazyStore("store.json");

const tauriStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await lazyStore.get<string>(name);
      return value ?? null;
    } catch (err) {
      console.error(`tauriStorage.getItem("${name}") failed:`, err);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await lazyStore.set(name, value);
      await lazyStore.save();
    } catch (err) {
      console.error(`tauriStorage.setItem("${name}") failed:`, err);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await lazyStore.delete(name);
      await lazyStore.save();
    } catch (err) {
      console.error(`tauriStorage.removeItem("${name}") failed:`, err);
    }
  },
};

// --- Helpers ---

function basename(path: string): string {
  const segments = path.replace(/\/+$/, "").split("/");
  return segments[segments.length - 1] || path;
}

// --- Store ---

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      tabs: [],

      openProject: (path: string) => {
        const { tabs } = get();

        // Deduplicate: if path already open, just activate that tab
        const existing = tabs.find((t) => t.projectPath === path);
        if (existing) {
          set({
            tabs: tabs.map((t) => ({ ...t, active: t.id === existing.id })),
          });
          return;
        }

        const id = crypto.randomUUID();
        const name = basename(path);

        set({
          tabs: [
            ...tabs.map((t) => ({ ...t, active: false })),
            { id, name, projectPath: path, active: true, sessions: [] },
          ],
        });
      },

      selectTab: (id: string) => {
        const { tabs } = get();
        if (!tabs.some((t) => t.id === id)) return;
        set({
          tabs: tabs.map((t) => ({ ...t, active: t.id === id })),
        });
      },

      closeTab: (id: string) => {
        const remaining = get().tabs.filter((t) => t.id !== id);

        if (remaining.length === 0) {
          set({ tabs: [] });
          return;
        }

        // If the closed tab was active, activate the first remaining tab
        const needsActivation = !remaining.some((t) => t.active);
        set({
          tabs: needsActivation
            ? remaining.map((t, i) =>
                i === 0 ? { ...t, active: true } : t,
              )
            : remaining,
        });
      },
    }),
    {
      name: "maestro-workspace",
      storage: createJSONStorage(() => tauriStorage),
      partialize: (state) => ({ tabs: state.tabs }),
      version: 1,
    },
  ),
);
