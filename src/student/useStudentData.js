import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getEvents } from "../services/eventApi";
import { toFrontendEvent } from "../utils/eventMapper";
import { todayISO } from "../utils/dates";
import { RegistrationContext } from "../context/registration-context";
import { NotificationContext } from "../context/notification-context";

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
// Shared MongoDB notifications
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}