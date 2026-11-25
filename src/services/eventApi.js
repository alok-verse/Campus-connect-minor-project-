
const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

// Common API request function
async function request(endpoint, method = "GET", token = null, body = null) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        ...(body !== null && {
            body: JSON.stringify(body)
        })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

// Fetch public events
export async function getEvents() {
    const data = await request("/events");
    return data.events;
}

// Fetch individual event
export async function getEventById(id) {
    const data = await request(`/events/${id}`);
    return data.event;
}

// Fetch all events for admin
export async function getAdminEvents(token) {
    const data = await request("/events/admin", "GET", token);
    return data.events;
}

// Create event
export async function createEvent(eventData, token) {
    const data = await request(
        "/events",
        "POST",
        token,
        eventData
    );

    return data.event;
}

// Update event
export async function updateEvent(id, eventData, token) {
    const data = await request(
        `/events/${id}`,
        "PUT",
        token,
        eventData
    );

    return data.event;
}

// Archive event
export async function archiveEvent(id, token) {
    const data = await request(
        `/events/${id}/archive`,
        "PATCH",
        token
    );

    return data.event;
}
export async function deleteEvent(id, token) {
  return await request(`/events/${id}`, "DELETE", token);
}