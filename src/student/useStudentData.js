import { useCallback, useMemo } from "react";
import { KEYS } from "../config";
import { useAuth } from "../context/useAuth";
import { EMPTY_LIST, useStored } from "../utils/storage";
import { formatDate, nowLabel, registrationState, todayISO } from "../utils/dates";
import { eligibility } from "../utils/student";

const byDate = (a, b) =>
  `${a.date || ""} ${a.time || ""}`.localeCompare(`${b.date || ""} ${b.time || ""}`);

/** Active (non-archived) events created in the admin panel. */
export function useEvents() {
  const [events] = useStored(KEYS.events, EMPTY_LIST);

  const upcoming = useMemo(() => {
    const today = todayISO();
    return events.filter((event) => event.date && event.date >= today).sort(byDate);
  }, [events]);

  return { events, upcoming };
}

/** Registrations of the logged-in student, plus register / cancel actions. */
export function useRegistrations() {
  const { student } = useAuth();
  const [all, setAll] = useStored(KEYS.registrations, EMPTY_LIST);

  const mine = useMemo(
    () => (student ? all.filter((item) => item.studentId === student.id) : []),
    [all, student]
  );

  const isRegistered = useCallback(
    (eventId) => mine.some((item) => item.id === eventId),
    [mine]
  );

  const register = useCallback(
    (event) => {
      if (!student) return { ok: false, error: "Please log in to register." };

      const window_ = registrationState(event);
      if (window_.state !== "open") return { ok: false, error: window_.label + "." };

      const access = eligibility(event, student);
      if (!access.ok) return { ok: false, error: access.reason };

      let ticket = null;
      const saved = setAll((current) => {
        if (current.some((item) => item.studentId === student.id && item.id === event.id)) {
          return current;
        }
        ticket = {
          ticketId: `CC-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36).toString(36).toUpperCase()}`,
          id: event.id,
          title: event.title,
          icon: event.icon,
          category: event.category,
          date: event.date,
          time: event.time,
          venue: event.venue,
          organizer: event.organizer,
          feeType: event.feeType,
          amount: event.amount,
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email,
          studentYear: student.year,
          registeredOn: formatDate(todayISO()),
          registeredAt: nowLabel(),
        };
        return [...current, ticket];
      });

      if (!ticket) return { ok: false, error: "You have already registered for this event." };
      if (!saved) return { ok: false, error: "Could not save your registration (browser storage is full)." };
      return { ok: true, ticket };
    },
    [student, setAll]
  );

  const cancel = useCallback(
    (ticketId) => setAll((current) => current.filter((item) => item.ticketId !== ticketId)),
    [setAll]
  );

  return { all, mine, isRegistered, register, cancel };
}

/** Admin notifications that apply to the logged-in student, with an unread count. */
export function useNotifications() {
  const { student } = useAuth();
  const [all] = useStored(KEYS.notifications, EMPTY_LIST);
  const [seenId, setSeenId] = useStored(KEYS.notifSeenPrefix + (student?.id ?? "guest"), 0);

  const visible = useMemo(
    () =>
      student
        ? all.filter((item) => item.audience !== "Specific Year" || item.year === student.year)
        : [],
    [all, student]
  );

  const unread = useMemo(() => visible.filter((item) => item.id > seenId).length, [visible, seenId]);

  const markAllRead = useCallback(() => {
    const newest = visible.reduce((max, item) => Math.max(max, item.id), 0);
    if (newest > seenId) setSeenId(newest);
  }, [visible, seenId, setSeenId]);

  return { visible, unread, seenId, markAllRead };
}
