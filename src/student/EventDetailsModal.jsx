import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Modal from "./Modal";
import { useAuth } from "../context/useAuth";
import { useUI } from "../context/useUI";
import { formatDate, formatTime, registrationState } from "../utils/dates";
import { eligibility } from "../utils/student";
import { useRegistrations } from "./useStudentData";

export default function EventDetailsModal({ event, onClose, onViewTicket }) {
  const { student } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
 const { mine, register, loading } = useRegistrations();
const [registering, setRegistering] = useState(false);

  if (!event) return null;

  const ticket = mine.find((item) => item.id === event.id);
  const window_ = registrationState(event);
  const access = eligibility(event, student);
  const paid = event.feeType === "Amount" && Number(event.amount) > 0;
  const highlights = (event.highlights || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const showQr = paid && event.payment !== "Offline" && event.qrData;

  const handleRegister = async () => {
  if (registering || loading) return;

  setRegistering(true);

  try {
    const result = await register(event);

    if (result.ok) {
      toast(`You're registered! Ticket ${result.ticket.ticketId}`);
    } else {
      toast(result.error, "error");
    }
  } catch (err) {
    toast(err.message, "error");
  } finally {
    setRegistering(false);
  }
};

  const goToLogin = () => {
    onClose();
    navigate("/login", { state: { from: location.pathname } });
  };

  let action;
  if (ticket) {
    action = (
      <div className="modal-actions">
        <button type="button" className="btn btn-success" disabled>✓ Already Registered</button>
        <button type="button" className="btn btn-outline" onClick={() => onViewTicket(ticket)}>
          View Ticket
        </button>
      </div>
    );
  } else if (window_.state !== "open") {
    action = (
      <button type="button" className="btn btn-primary btn-block" disabled>
        {window_.label}
      </button>
    );
  } else if (!student) {
    action = (
      <button
  type="button"
  className="btn btn-primary btn-block"
  onClick={handleRegister}
  disabled={registering || loading}
>
  {registering
    ? "Registering..."
    : loading
    ? "Loading..."
    : "Register Now →"}
</button>
    );
  } else if (!access.ok) {
    action = (
      <>
        <button type="button" className="btn btn-primary btn-block" disabled>Not eligible</button>
        <p className="modal-note">{access.reason}</p>
      </>
    );
  } else {
    action = (
      <button type="button" className="btn btn-primary btn-block" onClick={handleRegister}>
        Register Now →
      </button>
    );
  }

  const details = [
    ["📅", "Date", formatDate(event.date)],
    ["🕒", "Time", formatTime(event.time)],
    ["📍", "Venue", event.venue],
    ["💻", "Mode", event.mode || "Offline"],
    ["👨‍💻", "Organized By", event.organizer],
    ["🎓", "Eligibility", access.label],
    ["💰", "Registration Fee", paid ? `₹${event.amount}` : "Free"],
    paid && ["💳", "Payment", `${event.payment} payment`],
    event.dressCode && ["👔", "Dress Code", event.dressCode],
    [
      "📝",
      "Registration",
      `${formatDate(event.registrationStartDate)} – ${formatDate(event.registrationDeadline)}`,
    ],
    event.phone && ["📞", "Phone", event.phone],
    event.email && ["✉️", "Email", event.email],
  ].filter(Boolean);

  return (
    <Modal onClose={onClose} labelledBy="event-modal-title" className="event-modal">
      {event.bannerData && <img className="modal-banner" src={event.bannerData} alt="" />}

      <div className="modal-heading">
        <span className="modal-icon" aria-hidden="true">{event.icon || "🎓"}</span>
        <div>
          <span className="event-category">{event.category || "Campus Event"}</span>
          <h2 id="event-modal-title">{event.title}</h2>
        </div>
      </div>

      <h3>About the Event</h3>
      <p className="pre-line">{event.description}</p>

      <h3>Event Details</h3>
      <dl className="modal-info">
        {details.map(([icon, label, value]) => (
          <div key={label}>
            <dt>
              <span aria-hidden="true">{icon}</span> {label}
            </dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {highlights.length > 0 && (
        <>
          <h3>Highlights</h3>
          <ul>
            {highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {event.instructions && (
        <>
          <h3>Instructions</h3>
          <p className="pre-line">{event.instructions}</p>
        </>
      )}

      {showQr && (
        <>
          <h3>Pay Online</h3>
          <div className="modal-qr">
            <img src={event.qrData} alt="Payment QR code" />
            <p>Scan the QR code to pay ₹{event.amount}.</p>
          </div>
        </>
      )}

      <div className="modal-footer">{action}</div>
    </Modal>
  );
}
