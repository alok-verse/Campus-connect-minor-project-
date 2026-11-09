
function EventCard({ event }) {
  return (
    <div className="event-card">
      <div className="event-icon">{event.icon}</div>

      <span className="event-category">
        {event.category}
      </span>

      <h3>{event.title}</h3>

      <p>📅 {event.date}</p>
      <p>📍 {event.venue}</p>
      <p>🏫 {event.organizer}</p>

      <button className="register-btn">
        View Details →
      </button>
    </div>
  );
}

export default EventCard;
