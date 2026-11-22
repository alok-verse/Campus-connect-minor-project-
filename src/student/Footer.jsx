import { Link } from "react-router-dom";
import { UNIVERSITY } from "../config";

export default function Footer() {
  return (
    <footer className="site-footer">
      <h2>
        Campus<span>Connect.</span>
      </h2>
      <p>Bringing campus opportunities closer to students.</p>

      <nav className="footer-links" aria-label="Footer">
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/about">About</Link>
      </nav>

      <small>
        © {new Date().getFullYear()} Campus Connect · {UNIVERSITY}. All rights reserved.
      </small>
    </footer>
  );
}
