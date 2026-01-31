const STATUSES = [
  { label: "Starting...", colorClass: "bg-orange-400" },
  { label: "Idle", colorClass: "bg-blue-400" },
  { label: "Working", colorClass: "bg-emerald-400" },
  { label: "Needs Input", colorClass: "bg-yellow-300" },
  { label: "Done", colorClass: "bg-green-400" },
  { label: "Error", colorClass: "bg-red-400" },
] as const;

export function StatusLegend() {
  return (
    <div className="flex items-center gap-3">
      {STATUSES.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${s.colorClass}`} />
          <span className="text-[11px] text-maestro-text/70">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
