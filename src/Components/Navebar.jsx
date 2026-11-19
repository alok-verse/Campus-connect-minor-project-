
import { useState } from "react";
import campusLogo from "../assets/campus-connect.svg";

function Navbar({ glassMode, onToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <a href="#home" className="brand">
        <img
          src={campusLogo}
          alt="Campus Connect"
          className="logo-icon"
        />
        <h2>Campus <span>Connect.</span></h2>
      </a>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
        <a href="#events" onClick={() => setMenuOpen(false)}>Explore Events</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
      </div>

      <div className="nav-actions">
        <button
          className={`theme-switch ${glassMode ? "active" : ""}`}
          onClick={onToggle}
          aria-label="Toggle theme"
        >
          <span className="switch-circle">
            {glassMode ? "☾" : "☀"}
          </span>
        </button>

        <button className="login-btn">Login</button>

        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
