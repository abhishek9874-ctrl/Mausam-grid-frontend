import { Routes, Route } from "react-router-dom";
import TopBar from "./components/TopBar";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Overview from "./pages/Overview";
import LiveFeed from "./pages/LiveFeed";
import GeoMap from "./pages/GeoMap";
import AdminPanel from "./pages/AdminPanel";
import EarlyWarning from "./pages/EarlyWarning";
import Reporters from "./pages/Reporters";
import Sources from "./pages/Sources";
import { API_URL } from "./api/client";
import { useAuth } from "./context/AuthContext";

function AuthedShell() {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/live" element={<LiveFeed />} />
          <Route path="/map" element={<GeoMap />} />
          <Route path="/radar" element={<EarlyWarning />} />
          <Route
            path="/admin"
            element={
              <RequireAuth minRole="district_admin">
                <AdminPanel />
              </RequireAuth>
            }
          />
          <Route path="/reporters" element={<Reporters />} />
          <Route path="/sources" element={<Sources />} />
        </Routes>
        <div className="footer-note">
          MAUSAM GRID — connects to the Express/MongoDB API at <span className="mono">{API_URL}</span>.
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const { initializing } = useAuth();

  if (initializing) {
    return (
      <div className="app-shell">
        <div className="empty" style={{ marginTop: 80 }}>
          Checking your session…
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      <Route
        path="/*"
        element={
          <RequireAuth minRole="citizen">
            <AuthedShell />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

function PublicOnly({ children }) {
  // Login/Signup pages render standalone (no TopBar) regardless of auth state;
  // RequireAuth on the authed routes handles redirecting logged-in users away
  // from these if they navigate here directly is intentionally not forced,
  // so a logged-in admin can still open /login to switch accounts.
  return <div className="app-shell">{children}</div>;
}
