import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EventCard from "../EventCard";
import { useEvents, useRegistrations } from "../useStudentData";

export default function Events() {
  const { openEvent } = useOutletContext();
  const { upcoming } = useEvents();
  const { isRegistered } = useRegistrations();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    document.title = "Explore Events | Campus Connect";
  }, []);

  // Only offer filters for categories that actually have events.
  const categories = useMemo(
    () => ["All", ...new Set(upcoming.map((event) => event.category).filter(Boolean))],
    [upcoming]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return upcoming.filter((event) => {
      const matchesCategory = category === "All" || event.category === category;
      const matchesSearch =
        !q ||
        [event.title, event.category, event.organizer, event.venue]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [upcoming, search, category]);

  return (
    <section className="page-section">
      <p className="tagline">EXPLORE YOUR CAMPUS</p>
      <h1 className="page-title">Discover Events</h1>
      <p className="muted">Find your next opportunity to learn and grow.</p>

      <input
        className="search-input"
        type="search"
        placeholder="Search by title, category, organizer or venue..."
        aria-label="Search events"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters" role="group" aria-label="Filter by category">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={category === item ? "filter active" : "filter"}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">🔎</span>
          <h3>No events found</h3>
          <p>Try a different search or category.</p>
        </div>
      ) : (
        <div className="events-grid">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              registered={isRegistered(event.id)}
              onOpen={openEvent}
            />
          ))}
        </div>
      )}
    </section>
  );
}
