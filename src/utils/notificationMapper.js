
export function toFrontendNotification(notification) {
  const typeMap = {
    announcement: "Announcement",
    event: "Event",
    reminder: "Reminder",
  };

  return {
    id: notification._id,

    title: notification.title,

    message: notification.message,

    type:
      typeMap[notification.type] ||
      "Announcement",

    relatedEvent:
      notification.eventId?.title || "",

    createdAt: notification.createdAt
      ? new Date(notification.createdAt).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "",

    isRead: Boolean(notification.isRead),

    createdBy:
      notification.createdBy?.name || "Admin",
  };
}
