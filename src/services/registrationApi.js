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

// Register for an event
export async function registerForEvent(eventId, token) {
  const data = await request(
    "/registrations",
    "POST",
    token,
    { eventId }
  );

  return data.registration;
}

// Get student's registrations
export async function getMyRegistrations(token) {
  const data = await request(
    "/registrations/my",
    "GET",
    token
  );

  return data.registrations;
}

// Cancel registration
export async function cancelRegistration(id, token) {
  const data = await request(
    `/registrations/${id}/cancel`,
    "PATCH",
    token
  );

  return data.registration;
}

// Get all registrations for admin
export async function getAllRegistrations(token) {
  const data = await request(
    "/registrations/admin",
    "GET",
    token
  );

  return data.registrations;
}

// Get event-wise registrations
export async function getEventRegistrations(id, token) {
  const data = await request(
    `/registrations/event/${id}`,
    "GET",
    token
  );

  return data.registrations;
}