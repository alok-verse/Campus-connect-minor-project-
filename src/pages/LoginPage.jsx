import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KEYS, UNIVERSITY } from "../config";
import { useAuth } from "../context/useAuth";
import { useStored } from "../utils/storage";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginStudent, loginAdmin } = useAuth();

  const [role, setRole] = useState(location.state?.role === "admin" ? "admin" : "student");
  const [darkMode, setDarkMode] = useStored(KEYS.loginTheme, false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    document.title = `Login | Campus Connect`;
  }, []);

  const switchRole = (next) => {
    setRole(next);
    setError("");
    setShowPassword(false);
  };

  const handleStudentLogin = (event) => {
    event.preventDefault();
    setError("");

    const id = studentId.trim().toUpperCase();
    const password = studentPassword.trim();

    if (!/^SBU\d{7}$/.test(id)) {
      setError("Invalid SBU ID. Example: SBU2400680");
      return;
    }
    if (!/^SBU#\d{5}$/.test(password)) {
      setError("Invalid password format. Example: SBU#18741");
      return;
    }

    loginStudent(id);
    const from = location.state?.from;
    navigate(from && from !== "/admin" ? from : "/", { replace: true });
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();
    setError("");

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    loginAdmin();
    navigate("/admin", { replace: true });
  };

  const passwordToggle = (
    <button
      type="button"
      className="login-show"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  );

  return (
    <div className={`login-page ${darkMode ? "login-dark" : "login-light"}`}>
      <header className="login-navbar">
        <Link to="/" className="login-brand" aria-label="Back to Campus Connect home">
          <img src="/campus-connect.svg" alt="" />
          <span>
            Campus<span>Connect</span>
          </span>
        </Link>

        <button
          className="login-theme-toggle"
          type="button"
          onClick={() => setDarkMode((value) => !value)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <main className="login-main">
        <section className="login-intro">
          <span className="login-eyebrow">{UNIVERSITY.toUpperCase()}</span>

          <h1>
            One Campus.
            <br />
            <span>Endless Opportunities.</span>
          </h1>

          <p>
            Discover events, participate in activities, and stay connected with your campus
            community through Campus Connect.
          </p>

          <div className="login-features">
            <div><span>✦</span> Discover campus events</div>
            <div><span>✦</span> Manage your registrations</div>
            <div><span>✦</span> Stay updated with notifications</div>
          </div>

          <Link to="/" className="login-back">← Browse events without logging in</Link>
        </section>

        <section className="login-card">
          <div className="login-card-heading">
            <img className="login-card-logo" src="/campus-connect.svg" alt="" />
            <h2>Welcome Back!</h2>
            <p>Select your account type to continue.</p>
          </div>

          <div className="login-role-switch" role="tablist" aria-label="Account type">
            <button
              type="button"
              role="tab"
              aria-selected={role === "student"}
              className={role === "student" ? "role-active" : ""}
              onClick={() => switchRole("student")}
            >
              🎓 Student
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "admin"}
              className={role === "admin" ? "role-active" : ""}
              onClick={() => switchRole("admin")}
            >
              🛡 Faculty / Admin
            </button>
          </div>

          {role === "student" ? (
            <form className="login-form" onSubmit={handleStudentLogin} noValidate>
              <h3>Student Login</h3>
              <p className="login-form-subtitle">Sign in using your SBU student credentials.</p>

              <label htmlFor="studentId">SBU Student ID</label>
              <input
                id="studentId"
                type="text"
                placeholder="Example: SBU2400680"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoComplete="username"
                maxLength={10}
                spellCheck={false}
                required
              />

              <label htmlFor="studentPassword">Password</label>
              <div className="login-password">
                <input
                  id="studentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Example: SBU#18741"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                {passwordToggle}
              </div>

              <p className="login-hint">ID format: SBU + joining year + 5-digit student number.</p>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button className="login-submit" type="submit">Login as Student →</button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleAdminLogin} noValidate>
              <h3>Faculty / Admin Login</h3>
              <p className="login-form-subtitle">Sign in to manage campus activities.</p>

              <label htmlFor="adminEmail">Official Email Address</label>
              <input
                id="adminEmail"
                type="email"
                placeholder="Enter your official email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                autoComplete="username"
                required
              />

              <label htmlFor="adminPassword">Password</label>
              <div className="login-password">
                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                {passwordToggle}
              </div>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button className="login-submit" type="submit">Login as Faculty / Admin →</button>
            </form>
          )}

          <div className="login-card-footer">Campus Connect · Connect. Participate. Grow.</div>
        </section>
      </main>

      <footer className="login-footer">
        © {new Date().getFullYear()} Campus Connect · {UNIVERSITY}
      </footer>
    </div>
  );
}
