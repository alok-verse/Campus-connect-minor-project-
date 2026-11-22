import { KEYS, UNIVERSITY } from "../config";
import { addDays, formatDate, nowLabel, todayISO } from "./dates";
import { readStored, writeStored, EMPTY_LIST } from "./storage";

/*
  Sample data so the site never looks empty (handy for presentations).
  Dates are relative to today, so the events are always upcoming.
*/

function sampleEvent(index, fields) {
  const now = Date.now();
  return {
    id: now + index,
    organizer: "",
    phone: "",
    email: "",
    college: UNIVERSITY,
    icon: "🎓",
    category: "Workshop",
    mode: "Offline",
    year: "All",
    specificYear: "",
    audience: "All Students",
    feeType: "Free",
    amount: "",
    dressCode: "",
    payment: "Both",
    highlights: "",
    instructions: "",
    terms: true,
    bannerName: "",
    qrName: "",
    bannerData: "",
    qrData: "",
    createdAt: formatDate(todayISO()),
    createdAtISO: new Date().toISOString(),
    archived: false,
    ...fields,
  };
}

export function buildSampleEvents() {
  return [
    sampleEvent(0, {
      title: "Web Development Workshop",
      category: "Workshop",
      icon: "💻",
      organizer: "CSE Department",
      venue: "Computer Lab",
      date: addDays(5),
      time: "10:00",
      registrationStartDate: addDays(-3),
      registrationDeadline: addDays(3),
      feeType: "Amount",
      amount: "100",
      payment: "Offline",
      description:
        "Join our Web Development Workshop and learn how to create modern, responsive websites. This workshop introduces students to the basics of HTML, CSS and JavaScript through practical demonstrations and hands-on activities.",
      highlights:
        "Basics of HTML and CSS\nWebsite designing\nIntroduction to JavaScript\nCreating a simple webpage",
      instructions:
        "Bring your laptop if available. Limited seats are available. Register before the deadline.",
    }),
    sampleEvent(1, {
      title: "AI & Machine Learning Seminar",
      category: "Seminar",
      icon: "🤖",
      organizer: "Tech Club",
      venue: "College Auditorium",
      date: addDays(8),
      time: "11:30",
      registrationStartDate: addDays(-2),
      registrationDeadline: addDays(6),
      description:
        "An introductory seminar on how modern AI and machine learning systems work, where they are used today, and how students can start building skills in the field.",
      highlights:
        "How machine learning models learn from data\nReal-world applications of AI\nSkills to build for a career in AI\nOpen question and answer session",
      instructions: "Seats are filled on a first-come, first-served basis.",
    }),
    sampleEvent(2, {
      title: "National Coding Competition",
      category: "Competition",
      icon: "🏆",
      organizer: "Coding Club",
      venue: "Online",
      mode: "Online",
      date: addDays(12),
      time: "14:00",
      registrationStartDate: addDays(-1),
      registrationDeadline: addDays(10),
      description:
        "Test your problem-solving skills in a timed coding competition. Solve algorithmic challenges, climb the leaderboard and compete with fellow students.",
      highlights:
        "Timed algorithmic challenges\nLive leaderboard\nChoose the language you are comfortable with",
      instructions: "Make sure you have a stable internet connection before the contest starts.",
    }),
    sampleEvent(3, {
      title: "Coding Quest",
      category: "Competition",
      icon: "🧩",
      organizer: "Coding Club",
      venue: "SBU Campus",
      date: addDays(16),
      time: "10:00",
      registrationStartDate: addDays(-1),
      registrationDeadline: addDays(14),
      description:
        "An on-campus coding challenge where teams solve a series of puzzles and programming tasks against the clock.",
      highlights:
        "Team-based puzzle and coding rounds\nHands-on problem solving under time limits\nMeet and compete with fellow coders",
    }),
    sampleEvent(4, {
      title: "Battle of Bands",
      category: "Cultural",
      icon: "🎸",
      organizer: "SBU",
      venue: "SBU Campus",
      date: addDays(20),
      time: "17:00",
      registrationStartDate: addDays(-1),
      registrationDeadline: addDays(18),
      description:
        "Bands from across campus take the stage in a live music showdown. Bring your instruments, your energy and your best set.",
      highlights: "Live performances on stage\nOpen to student bands\nCheer on your favourites",
    }),
    sampleEvent(5, {
      title: "Reel Making Competition",
      category: "Competition",
      icon: "🎬",
      organizer: "SBU",
      venue: "SBU Campus",
      date: addDays(24),
      time: "12:00",
      registrationStartDate: addDays(2),
      registrationDeadline: addDays(20),
      description:
        "Show off your creativity by making a short reel around the theme of campus life. Plan, shoot, edit and share your best story.",
      highlights: "Plan, shoot and edit your own reel\nShowcase your creativity\nFun for beginners and creators alike",
      instructions: "Registrations open soon. Keep an eye on this page.",
    }),
  ];
}

export function buildSampleNotifications() {
  const now = Date.now();
  return [
    {
      id: now + 1,
      title: "Registrations open: Web Development Workshop",
      message:
        "Registrations are now open for the Web Development Workshop. Seats are limited, so register before the deadline.",
      type: "Important",
      audience: "All Students",
      year: "",
      relatedEvent: "Web Development Workshop",
      createdAt: nowLabel(),
    },
    {
      id: now,
      title: "Welcome to Campus Connect!",
      message:
        "Discover upcoming campus events, register in a few clicks and keep all your tickets in one place.",
      type: "General",
      audience: "All Students",
      year: "",
      relatedEvent: "",
      createdAt: nowLabel(),
    },
  ];
}

/** Replaces all event data with the sample set. */
export function loadSampleData() {
  writeStored(KEYS.events, buildSampleEvents());
  writeStored(KEYS.archive, []);
  writeStored(KEYS.notifications, buildSampleNotifications());
  writeStored(KEYS.registrations, []);
  writeStored(KEYS.seeded, true);
}

/** Removes every event, notification and registration (profiles and sessions stay). */
export function clearEventData() {
  writeStored(KEYS.events, []);
  writeStored(KEYS.archive, []);
  writeStored(KEYS.notifications, []);
  writeStored(KEYS.registrations, []);
  writeStored(KEYS.seeded, true);
}

/** Runs once per browser: loads sample data only if nothing exists yet. */
export function ensureSeedData() {
  if (readStored(KEYS.seeded, false)) return;

  const hasData =
    readStored(KEYS.events, EMPTY_LIST).length > 0 ||
    readStored(KEYS.archive, EMPTY_LIST).length > 0;

  if (hasData) {
    writeStored(KEYS.seeded, true);
  } else {
    loadSampleData();
  }
}

