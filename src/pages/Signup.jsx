import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup, authError } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await signup(name, email, password);
    setSubmitting(false);
    if (ok) navigate("/", { replace: true });
  };

  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <div className="panel">
        <div className="panel-head">
          <h3>Create a citizen account</h3>
          <span className="hint">for submitting reports & viewing dashboards</span>
        </div>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field">
            <label>Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%" }} autoFocus />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%" }} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%" }} />
            <span style={{ fontSize: 10.5, color: "var(--text-lo)" }}>At least 8 characters, one uppercase letter, one number.</span>
          </div>
          {authError && <div style={{ color: "var(--red)", fontSize: 12 }}>{authError}</div>}
          <button className="btn primary" type="submit" disabled={submitting} style={{ justifyContent: "center", marginTop: 4 }}>
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>
        <div style={{ fontSize: 12, color: "var(--text-lo)", marginTop: 14, textAlign: "center" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--teal)" }}>Sign in</Link>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-lo)", marginTop: 10, textAlign: "center" }}>
          District/state admin accounts are created by a super admin, not through self-signup.
        </div>
      </div>
    </div>
  );
}
