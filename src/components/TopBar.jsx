import { NavLink } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { to: "/", label: "Overview", end: true, minRole: "citizen" },
  { to: "/live", label: "Live Feed", minRole: "citizen" },
  { to: "/map", label: "Geo Map", minRole: "citizen" },
  { to: "/radar", label: "Early Warning Radar", minRole: "citizen" },
  { to: "/admin", label: "Admin Panel", minRole: "district_admin" },
  { to: "/reporters", label: "Reporter Trust Network", minRole: "citizen" },
  { to: "/sources", label: "Ingestion Sources", minRole: "citizen" },
];

const ROLE_LABEL = { citizen: "Citizen", district_admin: "District Admin", state_admin: "State Admin", super_admin: "Super Admin" };

export default function TopBar() {
  const { connected, simulatorRunning, startSimulator, stopSimulator } = useData();
  const { user, hasRole, logout } = useAuth();

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">MG</div>
          <div className="brand-text">
            <h1>MAUSAM GRID</h1>
            <p>National Weather Big Data Analytics Platform</p>
          </div>
        </div>
        <div className="topbar-right">
          <div className="conn-pill">
            <span className={`conn-dot ${connected ? "pulsing" : "off"}`} />
            {connected ? "Backend connected" : "Backend unreachable"}
          </div>
          {hasRole("district_admin") && (
            <button
              className={`btn ${simulatorRunning ? "outline-red" : "primary"}`}
              onClick={() => (simulatorRunning ? stopSimulator() : startSimulator(40))}
            >
              {simulatorRunning ? "Stop live ingestion" : "Start live ingestion"}
            </button>
          )}
          {user && (
            <div className="conn-pill" style={{ gap: 10 }}>
              <span>
                {user.name} <span style={{ color: "var(--text-lo)" }}>· {ROLE_LABEL[user.role]}{user.state ? ` · ${user.state}` : ""}</span>
              </span>
              <button className="btn ghost small" onClick={logout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <nav className="tabs">
        {TABS.filter((t) => hasRole(t.minRole)).map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
