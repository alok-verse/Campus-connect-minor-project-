import { useEffect } from "react";
import { Link } from "react-router-dom";
import { UNIVERSITY } from "../../config";

const steps = [
  { icon: "🔎", title: "Discover", text: "Browse every upcoming workshop, seminar, competition and cultural event in one place." },
  { icon: "🎟️", title: "Register", text: "Sign up in one click and get a ticket you can show at the venue." },
  { icon: "🔔", title: "Stay updated", text: "Get announcements from organizers so you never miss a change or deadline." },
];

export default function About() {
  useEffect(() => {
    document.title = "About | Campus Connect";
  }, []);

  return (
    <section className="page-section">
      <p className="tagline">ABOUT US</p>
      <h1 className="page-title">About Campus Connect</h1>
      <p className="muted about-lead">
        Campus Connect is the event management platform of {UNIVERSITY}. One place for students to
        discover and join campus events, and for faculty and organizers to plan them, manage
        registrations and keep everyone informed.
      </p>

      <div className="about-grid">
        {steps.map((step) => (
          <div className="about-card" key={step.title}>
            <span aria-hidden="true">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>

      <div className="about-cta">
        <Link to="/events" className="btn btn-primary">Explore Events →</Link>
      </div>
    </section>
  );
}
