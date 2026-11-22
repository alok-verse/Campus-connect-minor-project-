import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

/** Only logged-in students can open the wrapped page. */
export function RequireStudent({ children }) {
  const { student } = useAuth();
  const location = useLocation();

  if (!student) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Only a logged-in admin can open the wrapped page. */
export function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ role: "admin", from: "/admin" }} />;
  }
  return children;
}

/** Jump back to the top whenever the page changes. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
