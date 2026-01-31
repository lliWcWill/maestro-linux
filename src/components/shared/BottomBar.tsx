import { FolderOpen, Play, Square } from "lucide-react";

interface BottomBarProps {
  hasActiveProject: boolean;
  sessionCount: number;
  onSelectDirectory: () => void;
  onLaunchAll?: () => void;
  onStopAll?: () => void;
}

export function BottomBar({
  hasActiveProject,
  sessionCount,
  onSelectDirectory,
  onLaunchAll,
  onStopAll,
}: BottomBarProps) {
  return (
    <div className="theme-transition no-select flex h-11 items-center justify-center gap-3 border-t border-maestro-border bg-maestro-surface px-4">
      <button
        onClick={onSelectDirectory}
        className="flex items-center gap-2 rounded-lg border border-maestro-border bg-maestro-card px-4 py-1.5 text-xs font-medium text-maestro-text transition-colors hover:bg-maestro-border/50"
      >
        <FolderOpen size={13} />
        Select Directory
      </button>

      {hasActiveProject ? (
        <button
          onClick={onStopAll}
          className="flex items-center gap-2 rounded-lg bg-maestro-red/90 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-maestro-red"
        >
          <Square size={11} />
          Stop All
        </button>
      ) : (
        <button
          onClick={onLaunchAll}
          className="flex items-center gap-2 rounded-lg bg-maestro-accent px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-maestro-accent/80"
        >
          <Play size={11} fill="currentColor" />
          Launch {sessionCount} All Sessions
        </button>
      )}
    </div>
  );
}
