import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found | Campus Connect";
  }, []);

  return (
    <main className="nf-page">
      <div className="nf-card">
        <img src="/campus-connect.svg" alt="" />
        <p className="nf-code">404</p>
        <h1>Page not found</h1>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="nf-link">Back to Campus Connect</Link>
      </div>
    </main>
  );
}
