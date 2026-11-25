import {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { RegistrationContext } from "./registration-context";
import { useAuth } from "./useAuth";

import {
  registerForEvent,
  getMyRegistrations,
  cancelRegistration,
} from "../services/registrationApi";

import {
  toFrontendRegistration,
} from "../utils/registrationMapper";

export default function RegistrationProvider({ children }) {
  const { studentToken } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [loadedToken, setLoadedToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load registrations from MongoDB
  useEffect(() => {
    let active = true;

    setRegistrations([]);
    setLoadedToken(null);
    setError("");

    if (!studentToken) {
      setLoading(false);
      return;
    }

    async function loadRegistrations() {
      try {
        setLoading(true);

        const data = await getMyRegistrations(studentToken);

        if (active) {
          setRegistrations(
            data.map(toFrontendRegistration)
          );
          setLoadedToken(studentToken);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRegistrations();

    return () => {
      active = false;
    };
  }, [studentToken]);

  // Only show active registrations for this session
  const mine = useMemo(
    () =>
      studentToken && loadedToken === studentToken
        ? registrations.filter(
            (item) => item.status !== "cancelled"
          )
        : [],
    [registrations, studentToken, loadedToken]
  );

  // Check whether a student is already registered
  const isRegistered = useCallback(
    (eventId) =>
      mine.some((item) => item.id === eventId),
    [mine]
  );

  // Register for an event
  const register = useCallback(
    async (event) => {
      if (!studentToken) {
        return {
          ok: false,
          error: "Please log in to register.",
        };
      }

      try {
        const data = await registerForEvent(
          event.id,
          studentToken
        );

        const ticket = toFrontendRegistration(data);

        setRegistrations((current) => [
          ...current.filter(
            (item) =>
              item.registrationId !== ticket.registrationId
          ),
          ticket,
        ]);

        setLoadedToken(studentToken);

        return {
          ok: true,
          ticket,
        };
      } catch (err) {
        return {
          ok: false,
          error: err.message,
        };
      }
    },
    [studentToken]
  );

  // Cancel registration
  const cancel = useCallback(
    async (ticketId) => {
      if (!studentToken) {
        return {
          ok: false,
          error: "Please log in.",
        };
      }

      const item = mine.find(
        (registration) =>
          registration.ticketId === ticketId
      );

      if (!item) {
        return {
          ok: false,
          error: "Registration not found.",
        };
      }

      try {
        const data = await cancelRegistration(
          item.registrationId,
          studentToken
        );

        const updated = toFrontendRegistration(data);

        setRegistrations((current) =>
          current.map((registration) =>
            registration.registrationId ===
            updated.registrationId
              ? updated
              : registration
          )
        );

        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          error: err.message,
        };
      }
    },
    [studentToken, mine]
  );

  const value = {
    all: mine,
    mine,
    isRegistered,
    register,
    cancel,
    loading,
    error,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}