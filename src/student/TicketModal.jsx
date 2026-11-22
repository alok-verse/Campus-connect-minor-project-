import Modal from "./Modal";
import { formatDate, formatTime } from "../utils/dates";

export default function TicketModal({ ticket, onClose }) {
  if (!ticket) return null;
  const paid = ticket.feeType === "Amount" && Number(ticket.amount) > 0;

  return (
    <Modal onClose={onClose} labelledBy="ticket-title" className="ticket-modal">
      <div className="ticket">
        <div className="ticket-head">
          <span className="ticket-label">EVENT TICKET</span>
          <span className="ticket-icon" aria-hidden="true">{ticket.icon || "🎓"}</span>
          <h2 id="ticket-title">{ticket.title}</h2>
        </div>

        <dl className="ticket-grid">
          <div><dt>Date</dt><dd>{formatDate(ticket.date)}</dd></div>
          <div><dt>Time</dt><dd>{formatTime(ticket.time)}</dd></div>
          <div className="ticket-wide"><dt>Venue</dt><dd>{ticket.venue}</dd></div>
          <div><dt>Name</dt><dd>{ticket.studentName}</dd></div>
          <div><dt>Student ID</dt><dd>{ticket.studentId || "—"}</dd></div>
          <div><dt>Fee</dt><dd>{paid ? `₹${ticket.amount}` : "Free"}</dd></div>
          <div><dt>Registered On</dt><dd>{ticket.registeredOn || "—"}</dd></div>
        </dl>

        <div className="ticket-cut" aria-hidden="true" />

        <div className="ticket-foot">
          <span>Ticket ID</span>
          <strong>{ticket.ticketId}</strong>
          <div className="ticket-bars" aria-hidden="true" />
          <small>Show this ticket at the venue.</small>
        </div>
      </div>
    </Modal>
  );
}
