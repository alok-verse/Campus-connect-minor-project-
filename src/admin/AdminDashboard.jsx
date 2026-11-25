import { useEffect, useMemo, useState } from "react";
import { getAllRegistrations } from "../services/registrationApi";
import { toFrontendRegistration } from "../utils/registrationMapper";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AddEvent from "./AddEvent";
import "./AdminDashboard.css";
import { KEYS } from "../config";
import { useAuth } from "../context/useAuth";
import { useUI } from "../context/useUI";
import { EMPTY_LIST, useStored } from "../utils/storage";
import { formatDate, formatTime, nowLabel, todayISO } from "../utils/dates";
import { downloadCSV } from "../utils/csv";
import {
  getAdminEvents,
  createEvent,
  updateEvent,
  archiveEvent as archiveEventApi,
  deleteEvent as deleteEventApi,
} from "../services/eventApi";
import { toBackendEvent, toFrontendEvent } from "../utils/eventMapper";

const emptyNotification = {
  title: "",
  message: "",
  type: "General",
  audience: "All Students",
  year: "",
  relatedEvent: "",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { logoutAdmin, adminToken } = useAuth();
  const { toast, confirm } = useUI();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyEvent, setBusyEvent] = useState(false);
  const [notifications, setNotifications] = useStored(KEYS.notifications, EMPTY_LIST);
  const [registrations, setRegistrations] = useState([]);
  const [darkMode, setDarkMode] = useStored(KEYS.adminTheme, false);

  const [eventFilter, setEventFilter] = useState("All");
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [notificationForm, setNotificationForm] = useState(emptyNotification);
  const [regEvent, setRegEvent] = useState("all");
  const [regSearch, setRegSearch] = useState("");

  useEffect(() => {
    document.title = "Admin Panel | Campus Connect";
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingEvents(true);
    setEventError("");
    async function load() {
      try {
        if (!adminToken) throw new Error("Please log in again.");
        const data = (await getAdminEvents(adminToken)).map(toFrontendEvent);
        if (!active) return;
        setEvents(data.filter(event => !event.archived));
        setArchivedEvents(data.filter(event => event.archived));
      } catch (error) {
        if (active) setEventError(error.message || "Could not load events.");
      } finally {
        if (active) setLoadingEvents(false);
      }
    }
    load();
    return () => { active = false; };
  }, [adminToken, reloadKey]);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const today = todayISO();
  const allEvents = useMemo(() => [...events, ...archivedEvents], [events, archivedEvents]);

  const upcomingCount = events.filter((event) => event.date && event.date >= today).length;
  const completedCount = allEvents.filter((event) => event.date && event.date < today).length;
useEffect(() => {
  if (!adminToken) {
    setRegistrations([]);
    return;
  }

  let active = true;

  async function loadRegistrations() {
    try {
      const data = await getAllRegistrations(adminToken);

      const mapped = data
        .map(toFrontendRegistration)
        .filter((item) => item.status !== "cancelled");

      // Oldest first, preserving existing dashboard sorting
      mapped.sort((a, b) =>
        a.registeredAtISO.localeCompare(b.registeredAtISO)
      );

      if (active) {
        setRegistrations(mapped);
      }
    } catch (error) {
      if (active) {
        console.error("Failed to load registrations:", error);
        toast(error.message, "error");
      }
    }
  }

  loadRegistrations();

  return () => {
    active = false;
  };
}, [adminToken, activeTab, toast]);
  const registrationCounts = useMemo(() => {
    const counts = {};
    registrations.forEach((item) => {
      counts[item.id] = (counts[item.id] || 0) + 1;
    });
    return counts;
  }, [registrations]);

  const goTo = (tab) => {
    setActiveTab(tab);
    setShowNotificationForm(false);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  /* ---------- events ---------- */

  const addEvent = async (event) => {
    if (!adminToken) throw new Error("Please log in again.");
    const saved = toFrontendEvent(await createEvent(toBackendEvent(event), adminToken));
    setEvents(previous => [saved, ...previous.filter(item => item.id !== saved.id)]);
    setEventFilter("All");
    goTo("My Events");
    return true;
  };

  const archiveEvent = async (id) => {
    if (busyEvent || !events.some(item => item.id === id)) return;
    setBusyEvent(true);
    try {
      const yes = await confirm({
        title: "Archive this event?",
        message: "It will be hidden from students but stay in Event History and Total Events. You can restore it later.",
        confirmText: "Archive",
        danger: true,
      });
      if (!yes) return;
      const saved = toFrontendEvent(await archiveEventApi(id, adminToken));
      setArchivedEvents(previous => [saved, ...previous.filter(item => item.id !== id)]);
      setEvents(previous => previous.filter(item => item.id !== id));
      toast("Event archived.", "info");
    } catch (error) {
      toast(error.message || "Could not archive event.", "error");
    } finally { setBusyEvent(false); }
  };

  const restoreEvent = async (id) => {
    const event = archivedEvents.find(item => item.id === id);
    if (!event || busyEvent) return;
    setBusyEvent(true);
    try {
      const saved = toFrontendEvent(await updateEvent(id, {
        status: event.date < today ? "completed" : "upcoming",
      }, adminToken));
      setEvents(previous => [saved, ...previous.filter(item => item.id !== id)]);
      setArchivedEvents(previous => previous.filter(item => item.id !== id));
      toast("Event restored.");
    } catch (error) {
      toast(error.message || "Could not restore event.", "error");
    } finally { setBusyEvent(false); }
  };

 const permanentlyDeleteEvent = async (id) => {
  const yes = await confirm({
    title: "Delete permanently?",
    message:
      "This event will be permanently removed from the database. This action cannot be undone.",
    confirmText: "Delete",
    danger: true,
  });

  if (!yes) return;

  try {
    await deleteEventApi(id, adminToken);

    setArchivedEvents((previous) =>
      previous.filter((event) => event.id !== id)
    );

    toast("Event permanently deleted.", "info");
  } catch (error) {
    toast(error.message, "error");
  }
};
  const filteredEvents = events.filter((event) => {
    if (eventFilter === "Upcoming") return event.date >= today;
    if (eventFilter === "Completed") return event.date < today;
    return true;
  });

  /* ---------- notifications ---------- */

  const publishNotification = (e) => {
    e.preventDefault();

    const saved = setNotifications((previous) => [
      {
        id: Date.now(),
        ...notificationForm,
        title: notificationForm.title.trim(),
        message: notificationForm.message.trim(),
        year: notificationForm.audience === "Specific Year" ? notificationForm.year : "",
        createdAt: nowLabel(),
      },
      ...previous,
    ]);

    if (!saved) {
      toast("Could not publish: browser storage is full.", "error");
      return;
    }

    setNotificationForm(emptyNotification);
    setShowNotificationForm(false);
    toast("Notification saved locally.");
  };

  const deleteNotification = async (id) => {
    const yes = await confirm({
      title: "Delete notification?",
      message: "Students will no longer see this announcement.",
      confirmText: "Delete",
      danger: true,
    });
    if (!yes) return;
    setNotifications((previous) => previous.filter((item) => item.id !== id));
  };

  /* ---------- registrations ---------- */

  const registrationEvents = useMemo(() => {
    const seen = new Map();
    registrations.forEach((item) => seen.set(item.id, item.title));
    return [...seen.entries()].map(([id, title]) => ({ id, title }));
  }, [registrations]);

  const visibleRegistrations = useMemo(() => {
    const q = regSearch.trim().toLowerCase();
    return [...registrations]
      .reverse()
      .filter((item) => regEvent === "all" || String(item.id) === regEvent)
      .filter(
        (item) =>
          !q ||
          [item.studentName, item.studentId, item.ticketId, item.title]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(q))
      );
  }, [registrations, regEvent, regSearch]);

  const exportRegistrations = () => {
    if (visibleRegistrations.length === 0) {
      toast("There are no registrations to export.", "error");
      return;
    }
    downloadCSV(`campus-connect-registrations-${today}.csv`, [
      ["Ticket ID", "Event", "Student Name", "Student ID", "Year", "Email", "Fee", "Registered On"],
      ...visibleRegistrations.map((item) => [
        item.ticketId,
        item.title,
        item.studentName || "Student",
        item.studentId || "",
        item.studentYear || "",
        item.studentEmail || "",
        item.feeType === "Amount" ? `Rs ${item.amount}` : "Free",
        item.registeredOn || "",
      ]),
    ]);
    toast(`Exported ${visibleRegistrations.length} registration(s).`);
  };

  /* ---------- account / demo data ---------- */

  const handleLogout = async () => {
    const yes = await confirm({
      title: "Log out?",
      message: "You will need to sign in again to manage events.",
      confirmText: "Log out",
    });
    if (!yes) return;
    logoutAdmin();
    navigate("/login", { replace: true });
  };

  const resetSample = () => toast("Demo reset is disabled for database events.", "info");
  const clearAll = () => toast("Bulk deletion is disabled for database events.", "info");

  /* ---------- pieces ---------- */

  const statusOf = (event, archived) =>
    archived
      ? { label: "Archived", cls: "archived" }
      : event.date < today
        ? { label: "Completed", cls: "completed" }
        : { label: "Upcoming", cls: "" };

  const eventCard = (event, archived = false) => {
    const status = statusOf(event, archived);
    const count = registrationCounts[event.id] || 0;
    const paid = event.feeType === "Amount" && Number(event.amount) > 0;

    return (
      <div className="admin-created-card" key={event.id}>
        {event.bannerData && <img className="admin-card-banner" src={event.bannerData} alt="" />}

        <div className="admin-card-chips">
          <span className={`event-status ${status.cls}`}>{status.label}</span>
          <span className="admin-chip">
            {event.icon || "🎓"} {event.category || "Campus Event"}
          </span>
        </div>

        <h3>{event.title || "Untitled Event"}</h3>
        <p>📅 Event: {formatDate(event.date)}</p>
        <p>📝 Registration opens: {formatDate(event.registrationStartDate)}</p>
        <p>⏳ Registration deadline: {formatDate(event.registrationDeadline)}</p>
        <p>🕒 {formatTime(event.time)}</p>
        <p>📍 {event.venue || "—"}</p>
        <p>
          👥 {event.audience === "Specific Batch" && event.specificYear
            ? `${event.specificYear} only`
            : event.audience || "All Students"}
        </p>
        <p>💰 {paid ? `₹${event.amount}` : "Free"}</p>
        <p className="admin-registered-count">🎟️ {count} registered</p>
        <p>Created: {event.createdAt || "—"}</p>

        {archived ? (
          <div className="event-card-actions">
            <button type="button" disabled={busyEvent || loadingEvents} onClick={() => restoreEvent(event.id)}>Restore Event</button>
            <button
  type="button"
  className="delete-event"
  onClick={() => permanentlyDeleteEvent(event.id)}
>
  Delete Permanently
</button>
          </div>
        ) : (
          <button type="button" className="delete-event" disabled={busyEvent || loadingEvents} onClick={() => archiveEvent(event.id)}>
            Archive Event
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`admin-layout ${darkMode ? "dark" : "light"}`}>
      <AdminSidebar activeTab={activeTab} onSelect={goTo} open={menuOpen} onLogout={handleLogout} />

      {menuOpen && <div className="admin-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div>
              <p>Campus Connect / Admin</p>
              <h2>{activeTab === "Add Event" ? "Create Event" : activeTab}</h2>
            </div>
          </div>

          <div className="admin-top-actions">
            <Link to="/" target="_blank" rel="noreferrer" className="theme-toggle admin-site-link">
              🌐 <span>Student Site</span>
            </Link>
            <button type="button" className="theme-toggle" onClick={() => setDarkMode((value) => !value)}>
              {darkMode ? "☀️" : "🌙"} <span className="toggle-label">{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <span className="admin-status">● Admin Panel</span>
            <div className="admin-top-avatar">A</div>
          </div>
        </header>
        {loadingEvents && <div className="admin-content"><p className="admin-muted">Loading events...</p></div>}
        {eventError && <div className="admin-content"><div className="admin-empty"><p role="alert">{eventError}</p><button type="button" onClick={() => setReloadKey(value => value + 1)}>Retry</button></div></div>}

        {activeTab === "Dashboard" && (
          <section className="admin-content">
            <div className="admin-welcome">
              <div>
                <p>WELCOME BACK, ADMIN!</p>
                <h1>Manage Your Campus.</h1>
                <h1 className="welcome-highlight">Inspire Your Students.</h1>
                <span>Organize events, manage registrations and bring your campus community together.</span>
              </div>
              <div className="welcome-symbol">✦</div>
            </div>

            <div className="admin-stats">
              <div className="stat-card">
                <span className="stat-icon">▣</span>
                <p>Total Events</p>
                <h2>{allEvents.length}</h2>
                <small>All events ever created</small>
              </div>
              <div className="stat-card">
                <span className="stat-icon">◷</span>
                <p>Upcoming Events</p>
                <h2>{upcomingCount}</h2>
                <small>Active scheduled events</small>
              </div>
              <div className="stat-card">
                <span className="stat-icon">✓</span>
                <p>Completed Events</p>
                <h2>{completedCount}</h2>
                <small>Events whose dates have passed</small>
              </div>
              <div className="stat-card">
                <span className="stat-icon">♟</span>
                <p>Total Registrations</p>
                <h2>{registrations.length}</h2>
                <small>Student registrations</small>
              </div>
            </div>

            <div className="admin-section-heading">
              <div>
                <h2>Recently Added Events</h2>
                <p>Your latest active campus events.</p>
              </div>
              <button type="button" onClick={() => goTo("Add Event")}>+ Add New Event</button>
            </div>

            {loadingEvents || eventError ? null : events.length === 0 ? (
              <div className="admin-empty">
                <span>📅</span>
                <h3>No active events</h3>
                <p>Add a new event or check your Event History.</p>
                <button type="button" onClick={() => goTo("Add Event")}>Create Your First Event</button>
                <button type="button" onClick={() => goTo("Event History")}>View Event History</button>
              </div>
            ) : (
              <div className="admin-event-list">
                {events.slice(0, 4).map((event) => (
                  <div className="admin-event-row" key={event.id}>
                    <div className="admin-event-icon">{event.icon || "🎓"}</div>
                    <div>
                      <h3>{event.title}</h3>
                      <p>{formatDate(event.date)} · {event.venue}</p>
                    </div>
                    <span className={`event-status ${statusOf(event, false).cls}`}>
                      {statusOf(event, false).label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="admin-section-heading admin-subsection">
              <div>
                <h2>Latest Registrations</h2>
                <p>The newest student sign-ups.</p>
              </div>
              <button type="button" onClick={() => goTo("Registrations")}>View All</button>
            </div>

            {registrations.length === 0 ? (
              <div className="admin-empty">
                <span>🎟️</span>
                <h3>No registrations yet</h3>
                <p>When students register for your events they will appear here.</p>
              </div>
            ) : (
              <div className="admin-event-list">
                {[...registrations].reverse().slice(0, 4).map((item) => (
                  <div className="admin-event-row" key={item.ticketId}>
                    <div className="admin-event-icon">🎟️</div>
                    <div>
                      <h3>{item.studentName || "Student"}</h3>
                      <p>{item.title} · {item.registeredOn || "—"}</p>
                    </div>
                    <span className="event-status">{item.ticketId}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Add Event" && (
          <section className="admin-content">
            <AddEvent onAddEvent={addEvent} />
          </section>
        )}

        {activeTab === "My Events" && (
          <section className="admin-content">
            <div className="admin-section-heading">
              <div>
                <h2>My Events</h2>
                <p>Manage all your active campus events.</p>
              </div>
              <button type="button" onClick={() => goTo("Add Event")}>+ Add Event</button>
            </div>

            <div className="event-filter-bar">
              {["All", "Upcoming", "Completed"].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={eventFilter === filter ? "filter-active" : ""}
                  onClick={() => setEventFilter(filter)}
                >
                  {filter}
                </button>
              ))}
              <button type="button" onClick={() => goTo("Event History")}>Event History</button>
            </div>

            {loadingEvents || eventError ? null : filteredEvents.length === 0 ? (
              <div className="admin-empty">
                <span>📅</span>
                <h3>No events found</h3>
                <p>Events matching this filter will appear here.</p>
              </div>
            ) : (
              <div className="admin-created-grid">{filteredEvents.map((event) => eventCard(event))}</div>
            )}
          </section>
        )}

        {activeTab === "Event History" && (
          <section className="admin-content">
            <div className="admin-section-heading">
              <div>
                <h2>Event History</h2>
                <p>Archived events are safely stored here.</p>
              </div>
              <button type="button" onClick={() => goTo("My Events")}>Back to My Events</button>
            </div>

            <div className="admin-history-summary">
              <h3>{allEvents.length} Total Events</h3>
              <p>{archivedEvents.length} archived event records</p>
            </div>

            {loadingEvents || eventError ? null : archivedEvents.length === 0 ? (
              <div className="admin-empty">
                <span>🗂️</span>
                <h3>No archived events yet</h3>
                <p>When you archive an event, its record will appear here.</p>
              </div>
            ) : (
              <div className="admin-created-grid">{archivedEvents.map((event) => eventCard(event, true))}</div>
            )}
          </section>
        )}

        {activeTab === "Registrations" && (
          <section className="admin-content">
            <h2>Student Registrations</h2>
            <p className="admin-muted">
  View and manage student registrations stored in the database.
</p>

            <div className="admin-toolbar">
              <select
                value={regEvent}
                onChange={(e) => setRegEvent(e.target.value)}
                aria-label="Filter by event"
              >
                <option value="all">All events</option>
                {registrationEvents.map((item) => (
                  <option key={item.id} value={String(item.id)}>{item.title}</option>
                ))}
              </select>

              <input
                type="search"
                placeholder="Search student, ID or ticket..."
                aria-label="Search registrations"
                value={regSearch}
                onChange={(e) => setRegSearch(e.target.value)}
              />

              <button type="button" className="toolbar-spacer" onClick={exportRegistrations}>
                ⬇ Export CSV
              </button>
            </div>

            <p className="admin-muted">
              Showing {visibleRegistrations.length} of {registrations.length} registrations
            </p>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Year</th>
                    <th>Ticket ID</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRegistrations.length === 0 ? (
                    <tr><td colSpan="6">No registrations found.</td></tr>
                  ) : (
                    visibleRegistrations.map((item) => (
                      <tr key={item.ticketId}>
                        <td>{item.title}</td>
                        <td>{item.studentName || "Student"}</td>
                        <td>{item.studentId || "—"}</td>
                        <td>{item.studentYear || "—"}</td>
                        <td>{item.ticketId}</td>
                        <td>{item.registeredOn || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "Notifications" && (
          <section className="admin-content">
            <div className="admin-section-heading">
              <div>
                <h2>Notifications</h2>
                <p>Announcements stored locally until notification API integration.</p>
              </div>
              <button type="button" onClick={() => setShowNotificationForm((previous) => !previous)}>
                {showNotificationForm ? "Cancel" : "+ Add Notification"}
              </button>
            </div>

            {showNotificationForm && (
              <form className="notification-form" onSubmit={publishNotification}>
                <h3>Create Notification</h3>
                <label htmlFor="n-title">Notification Title</label>
                <input
                  id="n-title"
                  required
                  maxLength={100}
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="Enter notification title"
                />
                <label htmlFor="n-message">Message</label>
                <textarea
                  id="n-message"
                  required
                  rows="4"
                  maxLength={500}
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  placeholder="Write your announcement..."
                />
                <label htmlFor="n-type">Notification Type</label>
                <select
                  id="n-type"
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                >
                  <option>General</option>
                  <option>Important</option>
                  <option>Urgent</option>
                </select>
                <label htmlFor="n-audience">Target Audience</label>
                <select
                  id="n-audience"
                  value={notificationForm.audience}
                  onChange={(e) => setNotificationForm({ ...notificationForm, audience: e.target.value })}
                >
                  <option>All Students</option>
                  <option>Specific Year</option>
                </select>
                {notificationForm.audience === "Specific Year" && (
                  <>
                    <label htmlFor="n-year">Select Year</label>
                    <select
                      id="n-year"
                      required
                      value={notificationForm.year}
                      onChange={(e) => setNotificationForm({ ...notificationForm, year: e.target.value })}
                    >
                      <option value="">Choose year</option>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </>
                )}
                <label htmlFor="n-event">Related Event (Optional)</label>
                <select
                  id="n-event"
                  value={notificationForm.relatedEvent}
                  onChange={(e) => setNotificationForm({ ...notificationForm, relatedEvent: e.target.value })}
                >
                  <option value="">No related event</option>
                  {allEvents.map((event) => (
                    <option key={event.id} value={event.title}>{event.title}</option>
                  ))}
                </select>
                <button type="submit">Publish Notification</button>
              </form>
            )}

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="admin-empty">
                  <span>🔔</span>
                  <h3>No notifications published</h3>
                  <p>Your published announcements will appear here.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div className="notification-card" key={item.id}>
                    <span className={`notification-type ${(item.type || "General").toLowerCase()}`}>
                      {item.type || "General"}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.message}</p>
                    <small>
                      {item.audience}
                      {item.year ? ` · ${item.year}` : ""}
                      {item.relatedEvent ? ` · ${item.relatedEvent}` : ""}
                      {" · "}{item.createdAt}
                    </small>
                    <button type="button" className="delete-event" onClick={() => deleteNotification(item.id)}>
                      Delete Notification
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "Profile" && (
          <section className="admin-content">
            <h2>Administrator Profile</h2>
            <div className="admin-profile-card">
              <div className="admin-profile-avatar">A</div>
              <h3>Administrator</h3>
              <p>Campus Connect Admin Account</p>
              <span>Role: Administrator</span>
            </div>

            <div className="demo-tools">
              <h3>Demo data</h3>
              <p>
                Demo reset and bulk deletion are disabled to protect database events.
              </p>
              <div className="demo-tools-actions">
                <button type="button" onClick={resetSample}>↻ Reset to sample data</button>
                <button type="button" className="danger" onClick={clearAll}>🗑 Clear all event data</button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
