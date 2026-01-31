import { Play, Circle, AlertTriangle, Wrench } from "lucide-react";

const ACTIONS = [
  { label: "Run App", icon: Play, color: "text-maestro-green", fill: true },
  { label: "Commit & Push", icon: Circle, color: "text-maestro-accent", fill: true },
  { label: "Fix Errors", icon: AlertTriangle, color: "text-maestro-orange", fill: false },
  { label: "Lint & Format", icon: Wrench, color: "text-maestro-purple", fill: false },
] as const;

export function QuickActionPills() {
  return (
    <div className="no-select flex shrink-0 items-center gap-1 border-t border-maestro-border bg-maestro-surface px-2 py-1">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-maestro-muted transition-colors hover:bg-maestro-card hover:text-maestro-text"
        >
          <a.icon
            size={9}
            className={a.color}
            {...(a.fill ? { fill: "currentColor" } : {})}
          />
          {a.label}
        </button>
      ))}
    </div>
  );
}
