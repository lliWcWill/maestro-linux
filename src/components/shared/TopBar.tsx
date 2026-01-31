import {
  PanelLeft,
  GitBranch,
  ChevronDown,
  GitFork,
  Settings,
  Minus,
  Square,
  X,
} from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { StatusLegend } from "./StatusLegend";

interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  branchName?: string;
}

export function TopBar({
  sidebarOpen,
  onToggleSidebar,
  branchName,
}: TopBarProps) {
  const appWindow = getCurrentWindow();

  return (
    <div
      data-tauri-drag-region
      className="theme-transition no-select flex h-10 items-center border-b border-maestro-border bg-maestro-surface"
    >
      {/* Left: collapse toggle + branch */}
      <div className="flex items-center gap-1 px-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`rounded p-1.5 transition-colors ${
            sidebarOpen
              ? "text-maestro-accent hover:bg-maestro-accent/10"
              : "text-maestro-muted hover:bg-maestro-border hover:text-maestro-text"
          }`}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={15} />
        </button>

        {branchName && (
          <>
            <div className="mx-1.5 h-4 w-px bg-maestro-border" />
            <button
              type="button"
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-maestro-text transition-colors hover:bg-maestro-card"
            >
              <GitBranch size={13} className="text-maestro-muted" />
              <span className="font-medium">{branchName}</span>
              <ChevronDown size={11} className="text-maestro-muted" />
            </button>
          </>
        )}
      </div>

      {/* Center: drag region */}
      <div data-tauri-drag-region className="flex-1" />

      {/* Right: status legend */}
      <div className="mr-3">
        <StatusLegend />
      </div>

      {/* Right: action icons */}
      <div className="flex items-center gap-0.5 mr-1">
        <button
          type="button"
          className="rounded p-1.5 text-maestro-muted transition-colors hover:bg-maestro-card hover:text-maestro-text"
          aria-label="Git graph"
          title="Git Graph"
        >
          <GitFork size={14} />
        </button>
        <button
          type="button"
          className="rounded p-1.5 text-maestro-muted transition-colors hover:bg-maestro-card hover:text-maestro-text"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Window controls */}
      <div className="flex items-center border-l border-maestro-border">
        <button
          type="button"
          onClick={() => appWindow.minimize()}
          className="flex h-10 w-11 items-center justify-center text-maestro-muted transition-colors hover:bg-maestro-muted/10 hover:text-maestro-text"
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={() => appWindow.toggleMaximize()}
          className="flex h-10 w-11 items-center justify-center text-maestro-muted transition-colors hover:bg-maestro-muted/10 hover:text-maestro-text"
          aria-label="Maximize"
        >
          <Square size={12} />
        </button>
        <button
          type="button"
          onClick={() => appWindow.close()}
          className="flex h-10 w-11 items-center justify-center text-maestro-muted transition-colors hover:bg-maestro-red/80 hover:text-white"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
