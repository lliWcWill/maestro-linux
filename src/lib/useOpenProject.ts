import { useCallback } from "react";
import { pickProjectFolder } from "@/lib/dialog";
import { useWorkspaceStore } from "@/stores/useWorkspaceStore";

export function useOpenProject(): () => Promise<void> {
  const openProject = useWorkspaceStore((s) => s.openProject);

  return useCallback(async () => {
    try {
      const path = await pickProjectFolder();
      if (path) {
        await openProject(path);
      }
    } catch (err) {
      console.error("Failed to open project folder:", err);
    }
  }, [openProject]);
}
