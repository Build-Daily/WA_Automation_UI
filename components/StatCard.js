export default function StatCard({ label, value, sub, accent, icon }) {
  const accentMap = {
    green: "text-accent-green bg-accent-green/10 border-accent-green/20",
    amber: "text-accent-amber bg-accent-amber/10 border-accent-amber/20",
    red: "text-accent-red bg-accent-red/10 border-accent-red/20",
    blue: "text-accent-blue bg-accent-blue/10 border-accent-blue/20",
    default: "text-text-secondary bg-surface-2 border-border",
  };
  const cls = accentMap[accent] || accentMap.default;

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm ${cls}`}>
            {icon}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold text-text-primary tracking-tight">
          {value ?? <span className="text-text-muted">—</span>}
        </p>
        {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
