import { Plus, X } from "lucide-react";

export type ProjectTab = {
  id: string;
  name: string;
  active: boolean;
};

interface ProjectTabsProps {
  tabs: ProjectTab[];
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export function ProjectTabs({
  tabs,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: ProjectTabsProps) {
  return (
    <div className="no-select flex h-9 items-center border-b border-maestro-border bg-maestro-surface px-2">
      <div
        role="tablist"
        aria-label="Open projects"
        className="flex items-center gap-1"
      >
        {tabs.length === 0 ? (
          <span className="px-2 text-xs text-maestro-muted">No projects</span>
        ) : (
          tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-1.5 rounded-t px-2 py-1.5 text-xs font-medium ${
                tab.active
                  ? "bg-maestro-bg text-maestro-text"
                  : "text-maestro-muted hover:text-maestro-text"
              }`}
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab.active}
                tabIndex={tab.active ? 0 : -1}
                onClick={() => onSelectTab(tab.id)}
                className="flex items-center gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-maestro-green" />
                <span>{tab.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onCloseTab(tab.id)}
                className="ml-1 rounded p-0.5 hover:bg-maestro-border"
                aria-label={`Close ${tab.name}`}
              >
                <X size={10} />
              </button>
            </div>
          ))
        )}
      </div>
      <button
        type="button"
        onClick={onNewTab}
        className="ml-auto rounded p-1 text-maestro-muted hover:bg-maestro-border hover:text-maestro-text"
        aria-label="Open new project"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
