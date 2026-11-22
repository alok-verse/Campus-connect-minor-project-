import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { initialOf } from "../utils/student";

export default function Navbar({ glassMode, onToggleTheme, onOpenProfile, unread }) {
  const { student, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);
  const linkClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <header className="navbar">
      <Link to="/" className="brand" onClick={close}>
        <img src="/campus-connect.svg" alt="" className="logo-icon" />
        <span className="brand-name">
          Campus <span>Connect.</span>
        </span>
      </Link>

      <nav className={`nav-links ${menuOpen ? "open" : ""}`} aria-label="Main">
        <NavLink to="/" end className={linkClass} onClick={close}>Home</NavLink>
        <NavLink to="/events" className={linkClass} onClick={close}>Explore Events</NavLink>
        {student && (
          <>
            <NavLink to="/my-events" className={linkClass} onClick={close}>My Events</NavLink>
            <NavLink to="/notifications" className={linkClass} onClick={close}>
              Notifications
              {unread > 0 && <span className="nav-badge" aria-label={`${unread} unread`}>{unread}</span>}
            </NavLink>
          </>
        )}
        <NavLink to="/about" className={linkClass} onClick={close}>About</NavLink>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          className={`theme-switch ${glassMode ? "active" : ""}`}
          onClick={onToggleTheme}
          aria-label={glassMode ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={glassMode}
        >
          <span className="switch-circle">{glassMode ? "☾" : "☀"}</span>
        </button>

        {student ? (
          <button type="button" className="nav-cta profile-btn" onClick={onOpenProfile}>
            <span className="nav-avatar" aria-hidden="true">{initialOf(student.name)}</span>
            <span className="profile-label">Profile</span>
            {unread > 0 && <span className="nav-dot" aria-hidden="true" />}
          </button>
        ) : isAdmin ? (
          <Link to="/admin" className="nav-cta">Admin Panel</Link>
        ) : (
          <Link to="/login" className="nav-cta">Login</Link>
        )}

        <button
          type="button"
          className="menu-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
}
