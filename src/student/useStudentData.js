import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getEvents } from "../services/eventApi";
import { toFrontendEvent } from "../utils/eventMapper";
import { KEYS } from "../config";
import { useAuth } from "../context/useAuth";
import { EMPTY_LIST, useStored } from "../utils/storage";
import { todayISO } from "../utils/dates";
import { RegistrationContext } from "../context/registration-context";

const byDate = (a, b) =>
  `${a.date || ""} ${a.time || ""}`.localeCompare(
    `${b.date || ""} ${b.time || ""}`
  );

// Fetch events from MongoDB
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const data = await getEvents();
        const mappedEvents = data.map(toFrontendEvent);

        if (active) {
          setEvents(mappedEvents);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          console.error("Failed to load events:", err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const upcoming = useMemo(() => {
    const today = todayISO();

    return events
      .filter(
        (event) =>
          !event.archived &&
          event.status === "upcoming" &&
          event.date &&
          event.date >= today
      )
      .sort(byDate);
  }, [events]);

  return { events, upcoming, loading, error };
}

// Shared MongoDB registrations
export function useRegistrations() {
  const context = useContext(RegistrationContext);

  if (!context) {
    throw new Error(
      "useRegistrations must be used inside RegistrationProvider"
    );
  }

  return context;
}

// Existing notification functionality
export function useNotifications() {
  const { student } = useAuth();

  const [all] = useStored(
    KEYS.notifications,
    EMPTY_LIST
  );

  const [seenId, setSeenId] = useStored(
    KEYS.notifSeenPrefix + (student?.id ?? "guest"),
    0
  );

  const visible = useMemo(
    () =>
      student
        ? all.filter(
            (item) =>
              item.audience !== "Specific Year" ||
              item.year === student.year
          )
        : [],
    [all, student]
  );

  const unread = useMemo(
    () =>
      visible.filter((item) => item.id > seenId).length,
    [visible, seenId]
  );

  const markAllRead = useCallback(() => {
    const newest = visible.reduce(
      (max, item) => Math.max(max, item.id),
      0
    );

    if (newest > seenId) {
      setSeenId(newest);
    }
  }, [visible, seenId, setSeenId]);

  return {
    visible,
    unread,
    seenId,
    markAllRead,
  };
}