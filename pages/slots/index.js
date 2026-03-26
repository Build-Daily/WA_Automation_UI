import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { getSlots, createSlot, updateSlot, deleteSlot, toggleSlot } from "../../lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY_FORM = { day: "Monday", startTime: "09:00", endTime: "09:30", maxBookings: 1, name: "" };

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getSlots()
      .then(setSlots)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (slot) => {
    setEditTarget(slot);
    setForm({ day: slot.day || "Monday", startTime: slot.startTime || "09:00", endTime: slot.endTime || "09:30", maxBookings: slot.maxBookings || 1, name: slot.name || "" });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.startTime || !form.endTime) return;
    setFormLoading(true);
    setFormError(null);
    try {
      editTarget ? await updateSlot(editTarget.id, form) : await createSlot(form);
      setFormOpen(false);
      load();
    } catch (e) { setFormError(e.message); }
    finally { setFormLoading(false); }
  };

  const handleToggle = async (slot) => {
    try { await toggleSlot(slot.id); load(); }
    catch (e) { alert(e.message); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await deleteSlot(deleteTarget.id); setDeleteTarget(null); load(); }
    catch (e) { alert(e.message); }
    finally { setDeleteLoading(false); }
  };

  const f = (v) => (e) => setForm((p) => ({ ...p, [v]: e.target.value }));

  const activeCount = slots.filter((s) => s.isActive).length;

  const visibleDays = DAYS.filter((d) => {
    if (filter && d !== filter) return false;
    return slots.some((s) => (s.day || "Monday") === d);
  });

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Time slots"
        subtitle={`${slots.length} slots · ${activeCount} active`}
        actions={
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add slot</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {error && (
          <div className="card-inner px-4 py-3 border-accent-red/30 bg-accent-red/5 text-accent-red text-sm">{error}</div>
        )}

        {/* Day filter pills — scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          <button
            onClick={() => setFilter("")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filter ? "bg-accent-green/15 text-accent-green" : "text-text-muted hover:text-text-primary"}`}
          >
            All days
          </button>
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(filter === d ? "" : d)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === d ? "bg-accent-green/15 text-accent-green" : "text-text-muted hover:text-text-primary"}`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading slots…</div>
        ) : slots.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <p className="text-text-muted text-sm mb-3">No slots configured yet.</p>
            <button onClick={openAdd} className="btn-primary">Add your first slot</button>
          </div>
        ) : (
          visibleDays.map((day) => {
            const daySlots = slots.filter((s) => (s.day || "Monday") === day);
            return (
              <div key={day} className="card overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b border-border bg-surface-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">{day}</h3>
                  <span className="text-xs text-text-muted">{daySlots.length} slot{daySlots.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="divide-y divide-border">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="px-4 sm:px-5 py-3 sm:py-3.5">
                      {/* Desktop row */}
                      <div className="hidden sm:flex items-center gap-4">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(slot)}
                          className={`w-9 h-5 rounded-full flex-shrink-0 relative transition-colors ${slot.isActive ? "bg-accent-green" : "bg-surface-3 border border-border"}`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${slot.isActive ? "left-[18px]" : "left-0.5"}`} />
                        </button>
                        <span className="font-mono text-sm text-accent-green w-32 flex-shrink-0">{slot.startTime} – {slot.endTime}</span>
                        <span className="flex-1 text-sm text-text-secondary truncate">{slot.name || <span className="italic text-text-muted">Unnamed slot</span>}</span>
                        <span className="text-xs text-text-muted flex-shrink-0 flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          {slot.maxBookings ?? 1} max
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${slot.isActive ? "text-accent-green bg-accent-green/10 border-accent-green/25" : "text-text-muted bg-surface-2 border-border"}`}>
                          {slot.isActive ? "Active" : "Disabled"}
                        </span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button onClick={() => openEdit(slot)} className="text-xs text-text-muted hover:text-accent-blue transition-colors">Edit</button>
                          <span className="text-border">·</span>
                          <button onClick={() => setDeleteTarget(slot)} className="text-xs text-text-muted hover:text-accent-red transition-colors">Delete</button>
                        </div>
                      </div>

                      {/* Mobile card row */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggle(slot)}
                              className={`w-9 h-5 rounded-full flex-shrink-0 relative transition-colors ${slot.isActive ? "bg-accent-green" : "bg-surface-3 border border-border"}`}
                            >
                              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${slot.isActive ? "left-[18px]" : "left-0.5"}`} />
                            </button>
                            <div>
                              <p className="font-mono text-sm text-accent-green">{slot.startTime} – {slot.endTime}</p>
                              <p className="text-xs text-text-muted mt-0.5">{slot.name || "Unnamed slot"} · {slot.maxBookings ?? 1} max</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${slot.isActive ? "text-accent-green bg-accent-green/10 border-accent-green/25" : "text-text-muted bg-surface-2 border-border"}`}>
                            {slot.isActive ? "Active" : "Off"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
                          <button onClick={() => openEdit(slot)} className="text-xs text-accent-blue">Edit</button>
                          <button onClick={() => setDeleteTarget(slot)} className="text-xs text-accent-red">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setFormError(null); }}
        title={editTarget ? "Edit slot" : "Add new slot"}
        footer={
          <>
            <button onClick={() => { setFormOpen(false); setFormError(null); }} className="btn-ghost">Cancel</button>
            <button onClick={handleSubmit} disabled={formLoading || !form.startTime || !form.endTime} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              {formLoading ? "Saving…" : editTarget ? "Save changes" : "Add slot"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Slot name (optional)</label>
            <input type="text" placeholder="e.g. Morning slot" value={form.name} onChange={f("name")} className="input" />
          </div>
          <div>
            <label className="label">Day</label>
            <select value={form.day} onChange={f("day")} className="input">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start time</label>
              <input type="time" value={form.startTime} onChange={f("startTime")} className="input" />
            </div>
            <div>
              <label className="label">End time</label>
              <input type="time" value={form.endTime} onChange={f("endTime")} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Max bookings per slot</label>
            <input type="number" min={1} max={100} value={form.maxBookings} onChange={f("maxBookings")} className="input" />
          </div>
          {formError && <p className="text-xs text-accent-red">{formError}</p>}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete slot"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)} className="btn-ghost">Keep it</button>
            <button onClick={handleDelete} disabled={deleteLoading} className="btn-danger">
              {deleteLoading ? "Deleting…" : "Delete slot"}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-text-secondary">
            Delete the <span className="text-text-primary font-medium">{deleteTarget.startTime}–{deleteTarget.endTime}</span> slot on <span className="text-text-primary">{deleteTarget.day}</span>? This cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
