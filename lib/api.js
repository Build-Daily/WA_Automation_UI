const BASE = "/api";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats  = () => apiFetch("/dashboard/stats");
export const getUpcomingToday   = () => apiFetch("/dashboard/upcoming");

// ─── Appointments ─────────────────────────────────────────────────────────────
export const getAppointments = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return apiFetch(`/appointments${qs ? `?${qs}` : ""}`);
};

export const cancelAppointment = (id) =>
  apiFetch(`/appointments/${id}/cancel`, { method: "PUT" });

/**
 * @param {string} id  — appointment UUID
 * @param {{ newDate: string, newTime: string }} body
 *   newDate: "YYYY-MM-DD"
 *   newTime: "HH:MM"  e.g. "09:00"
 */
export const rescheduleAppointment = (id, body) =>
  apiFetch(`/appointments/${id}/reschedule`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

// ─── Slots ────────────────────────────────────────────────────────────────────
export const getSlots    = ()        => apiFetch("/slots");
export const createSlot  = (body)    => apiFetch("/slots", { method: "POST", body: JSON.stringify(body) });
export const updateSlot  = (id, body)=> apiFetch(`/slots/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteSlot  = (id)      => apiFetch(`/slots/${id}`, { method: "DELETE" });
export const toggleSlot  = (id)      => apiFetch(`/slots/${id}/toggle`, { method: "PATCH" });

// ─── Patients ─────────────────────────────────────────────────────────────────
export const getPatients = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return apiFetch(`/patients${qs ? `?${qs}` : ""}`);
};
