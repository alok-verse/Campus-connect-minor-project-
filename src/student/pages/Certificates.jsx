import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Certificates() {
  useEffect(() => {
    document.title = "Certificates | Campus Connect";
  }, []);

  return (
    <section className="page-section">
      <p className="tagline">ACHIEVEMENTS</p>
      <h1 className="page-title">My Certificates</h1>
      <div className="empty-state">
        <span aria-hidden="true">🏅</span>
        <h3>No certificates yet</h3>
        <p>Your event certificates will appear here when they are available.</p>
        <Link to="/events" className="btn btn-primary">Explore Events</Link>
      </div>
    </section>
  );
}
