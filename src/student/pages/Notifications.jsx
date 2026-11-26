
import { useEffect, useState } from "react";
import { useNotifications } from "../useStudentData";

export default function Notifications() {
  const {
    visible,
    unread,
    loading,
    error,
    markAsRead,
    markAllRead,
    refreshNotifications,
  } = useNotifications();

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    document.title = "Notifications | Campus Connect";
  }, []);

  const handleMarkAllRead = async () => {
    setUpdating(true);

    try {
      await markAllRead();
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    setUpdating(true);

    try {
      await markAsRead(id);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <section className="page-section">
      <p className="tagline">STAY UPDATED</p>

      <h1 className="page-title">Notifications</h1>

      <p className="muted">
        Announcements from the event organizers.
      </p>

      <div className="notification-toolbar">
        <span className="muted">
          {unread} unread notification{unread !== 1 ? "s" : ""}
        </span>

        {unread > 0 && (
          <button
            type="button"
            className="notification-read-btn"
            onClick={handleMarkAllRead}
            disabled={updating}
          >
            {updating ? "Updating..." : "Mark all as read"}
          </button>
        )}
      </div>

      {error && (
        <div className="empty-state">
          <p>{error}</p>

          <button
            type="button"
            className="notification-read-btn"
            onClick={refreshNotifications}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <span aria-hidden="true">⏳</span>
          <h3>Loading notifications...</h3>
          <p>Please wait a moment.</p>
        </div>
      ) : visible.length === 0 ? (
        !error && (
          <div className="empty-state">
            <span aria-hidden="true">🔔</span>
            <h3>You're all caught up</h3>
            <p>New announcements will show up here.</p>
          </div>
        )
      ) : (
        <div className="notice-list">
          {visible.map((item) => (
            <article
              className={`notice-card notice-${(
                item.type || "Announcement"
              ).toLowerCase()} ${
                !item.isRead ? "notice-unread" : ""
              }`}
              key={item.id}
            >
              <div className="notice-head">
                <span className="notice-type">
                  {item.type || "Announcement"}
                </span>

                {!item.isRead && (
                  <span className="notice-new">New</span>
                )}
              </div>

              <h3>{item.title}</h3>

              <p>{item.message}</p>

              <small>
                {item.relatedEvent
                  ? `${item.relatedEvent} · `
                  : ""}
                {item.createdAt}
              </small>

              {!item.isRead && (
                <div className="notification-actions">
                  <button
                    type="button"
                    className="notification-read-btn"
                    disabled={updating}
                    onClick={() =>
                      handleMarkAsRead(item.id)
                    }
                  >
                    Mark as read
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
