
function EventDetailsModal({ event, onClose }) {
  if (!event) return null;

  const details = event.details;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="event-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        <span className="event-category">{event.category}</span>
        <h2>{event.title}</h2>

        <h3>About the Event</h3>
        <p>{details.about}</p>

        <h3>Event Details</h3>
        <div className="modal-info">
          <p>📅 <strong>Date:</strong> {event.date}</p>
          <p>📍 <strong>Mode:</strong> {details.mode}</p>
          <p>🏫 <strong>Venue:</strong> {event.venue}</p>
          <p>👨‍💻 <strong>Organized By:</strong> {event.organizer}</p>
          <p>🎓 <strong>Eligibility:</strong> {details.eligibility}</p>
          <p>💰 <strong>Registration Fee:</strong> {details.fee}</p>
        </div>

        <h3>What You Will Learn</h3>
        <ul>
          {details.learning.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <h3>Instructions</h3>
        <p>{details.instructions}</p>
      </div>
    </div>
  );
}

export default EventDetailsModal;
