// Shared constants used by both the student site and the admin panel.

export const UNIVERSITY = "Sarala Birla University";

export const CATEGORIES = [
  "Workshop",
  "Seminar",
  "Competition",
  "Cultural",
  "Sports",
  "Other",
];

export const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export const MODES = ["Offline", "Online", "Hybrid"];

// localStorage keys. The first group keeps the names the admin panel already
// used, so events created during development are still there after merging.
export const KEYS = {
  events: "campusEvents",
  archive: "campusEventArchive",
  notifications: "campusNotifications",
  registrations: "campusRegistrations",
  adminTheme: "adminDarkMode",
  loginTheme: "campusLoginDarkMode",

  students: "campusStudents", // profiles, keyed by student ID
  studentSession: "campusStudentSession", // ID of the logged-in student
  adminSession: "campusAdminSession", // true while an admin is logged in
  studentTheme: "campusStudentTheme", // true = dark / glass theme
  seeded: "campusSeeded", // sample data has been loaded once
  notifSeenPrefix: "campusNotifSeen:", // + student ID
};
