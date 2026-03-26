# Backend API Contract

This file documents every endpoint the `WA_Automation_UI` dashboard expects from the Node.js/Express backend running on `localhost:3000`.

All responses should be JSON. All endpoints are prefixed `/api/`. The Next.js dev server proxies `/api/*` → `http://localhost:3000/api/*` via `next.config.js` rewrites.

---

## Dashboard

### `GET /api/dashboard/stats`
Returns summary counters for today.

**Response:**
```json
{
  "todayTotal":   12,
  "confirmed":    8,
  "pending":      3,
  "cancelled":    1,
  "messagesOut":  24,
  "newToday":     5
}
```

---

### `GET /api/dashboard/upcoming`
Returns today's remaining appointments in chronological order.

**Response:** `Appointment[]` (see Appointment shape below)

---

## Appointments

### `GET /api/appointments`
Returns a paginated/filtered list of all appointments.

**Query params (all optional):**
| Param    | Type   | Description                        |
|----------|--------|------------------------------------|
| `status` | string | Filter by status string            |
| `date`   | string | ISO date string `YYYY-MM-DD`       |
| `search` | string | Partial match on name or phone     |

**Response:**
```json
{
  "data":  [ ...Appointment ],
  "total": 42
}
```

**Appointment shape:**
```json
{
  "id":              1,
  "patientName":     "Sarah Connor",
  "phone":           "+91 98765 43210",
  "date":            "2026-03-26",
  "time":            "10:00",
  "slotId":          3,
  "slotName":        "Morning slot",
  "status":          "confirmed",
  "notes":           "Follow-up visit"
}
```

**Status values:** `confirmed` | `pending` | `cancelled` | `rescheduled` | `completed`

---

### `PUT /api/appointments/:id/cancel`
Marks the appointment as cancelled and triggers a WhatsApp notification.

**Response:**
```json
{ "success": true, "id": 1 }
```

---

### `PUT /api/appointments/:id/reschedule`
Reschedules the appointment to a new date and slot.

**Request body:**
```json
{
  "newDate":   "2026-03-28",
  "newSlotId": 5
}
```

**Response:**
```json
{ "success": true, "id": 1 }
```

---

## Slots

### `GET /api/slots`
Returns all configured time slots.

**Response:** `Slot[]`

**Slot shape:**
```json
{
  "id":          3,
  "name":        "Morning slot",
  "day":         "Monday",
  "startTime":   "09:00",
  "endTime":     "09:30",
  "maxBookings": 2,
  "isActive":    true
}
```

**`day` values:** `Monday` | `Tuesday` | `Wednesday` | `Thursday` | `Friday` | `Saturday` | `Sunday`

---

### `POST /api/slots`
Creates a new slot.

**Request body:**
```json
{
  "name":        "Afternoon slot",
  "day":         "Wednesday",
  "startTime":   "14:00",
  "endTime":     "14:30",
  "maxBookings": 1
}
```

**Response:** Created `Slot` object.

---

### `PUT /api/slots/:id`
Updates an existing slot. Accepts the same fields as `POST /api/slots`.

**Response:** Updated `Slot` object.

---

### `DELETE /api/slots/:id`
Permanently deletes a slot.

**Response:**
```json
{ "success": true }
```

---

### `PATCH /api/slots/:id/toggle`
Toggles the `isActive` field of the slot.

**Response:** Updated `Slot` object with new `isActive` value.

---

## Error responses

All endpoints should return errors in this shape so the UI can surface them:

```json
{
  "message": "Human-readable error description"
}
```

HTTP status codes: `400` for validation errors, `404` for not found, `500` for server errors.
