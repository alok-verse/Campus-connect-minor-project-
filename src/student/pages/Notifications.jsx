import { useEffect, useState } from "react";
import { useNotifications } from "../useStudentData";

export default function Notifications() {
  const { visible, seenId, markAllRead } = useNotifications();
  // Remember what was unread when the page opened so "New" labels stay visible.
  const [seenOnOpen] = useState(seenId);

  useEffect(() => {
    document.title = "Notifications | Campus Connect";
  }, []);

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <section className="page-section">
      <p className="tagline">STAY UPDATED</p>
      <h1 className="page-title">Notifications</h1>
      <p className="muted">Announcements from the event organizers.</p>

      {visible.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">🔔</span>
          <h3>You're all caught up</h3>
          <p>New announcements will show up here.</p>
        </div>
      ) : (
        <div className="notice-list">
          {visible.map((item) => (
            <article className={`notice-card notice-${(item.type || "General").toLowerCase()}`} key={item.id}>
              <div className="notice-head">
                <span className="notice-type">{item.type || "General"}</span>
                {item.id > seenOnOpen && <span className="notice-new">New</span>}
              </div>
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <small>
                {item.relatedEvent ? `${item.relatedEvent} · ` : ""}
                {item.createdAt}
              </small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
