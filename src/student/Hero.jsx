import { Link } from "react-router-dom";
import { UNIVERSITY } from "../config";
import { useAuth } from "../context/useAuth";

export default function Hero({ stats }) {
  const { student } = useAuth();

  return (
    <section className="hero">
      <p className="tagline">YOUR CAMPUS, YOUR COMMUNITY</p>

      <h1>
        Discover Events.
        <br />
        <span>Connect &amp; Grow.</span>
      </h1>

      <p className="hero-description">
        Discover events, connect with students, and make the most of your university life at{" "}
        {UNIVERSITY}.
      </p>

      <div className="hero-actions">
        <Link to="/events" className="btn btn-primary">
          Explore Events →
        </Link>
        {!student && (
          <Link to="/login" className="btn btn-outline">
            Student Login
          </Link>
        )}
      </div>

      {stats && (
        <dl className="hero-stats">
          {stats.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
