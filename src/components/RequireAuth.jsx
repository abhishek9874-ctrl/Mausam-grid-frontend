import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ minRole = "citizen", children }) {
  const { user, initializing, hasRole } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="empty">Checking your session…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!hasRole(minRole)) {
    return (
      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head">
          <h3>Access restricted</h3>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-md)" }}>
          Your account role ({user.role.replace("_", " ")}) doesn't have access to this section. Contact a state or
          super admin if you believe this is incorrect.
        </p>
      </div>
    );
  }
  return children;
}
