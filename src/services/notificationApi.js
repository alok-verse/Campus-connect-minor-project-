
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

async function request(
  endpoint,
  method = "GET",
  token,
  body = null
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body !== null && {
      body: JSON.stringify(body),
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || "Something went wrong."
    );
  }

  return data;
}

// Get all notifications
export async function getNotifications(token) {
  return await request(
    "/notifications",
    "GET",
    token
  );
}

// Create notification (Admin)
export async function createNotification(notification, token) {
  const data = await request(
    "/notifications",
    "POST",
    token,
    notification
  );

  return data.notification;
}

// Mark a single notification as read
export async function markNotificationAsRead(id, token) {
  return await request(
    `/notifications/${id}/read`,
    "PATCH",
    token
  );
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(token) {
  return await request(
    "/notifications/read-all",
    "PATCH",
    token
  );
}

// Delete notification (Admin)
export async function deleteNotification(id, token) {
  return await request(
    `/notifications/${id}`,
    "DELETE",
    token
  );
}
