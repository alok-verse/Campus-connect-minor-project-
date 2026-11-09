
import { useState } from "react";
import "./App.css";
import Navbar from "./Components/Navebar";
import Hero from "./Components/Hero";
import EventCard from "./Components/EventCard";
import Footer from "./Components/Footer";

import events from "./data/events";

function App() {
  const [glassMode, setGlassMode] = useState(false);

  return (
    <div className={glassMode ? "app glass-theme" : "app"}>

      <Navbar
        glassMode={glassMode}
        onToggle={() => setGlassMode(!glassMode)}
      />

      <Hero />

      <section className="events-section" id="events">

        <div className="section-heading">
          <div>
            <p className="tagline">WHAT'S HAPPENING?</p>
            <h2>Upcoming Events</h2>
          </div>

          <a href="#events">View All →</a>
        </div>

        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

      </section>

      <Footer />

    </div>
  );
}

export default App;
