import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate(location.state?.from?.pathname || "/", { replace: true });
  };

  return (
    <div style={{ maxWidth: 380, margin: "60px auto" }}>
      <div className="panel">
        <div className="panel-head">
          <h3>Sign in</h3>
          <span className="hint">MAUSAM GRID console</span>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label>Email</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%" }} autoFocus />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%" }} />
          </div>
          {authError && <div style={{ color: "var(--red)", fontSize: 12 }}>{authError}</div>}
          <button className="btn primary" type="submit" disabled={submitting} style={{ justifyContent: "center", marginTop: 4 }}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div style={{ fontSize: 12, color: "var(--text-lo)", marginTop: 14, textAlign: "center" }}>
          New here? <Link to="/signup" style={{ color: "var(--teal)" }}>Create a citizen account</Link>
        </div>
      </div>
    </div>
  );
}
