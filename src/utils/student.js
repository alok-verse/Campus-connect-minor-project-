import { YEARS } from "../config";

/**
 * SBU IDs look like SBU2400680: "SBU" + joining year (24 = 2024) + 5-digit number.
 * Academic years start around June, so we work the current year of study
 * out from the joining year. Students can correct it in their profile.
 */
export function deriveYear(studentId, now = new Date()) {
  const joined = 2000 + Number(studentId.slice(3, 5));
  const year = now.getFullYear() - joined + (now.getMonth() >= 5 ? 1 : 0);
  return YEARS[Math.min(4, Math.max(1, year)) - 1];
}

export function createStudent(id) {
  return {
    id,
    name: `Student ${id.slice(-5)}`,
    email: `${id.toLowerCase()}@sbu.ac.in`,
    year: deriveYear(id),
    course: "",
  };
}

/** Is this student allowed to join the event? (Only batch-restricted events say no.) */
export function eligibility(event, student) {
  const restricted =
    event.audience === "Specific Batch" && event.year === "Other" && event.specificYear;

  if (!restricted) return { ok: true, label: "All students" };

  const label = `${event.specificYear} students only`;
  if (!student) return { ok: true, label };
  return student.year === event.specificYear
    ? { ok: true, label }
    : { ok: false, label, reason: `This event is only for ${event.specificYear} students.` };
}

export function initialOf(name) {
  return (name || "?").trim().charAt(0).toUpperCase() || "?";
}
