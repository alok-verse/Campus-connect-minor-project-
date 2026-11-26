
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { NotificationContext } from "./notification-context";
import { useAuth } from "./useAuth";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationApi";

import {
  toFrontendNotification,
} from "../utils/notificationMapper";

export default function NotificationProvider({ children }) {
  const { studentToken } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loadedToken, setLoadedToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestId = useRef(0);
  const activeToken = useRef(null);

  // Fetch notifications from MongoDB
  const refreshNotifications = useCallback(async () => {
    if (!studentToken) return;

    const id = ++requestId.current;

    try {
      const data = await getNotifications(studentToken);

      if (
        id !== requestId.current ||
        activeToken.current !== studentToken
      ) return;

      setNotifications(
        data.notifications.map(toFrontendNotification)
      );

      setLoadedToken(studentToken);
      setError("");

    } catch (err) {
      if (
        id === requestId.current &&
        activeToken.current === studentToken
      ) {
        setError(err.message);
      }
    } finally {
      if (
        id === requestId.current &&
        activeToken.current === studentToken
      ) {
        setLoading(false);
      }
    }
  }, [studentToken]);

  // Load notifications and refresh every 30 seconds
  useEffect(() => {
    activeToken.current = studentToken;

    setNotifications([]);
    setLoadedToken(null);
    setError("");

    if (!studentToken) {
      setLoading(false);
      return;
    }

    setLoading(true);

    refreshNotifications();

    const interval = setInterval(
      refreshNotifications,
      30000
    );

    window.addEventListener(
      "focus",
      refreshNotifications
    );

    return () => {
      requestId.current++;
      activeToken.current = null;

      clearInterval(interval);

      window.removeEventListener(
        "focus",
        refreshNotifications
      );
    };
  }, [studentToken, refreshNotifications]);

  // Only display notifications for the current session
  const visible = useMemo(
    () =>
      studentToken && loadedToken === studentToken
        ? notifications
        : [],
    [notifications, studentToken, loadedToken]
  );

  // Calculate unread notifications
  const unread = useMemo(
    () =>
      visible.filter((item) => !item.isRead).length,
    [visible]
  );

  // Mark one notification as read
  const markAsRead = useCallback(
    async (id) => {
      if (!studentToken) return false;

      try {
        await markNotificationAsRead(id, studentToken);

        if (activeToken.current !== studentToken) {
          return false;
        }

        await refreshNotifications();

        return true;

      } catch (err) {
        if (activeToken.current === studentToken) {
          setError(err.message);
        }

        return false;
      }
    },
    [studentToken, refreshNotifications]
  );

  // Mark all notifications as read
  const markAllRead = useCallback(async () => {
    if (!studentToken) return false;

    try {
      await markAllNotificationsAsRead(studentToken);

      if (activeToken.current !== studentToken) {
        return false;
      }

      await refreshNotifications();

      return true;

    } catch (err) {
      if (activeToken.current === studentToken) {
        setError(err.message);
      }

      return false;
    }
  }, [studentToken, refreshNotifications]);

  const value = useMemo(
    () => ({
      visible,
      unread,
      loading,
      error,
      markAsRead,
      markAllRead,
      refreshNotifications,
    }),
    [
      visible,
      unread,
      loading,
      error,
      markAsRead,
      markAllRead,
      refreshNotifications,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
