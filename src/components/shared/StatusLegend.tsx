import { useSessionStore, type SessionStatus } from "@/stores/useSessionStore";

const STATUS_DEFS: {
  key: SessionStatus;
  label: string;
  colorClass: string;
}[] = [
  { key: "Starting", label: "Starting...", colorClass: "bg-orange-400" },
  { key: "Idle", label: "Idle", colorClass: "bg-blue-400" },
  { key: "Working", label: "Working", colorClass: "bg-emerald-400" },
  { key: "NeedsInput", label: "Needs Input", colorClass: "bg-yellow-300" },
  { key: "Done", label: "Done", colorClass: "bg-green-400" },
  { key: "Error", label: "Error", colorClass: "bg-red-400" },
];

export function StatusLegend() {
  const sessions = useSessionStore((s) => s.sessions);

  return (
    <div className="flex items-center gap-3">
      {STATUS_DEFS.map((s) => {
        const count = sessions.filter((sess) => sess.status === s.key).length;
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${s.colorClass}`} />
            <span className="text-[11px] text-maestro-text/70">
              {s.label}
              {count > 0 && (
                <span className="ml-0.5 text-maestro-text/50">({count})</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
