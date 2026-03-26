import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { getDashboardStats, getUpcomingToday } from "../lib/api";

// ─── Tiny bar chart (pure SVG, no library needed) ─────────────────────────────
function MiniBarChart({ data = [], color = "#25D366" }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const BAR_W = 20;
  const GAP = 6;
  const H = 64;
  const total_w = data.length * (BAR_W + GAP) - GAP;

  return (
    <svg width={total_w} height={H + 20} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max(3, Math.round((d.value / max) * H));
        const x = i * (BAR_W + GAP);
        const y = H - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx={3}
              fill={color} opacity={i === data.length - 1 ? 1 : 0.45} />
            <text x={x + BAR_W / 2} y={H + 14} textAnchor="middle"
              fontSize={9} fill="currentColor" className="text-text-muted" opacity={0.6}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Generate last 7 days labels
function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return format(d, "EEE");
  });
}

const ICONS = {
  total: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  confirmed: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  pending: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  messages: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Mock chart data — replace with real API call if you add /api/dashboard/weekly
  const chartLabels = last7Days();
  const chartData = chartLabels.map((label, i) => ({
    label,
    value: i === 6 ? (stats?.todayTotal || 0) : Math.floor(Math.random() * 8 + 1),
  }));

  const today = format(new Date(), "EEEE, d MMMM yyyy");
  const todayISO = format(new Date(), "yyyy-MM-dd");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getDashboardStats(), getUpcomingToday()])
      .then(([s, u]) => {
        setStats(s);
        setUpcoming(u);
        setLastUpdated(new Date());
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Dashboard"
        subtitle={today}
        actions={
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-text-muted hidden sm:block">
                Updated {format(lastUpdated, "h:mm a")}
              </span>
            )}
            <button onClick={load} className="btn-ghost flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={loading ? "animate-spin" : ""}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {error && (
          <div className="card-inner px-4 py-3 border-accent-red/30 bg-accent-red/5 text-accent-red text-sm flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error} — check that the backend is running on localhost:3000
          </div>
        )}

        {/* Stat Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Today's total" value={loading ? "…" : stats?.todayTotal ?? 0} sub="appointments scheduled" accent="blue" icon={ICONS.total} />
          <StatCard label="Confirmed" value={loading ? "…" : stats?.confirmed ?? 0} sub="ready to go" accent="green" icon={ICONS.confirmed} />
          <StatCard label="Pending" value={loading ? "…" : stats?.pending ?? 0} sub="awaiting confirmation" accent="amber" icon={ICONS.pending} />
          <StatCard label="Messages sent" value={loading ? "…" : stats?.messagesOut ?? 0} sub="via WhatsApp today" accent="green" icon={ICONS.messages} />
        </div>

        {/* Chart + Upcoming — side by side on lg, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Weekly chart */}
          <div className="card p-5 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">This week</h2>
              <span className="text-xs text-text-muted">appointments / day</span>
            </div>
            <div className="flex items-end gap-1 overflow-x-auto pb-1">
              <MiniBarChart
                data={chartData}
                color="#25D366"
              />
            </div>
            {/* Summary row */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-muted">Total patients</p>
                <p className="text-lg font-semibold text-text-primary mt-0.5">
                  {loading ? "…" : stats?.totalPatients ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">New today</p>
                <p className="text-lg font-semibold text-text-primary mt-0.5">
                  {loading ? "…" : stats?.newToday ?? 0}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming today */}
          <div className="card overflow-hidden lg:col-span-2">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Upcoming today</h2>
              <Link
                href={`/appointments?date=${todayISO}`}
                className="text-xs text-accent-green hover:underline"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="px-5 py-10 text-center text-text-muted text-sm">Loading…</div>
            ) : upcoming.length === 0 ? (
              <div className="px-5 py-10 text-center text-text-muted text-sm">
                No upcoming appointments for today.
              </div>
            ) : (
              <div className="divide-y divide-border overflow-y-auto max-h-72">
                {upcoming.map((apt) => (
                  <div key={apt.id} className="px-5 py-3 flex items-center gap-3">
                    <span className="font-mono text-sm text-accent-green w-16 flex-shrink-0">
                      {apt.time || "—"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {apt.patientName || "Unknown"}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {apt.phone || ""}
                        {apt.doctorName ? ` · ${apt.doctorName}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/appointments" className="card p-4 sm:p-5 hover:border-accent-green/30 transition-colors group cursor-pointer block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Manage appointments</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-muted group-hover:text-accent-green transition-colors">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <p className="text-xs text-text-muted">View all, cancel or reschedule appointments</p>
          </Link>
          <Link href="/slots" className="card p-4 sm:p-5 hover:border-accent-green/30 transition-colors group cursor-pointer block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-primary">Configure slots</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-text-muted group-hover:text-accent-green transition-colors">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
            <p className="text-xs text-text-muted">Add, edit or disable available time slots</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
