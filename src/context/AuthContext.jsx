import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Endpoints, setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export const ROLE_RANK = { citizen: 0, district_admin: 1, state_admin: 2, super_admin: 3 };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);

  // On mount, try a silent refresh using the httpOnly cookie so a page
  // reload doesn't force a re-login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await Endpoints.refresh();
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (e) {
        setAccessToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const { data } = await Endpoints.login({ email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return true;
    } catch (e) {
      setAuthError(e.response?.data?.error || "Login failed");
      return false;
    }
  }, []);

  const signup = useCallback(async (name, email, password) => {
    setAuthError(null);
    try {
      const { data } = await Endpoints.signup({ name, email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return true;
    } catch (e) {
      setAuthError(e.response?.data?.error || "Signup failed");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Endpoints.logout();
    } catch (e) {
      /* noop */
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (minRole) => {
      if (!user) return false;
      return (ROLE_RANK[user.role] ?? -1) >= ROLE_RANK[minRole];
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, initializing, authError, login, signup, logout, hasRole }),
    [user, initializing, authError, login, signup, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
