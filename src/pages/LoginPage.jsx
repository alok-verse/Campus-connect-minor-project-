
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

  const [role, setRole] = useState(
    location.state?.role === "admin" ? "admin" : "student"
  );

  const [darkMode, setDarkMode] = useStored(KEYS.loginTheme, false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    document.title = "Login | Campus Connect";
  }, []);

  // Switch between student and admin login
  const switchRole = (next) => {
    if (loading) return;

    setRole(next);
    setError("");
    setShowPassword(false);
  };

  // Real student authentication
  const handleStudentLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (loading) return;

    const id = studentId.trim().toUpperCase();
    const password = studentPassword;

    if (!/^SBU\d{7}$/.test(id)) {
      setError("Invalid SBU ID. Example: SBU2400680");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await loginStudent(id, password);

      setStudentPassword("");

      const from = location.state?.from;

      navigate(
        typeof from === "string" &&
          from.startsWith("/") &&
          !from.startsWith("//") &&
          !from.startsWith("/admin")
          ? from
          : "/",
        { replace: true }
      );

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Please try again."
          : err.message || "Student login failed."
      );

    } finally {
      setLoading(false);
    }
  };

  // Real admin authentication
  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (loading) return;

    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginAdmin(email, password);

      setAdminPassword("");

      navigate("/admin", { replace: true });

    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Please try again."
          : err.message || "Admin login failed."
      );

    } finally {
      setLoading(false);
    }
  };

  // Password visibility toggle
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

      {/* Navbar */}
      <header className="login-navbar">

        <Link
          to="/"
          className="login-brand"
          aria-label="Back to Campus Connect home"
        >
          <img src="/campus-connect.svg" alt="" />

          <span>
            Campus<span>Connect</span>
          </span>
        </Link>

        {/* Theme toggle */}
        <button
          type="button"
          className={`login-theme-toggle ${darkMode ? "active" : ""}`}
          onClick={() => setDarkMode((value) => !value)}
          aria-label="Toggle dark mode"
          aria-pressed={darkMode}
        >
          <span className="login-switch-circle">
            {darkMode ? "☾" : "☀"}
          </span>
        </button>

      </header>

      <main className="login-main">

        {/* Introduction section */}
        <section className="login-intro">

          <span className="login-eyebrow">
            {UNIVERSITY.toUpperCase()}
          </span>

          <h1>
            One Campus.
            <br />
            <span>Endless Opportunities.</span>
          </h1>

          <p>
            Discover events, participate in activities, and stay
            connected with your campus community through Campus Connect.
          </p>

          <div className="login-features">
            <div>
              <span>✦</span> Discover campus events
            </div>

            <div>
              <span>✦</span> Manage your registrations
            </div>

            <div>
              <span>✦</span> Stay updated with notifications
            </div>
          </div>

          <Link to="/" className="login-back">
            ← Browse events without logging in
          </Link>

        </section>

        {/* Login card */}
        <section className="login-card">

          <div className="login-card-heading">
            <img
              className="login-card-logo"
              src="/campus-connect.svg"
              alt=""
            />

            <h2>Welcome Back!</h2>

            <p>Select your account type to continue.</p>
          </div>

          {/* Role switch */}
          <div
            className="login-role-switch"
            role="tablist"
            aria-label="Account type"
          >

            <button
              type="button"
              role="tab"
              aria-selected={role === "student"}
              className={role === "student" ? "role-active" : ""}
              onClick={() => switchRole("student")}
              disabled={loading}
            >
              🎓 Student
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={role === "admin"}
              className={role === "admin" ? "role-active" : ""}
              onClick={() => switchRole("admin")}
              disabled={loading}
            >
              🛡 Faculty / Admin
            </button>

          </div>

          {/* Student login form */}
          {role === "student" ? (

            <form
              className="login-form"
              onSubmit={handleStudentLogin}
              noValidate
            >

              <h3>Student Login</h3>

              <p className="login-form-subtitle">
                Sign in using your SBU student credentials.
              </p>

              <label htmlFor="studentId">
                SBU Student ID
              </label>

              <input
                id="studentId"
                type="text"
                placeholder="Example: SBU2400680"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoComplete="username"
                maxLength={10}
                spellCheck={false}
                disabled={loading}
                required
              />

              <label htmlFor="studentPassword">
                Password
              </label>

              <div className="login-password">

                <input
                  id="studentPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                {passwordToggle}

              </div>

              <p className="login-hint">
                ID format: SBU + joining year + 5-digit student number.
              </p>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login as Student →"}
              </button>

            </form>

          ) : (

            /* Admin login form */
            <form
              className="login-form"
              onSubmit={handleAdminLogin}
              noValidate
            >

              <h3>Faculty / Admin Login</h3>

              <p className="login-form-subtitle">
                Sign in to manage campus activities.
              </p>

              <label htmlFor="adminEmail">
                Official Email Address
              </label>

              <input
                id="adminEmail"
                type="email"
                placeholder="Enter your official email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                autoComplete="username"
                disabled={loading}
                required
              />

              <label htmlFor="adminPassword">
                Password
              </label>

              <div className="login-password">

                <input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                {passwordToggle}

              </div>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Login as Faculty / Admin →"}
              </button>

            </form>

          )}

          <div className="login-card-footer">
            Campus Connect · Connect. Participate. Grow.
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="login-footer">
        © {new Date().getFullYear()} Campus Connect · {UNIVERSITY}
      </footer>

    </div>
  );
}
