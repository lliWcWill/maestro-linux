import { Plus, X } from "lucide-react";

const placeholderTabs = [
  { id: "1", name: "my-project", active: true },
  { id: "2", name: "another-repo", active: false },
];

export function ProjectTabs() {
  return (
    <div className="no-select flex h-9 items-center border-b border-maestro-border bg-maestro-surface px-2">
      {placeholderTabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-1.5 rounded-t px-3 py-1.5 text-xs font-medium ${
            tab.active
              ? "bg-maestro-bg text-maestro-text"
              : "text-maestro-muted hover:text-maestro-text"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-maestro-green" />
          <span>{tab.name}</span>
          <button className="ml-1 rounded p-0.5 hover:bg-maestro-border">
            <X size={10} />
          </button>
        </div>
      ))}
      <button className="ml-1 rounded p-1 text-maestro-muted hover:bg-maestro-border hover:text-maestro-text">
        <Plus size={14} />
      </button>
    </div>
  );
}
