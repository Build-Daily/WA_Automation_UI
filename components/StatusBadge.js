const STATUS_STYLES = {
  confirmed:   "bg-accent-green/10  text-accent-green  border-accent-green/25",
  pending:     "bg-accent-amber/10  text-accent-amber  border-accent-amber/25",
  cancelled:   "bg-accent-red/10    text-accent-red    border-accent-red/25",
  rescheduled: "bg-accent-blue/10   text-accent-blue   border-accent-blue/25",
  completed:   "bg-surface-2        text-text-secondary border-border",
};

export default function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const cls = STATUS_STYLES[s] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}
