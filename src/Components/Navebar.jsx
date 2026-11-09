import campusLogo from "../assets/campus-connect.svg";

function Navbar({ glassMode, onToggle }) {
  return (
    <nav className="navbar">

      <a href="#home" className="brand">
        <img
          src={campusLogo}
          alt="Campus Connect"
          className="logo-icon"
        />
        <h2>
          Campus<span>Connect.</span>
        </h2>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#events">Explore Events</a>
        <a href="#about">About</a>
      </div>

      <div className="nav-actions">
        <button
          className={`theme-switch ${glassMode ? "active" : ""}`}
          onClick={onToggle}
        >
          <span className="switch-circle">
            {glassMode ? "☾" : "☀"}
          </span>
        </button>

        <button className="login-btn">Login</button>
      </div>

    </nav>
  );
}

export default Navbar;