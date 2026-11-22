import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useUI } from "../../context/useUI";
import { formatDate, formatTime, todayISO } from "../../utils/dates";
import { useRegistrations } from "../useStudentData";

export default function MyEvents() {
  const { openTicket } = useOutletContext();
  const { mine, cancel } = useRegistrations();
  const { confirm, toast } = useUI();

  useEffect(() => {
    document.title = "My Events | Campus Connect";
  }, []);

  const sorted = [...mine].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const today = todayISO();

  const handleCancel = async (item) => {
    const yes = await confirm({
      title: "Cancel registration?",
      message: `Your ticket for "${item.title}" will be cancelled. You can register again while registration is open.`,
      confirmText: "Cancel registration",
      cancelText: "Keep it",
      danger: true,
    });
    if (!yes) return;
    cancel(item.ticketId);
    toast("Registration cancelled.", "info");
  };

  return (
    <section className="page-section">
      <p className="tagline">YOUR EVENT ACTIVITY</p>
      <h1 className="page-title">My Registrations</h1>
      <p className="muted">Your registered events and tickets.</p>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">🎟️</span>
          <h3>No registrations yet</h3>
          <p>Explore campus events and register for your first event.</p>
          <Link to="/events" className="btn btn-primary">Explore Events</Link>
        </div>
      ) : (
        <div className="registration-list">
          {sorted.map((item) => {
            const done = item.date < today;
            return (
              <article className="registration-card" key={item.ticketId}>
                <div className="registration-icon" aria-hidden="true">{item.icon || "🎓"}</div>

                <div className="registration-info">
                  <h3>{item.title}</h3>
                  <p>📅 {formatDate(item.date)} · {formatTime(item.time)}</p>
                  <p>📍 {item.venue}</p>
                  <p className="ticket-id">Ticket: {item.ticketId}</p>
                </div>

                <div className="registration-side">
                  <span className={`status-chip ${done ? "status-closed" : "status-open"}`}>
                    {done ? "Completed" : "Upcoming"}
                  </span>
                  <div className="registration-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openTicket(item)}>
                      View Ticket
                    </button>
                    {!done && (
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleCancel(item)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
