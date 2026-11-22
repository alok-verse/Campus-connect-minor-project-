import { formatDate, formatTime, registrationState } from "../utils/dates";

export default function EventCard({ event, registered, onOpen }) {
  const window_ = registrationState(event);
  const paid = event.feeType === "Amount" && Number(event.amount) > 0;

  let status = { text: window_.label, tone: window_.state };
  if (registered) status = { text: "✓ Registered", tone: "registered" };

  return (
    <article className="event-card">
      {event.bannerData ? (
        <img className="event-banner" src={event.bannerData} alt="" loading="lazy" />
      ) : (
        <div className="event-icon" aria-hidden="true">{event.icon || "🎓"}</div>
      )}

      <div className="event-card-top">
        <span className="event-category">{event.category || "Campus Event"}</span>
        <span className={`status-chip status-${status.tone}`}>{status.text}</span>
      </div>

      <h3>{event.title}</h3>

      <p>📅 {formatDate(event.date)} · {formatTime(event.time)}</p>
      <p>📍 {event.venue}</p>
      <p>🏫 {event.organizer}</p>
      <p>💰 {paid ? `₹${event.amount}` : "Free"}</p>

      <button type="button" className="register-btn" onClick={() => onOpen(event)}>
        View Details →
      </button>
    </article>
  );
}
