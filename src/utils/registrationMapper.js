import { toFrontendEvent } from "./eventMapper";
import { formatDate, formatTime } from "./dates";
import { YEARS } from "../config";

const TIME_ZONE = "Asia/Kolkata";

export function toFrontendRegistration(registration) {
  const student = registration.studentId || {};
  const event = toFrontendEvent(
    registration.eventId || {}
  );

  const amount = Number(registration.amount || 0);

  const registeredDate = new Date(
    registration.registeredAt
  );

  const dateParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(registeredDate);

  const get = (type) =>
    dateParts.find((part) => part.type === type)?.value;

  const dateISO =
    `${get("year")}-${get("month")}-${get("day")}`;

  const timeISO = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(registeredDate);

  const studentYear =
    YEARS[Math.ceil(student.semester / 2) - 1] || "";

  return {
    // Registration identity
    registrationId: String(registration._id),
    ticketId: registration.ticketId,

    // Event details
    id: event.id,
    title: event.title,
    icon: event.icon || "🎓",
    category: event.category,
    date: event.date,
    time: event.time,
    venue: event.venue,
    organizer: event.organizer,
    eventStatus: event.status,

    // Payment details
    feeType: amount > 0 ? "Amount" : "Free",
    amount: amount > 0 ? String(amount) : "",
    paymentStatus: registration.paymentStatus,

    // Student details
    studentId: student.studentId,
    studentObjectId: String(student._id || ""),
    studentName: student.name || "",
    studentEmail: student.email || "",
    studentYear,
    department: student.department || "",
    semester: student.semester,

    // Registration details
    status: registration.status,
    registeredOn: formatDate(dateISO),
    registeredAt:
      `${formatDate(dateISO)}, ${formatTime(timeISO)}`,

    registeredAtISO: registration.registeredAt,
    cancelledAt: registration.cancelledAt,
  };
}