const STATUSES = [
  { label: "Starting...", colorClass: "bg-maestro-orange" },
  { label: "Idle", colorClass: "bg-maestro-accent" },
  { label: "Working", colorClass: "bg-maestro-green" },
  { label: "Needs Input", colorClass: "bg-maestro-yellow" },
  { label: "Done", colorClass: "bg-maestro-green" },
  { label: "Error", colorClass: "bg-maestro-red" },
] as const;

export function StatusLegend() {
  return (
    <div className="flex items-center gap-3">
      {STATUSES.map((s) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${s.colorClass}`} />
          <span className="text-[11px] text-maestro-muted">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
