import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/router";
import PageHeader from "../../components/PageHeader";
import StatusBadge from "../../components/StatusBadge";
import Modal from "../../components/Modal";
import { getAppointments, cancelAppointment, rescheduleAppointment } from "../../lib/api";

const STATUSES = ["", "scheduled", "confirmed", "completed", "cancelled", "rescheduled"];

const AVAILABLE_TIMES = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00",
];

// Row accent colours per status
const ROW_ACCENT = {
  confirmed: "border-l-2 border-l-accent-green  bg-accent-green/[0.03]",
  scheduled: "border-l-2 border-l-accent-amber  bg-accent-amber/[0.03]",
  rescheduled: "border-l-2 border-l-accent-blue   bg-accent-blue/[0.03]",
  cancelled: "border-l-2 border-l-accent-red    bg-accent-red/[0.03]   opacity-60",
  completed: "border-l-2 border-l-border        opacity-50",
};

export default function AppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pre-fill date from URL query (?date=YYYY-MM-DD) — set by dashboard "View all"
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  // Sync filters from URL on first load
  useEffect(() => {
    if (router.isReady) {
      if (router.query.date) setDate(router.query.date);
      if (router.query.status) setStatus(router.query.status);
      if (router.query.search) setSearch(router.query.search);
    }
  }, [router.isReady, router.query]);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [reschedTarget, setReschedTarget] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getAppointments({ search, status, date })
      .then((res) => {
        setAppointments(res.data ?? res);
        setTotal(res.total ?? (res.data ?? res).length);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, status, date]);

  useEffect(() => { load(); }, [load]);

  const openReschedule = (apt) => {
    setReschedTarget(apt);
    setNewDate(apt.date || "");
    setNewTime("");
    setActionError(null);
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setActionError(null);
    try {
      await cancelAppointment(cancelTarget.id);
      setCancelTarget(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await rescheduleAppointment(reschedTarget.id, { newDate, newTime });
      setReschedTarget(null);
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(false); }
  };

  const clearFilters = () => {
    setSearch(""); setStatus(""); setDate("");
    router.replace("/appointments", undefined, { shallow: true });
  };

  const hasFilters = search || status || date;

  const fmtDate = (val) => {
    try { return format(parseISO(val), "d MMM yyyy"); } catch { return val || "—"; }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Appointments"
        subtitle={`${total} total${date ? ` · ${fmtDate(date)}` : ""}`}
        actions={
          <button onClick={load} className="btn-ghost flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={loading ? "animate-spin" : ""}>
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
        {error && (
          <div className="card-inner px-4 py-3 border-accent-red/30 bg-accent-red/5 text-accent-red text-sm">
            {error}
          </div>
        )}

        {/* Filters — stack on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input flex-1 sm:w-40">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s || "All statuses"}</option>
              ))}
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input flex-1 sm:w-40"
            />
            {hasFilters && (
              <button onClick={clearFilters} className="btn-ghost px-3 text-text-muted flex-shrink-0">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active filter badge */}
        {date && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">Showing:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs border border-accent-green/20">
              {fmtDate(date)}
              <button onClick={() => setDate("")} className="hover:opacity-70">×</button>
            </span>
          </div>
        )}

        {/* Desktop table */}
        <div className="card overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-2">
                  {["Patient", "Phone", "Date", "Time", "Doctor", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-text-muted">Loading…</td></tr>
                ) : appointments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-text-muted">No appointments found.</td></tr>
                ) : (
                  appointments.map((apt) => {
                    const rowCls = ROW_ACCENT[apt.status] || "";
                    return (
                      <tr key={apt.id} className={`hover:bg-surface-2 transition-colors ${rowCls}`}>
                        <td className="px-4 py-3 font-medium text-text-primary whitespace-nowrap">{apt.patientName || "—"}</td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs whitespace-nowrap">{apt.phone || "—"}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{fmtDate(apt.date)}</td>
                        <td className="px-4 py-3 text-text-secondary font-mono text-xs whitespace-nowrap">{apt.time || "—"}</td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">{apt.doctorName || "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                        <td className="px-4 py-3">
                          {apt.status !== "cancelled" && apt.status !== "completed" ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => openReschedule(apt)} className="text-xs text-text-muted hover:text-accent-blue transition-colors">Reschedule</button>
                              <span className="text-border">·</span>
                              <button onClick={() => { setCancelTarget(apt); setActionError(null); }} className="text-xs text-text-muted hover:text-accent-red transition-colors">Cancel</button>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards — shown instead of table on small screens */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="card px-4 py-10 text-center text-text-muted text-sm">Loading…</div>
          ) : appointments.length === 0 ? (
            <div className="card px-4 py-10 text-center text-text-muted text-sm">No appointments found.</div>
          ) : (
            appointments.map((apt) => {
              const leftBorder = ROW_ACCENT[apt.status] || "";
              return (
                <div key={apt.id} className={`card p-4 ${leftBorder}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{apt.patientName || "—"}</p>
                      <p className="text-xs text-text-muted font-mono mt-0.5">{apt.phone || "—"}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-2">
                    <span>{fmtDate(apt.date)}</span>
                    <span className="text-border">·</span>
                    <span className="font-mono">{apt.time || "—"}</span>
                    {apt.doctorName && (
                      <>
                        <span className="text-border">·</span>
                        <span>{apt.doctorName}</span>
                      </>
                    )}
                  </div>
                  {apt.status !== "cancelled" && apt.status !== "completed" && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <button onClick={() => openReschedule(apt)} className="text-xs text-accent-blue">Reschedule</button>
                      <button onClick={() => { setCancelTarget(apt); setActionError(null); }} className="text-xs text-accent-red">Cancel</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        open={!!cancelTarget}
        onClose={() => { setCancelTarget(null); setActionError(null); }}
        title="Cancel appointment"
        footer={
          <>
            <button onClick={() => { setCancelTarget(null); setActionError(null); }} className="btn-ghost">Keep it</button>
            <button onClick={handleCancel} disabled={actionLoading} className="btn-danger">
              {actionLoading ? "Cancelling…" : "Yes, cancel"}
            </button>
          </>
        }
      >
        {cancelTarget && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Cancel appointment for{" "}
              <span className="text-text-primary font-medium">{cancelTarget.patientName}</span>{" "}
              on <span className="text-text-primary">{fmtDate(cancelTarget.date)}</span>?
            </p>
            <p className="text-xs text-text-muted">The patient will be notified via WhatsApp.</p>
            {actionError && <p className="text-xs text-accent-red">{actionError}</p>}
          </div>
        )}
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        open={!!reschedTarget}
        onClose={() => { setReschedTarget(null); setActionError(null); }}
        title="Reschedule appointment"
        footer={
          <>
            <button onClick={() => { setReschedTarget(null); setActionError(null); }} className="btn-ghost">Cancel</button>
            <button
              onClick={handleReschedule}
              disabled={actionLoading || !newDate || !newTime}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        {reschedTarget && (
          <div className="space-y-4">
            <div>
              <span className="label">Patient</span>
              <p className="text-sm text-text-primary">{reschedTarget.patientName}</p>
            </div>
            <div>
              <label className="label" htmlFor="new-date">New date</label>
              <input id="new-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="new-time">New time</label>
              <select id="new-time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="input">
                <option value="">Select a time…</option>
                {AVAILABLE_TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {actionError && <p className="text-xs text-accent-red">{actionError}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
