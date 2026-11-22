const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" in the user's local time zone. */
export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO() {
  return toISO(new Date());
}

/** "YYYY-MM-DD" for today + n days. */
export function addDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** "2026-11-22" -> "22 Nov 2026" */
export function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-").map(Number);
  if (!y || !m || !d) return String(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "14:30" -> "2:30 PM" */
export function formatTime(time) {
  if (!time) return "—";
  const [h, m] = String(time).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return String(time);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`;
}

/** "21 Nov 2026, 5:30 PM" for the current moment. */
export function nowLabel() {
  const d = new Date();
  return `${formatDate(toISO(d))}, ${formatTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`;
}

/**
 * Where an event is in its registration window.
 * state: "open" | "soon" | "closed"
 */
export function registrationState(event, today = todayISO()) {
  const start = event.registrationStartDate || "";
  const end = event.registrationDeadline || event.date || "";

  if (event.date && event.date < today) {
    return { state: "closed", label: "Event completed" };
  }
  if (start && today < start) {
    return { state: "soon", label: `Opens ${formatDate(start)}` };
  }
  if (end && today > end) {
    return { state: "closed", label: "Registration closed" };
  }
  return { state: "open", label: "Registration open" };
}
