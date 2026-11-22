import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import Hero from "../Hero";
import EventCard from "../EventCard";
import { useEvents, useRegistrations } from "../useStudentData";

export default function Home() {
  const { openEvent } = useOutletContext();
  const { upcoming } = useEvents();
  const { all, isRegistered } = useRegistrations();

  useEffect(() => {
    document.title = "Campus Connect | Sarala Birla University";
  }, []);

  const stats = [
    { label: "Upcoming events", value: upcoming.length },
    { label: "Registrations", value: all.length },
    { label: "Categories", value: new Set(upcoming.map((e) => e.category)).size },
  ];

  return (
    <>
      <Hero stats={stats} />

      <section className="page-section" id="events">
        <div className="section-heading">
          <div>
            <p className="tagline">WHAT'S HAPPENING?</p>
            <h2>Upcoming Events</h2>
          </div>
          <Link to="/events" className="section-link">View All →</Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">📅</span>
            <h3>No upcoming events yet</h3>
            <p>New events will appear here as soon as organizers publish them.</p>
          </div>
        ) : (
          <div className="events-grid">
            {upcoming.slice(0, 6).map((event) => (
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
    </>
  );
}
