import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_URL, Endpoints } from "../api/client";

const DataContext = createContext(null);

const DEFAULT_FILTERS = {
  dateFrom: "",
  dateTo: "",
  eventCategories: [],
  state: "",
  city: "",
  verificationStatus: "",
  limit: 500,
};

export function DataProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [simulatorRunning, setSimulatorRunning] = useState(false);
  const [liveTicker, setLiveTicker] = useState([]); // unfiltered, most-recent-first, for the Live Feed page
  const [anomalies, setAnomalies] = useState({ hotspots: [], generatedAt: null });
  const [leaderboard, setLeaderboard] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const socketRef = useRef(null);

  const setFilter = useCallback((patch) => setFilters((f) => ({ ...f, ...patch })), []);
  const toggleEventCategory = useCallback((cat) => {
    setFilters((f) => {
      const has = f.eventCategories.includes(cat);
      return { ...f, eventCategories: has ? f.eventCategories.filter((c) => c !== cat) : [...f.eventCategories, cat] };
    });
  }, []);
  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const refetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await Endpoints.listReports(filters);
      setReports(data);
    } catch (e) {
      // backend unreachable — leave existing (possibly empty) state, UI shows a clear offline notice
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetchAnomalies = useCallback(async () => {
    try {
      const { data } = await Endpoints.anomalies();
      setAnomalies(data);
    } catch (e) {
      /* noop */
    }
  }, []);

  const refetchLeaderboard = useCallback(async () => {
    try {
      const { data } = await Endpoints.leaderboard();
      setLeaderboard(data);
    } catch (e) {
      /* noop */
    }
  }, []);

  const verify = useCallback(async (id, body) => {
    const { data } = await Endpoints.verifyReport(id, body);
    // data = { report, updatedCount, updatedReports } — a cluster verification
    // can update several reports at once; apply every one of them locally.
    const updatedById = new Map(data.updatedReports.map((r) => [r._id, r]));
    setReports((rs) => rs.map((r) => updatedById.get(r._id) || r));
    setLiveTicker((rs) => rs.map((r) => updatedById.get(r._id) || r));
    return data; // { report, updatedCount, updatedReports }
  }, []);

  const bulkVerify = useCallback(async (ids, verificationStatus, adminNotes) => {
    const { data } = await Endpoints.bulkVerifyReports(ids, verificationStatus, adminNotes);
    const updatedById = new Map(data.updatedReports.map((r) => [r._id, r]));
    setReports((rs) => rs.map((r) => updatedById.get(r._id) || r));
    setLiveTicker((rs) => rs.map((r) => updatedById.get(r._id) || r));
    return data; // { updatedCount, updatedReports, skipped }
  }, []);

  const startSimulator = useCallback(async (rate = 40) => {
    await Endpoints.simulatorStart(rate);
    setSimulatorRunning(true);
  }, []);
  const stopSimulator = useCallback(async () => {
    await Endpoints.simulatorStop();
    setSimulatorRunning(false);
  }, []);

  // initial connectivity + socket setup
  useEffect(() => {
    let cancelled = false;
    Endpoints.health()
      .then(() => !cancelled && setConnected(true))
      .catch(() => !cancelled && setConnected(false));

    const socket = io(API_URL, { reconnectionDelay: 2000, timeout: 4000 });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("report:new", (report) => {
      setLiveTicker((prev) => [report, ...prev].slice(0, 80));
      setReports((prev) => [report, ...prev].slice(0, 2000));
    });
    socket.on("report:updated", (report) => {
      setReports((prev) => prev.map((r) => (r._id === report._id ? report : r)));
      setLiveTicker((prev) => prev.map((r) => (r._id === report._id ? report : r)));
    });

    Endpoints.simulatorStatus()
      .then(({ data }) => setSimulatorRunning(data.running))
      .catch(() => {});
    Endpoints.states()
      .then(({ data }) => setStates(data))
      .catch(() => {});

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, []);

  // refetch reports whenever filters change
  useEffect(() => {
    refetchReports();
  }, [refetchReports]);

  // city list depends on selected state
  useEffect(() => {
    Endpoints.cities(filters.state)
      .then(({ data }) => setCities(data))
      .catch(() => {});
  }, [filters.state]);

  // poll the Emerging Event Radar + leaderboard periodically
  useEffect(() => {
    refetchAnomalies();
    refetchLeaderboard();
    const t = setInterval(() => {
      refetchAnomalies();
      refetchLeaderboard();
    }, 20000);
    return () => clearInterval(t);
  }, [refetchAnomalies, refetchLeaderboard]);

  const value = useMemo(
    () => ({
      filters,
      setFilter,
      toggleEventCategory,
      clearFilters,
      reports,
      loading,
      connected,
      simulatorRunning,
      startSimulator,
      stopSimulator,
      liveTicker,
      anomalies,
      leaderboard,
      states,
      cities,
      verify,
      bulkVerify,
      refetchReports,
    }),
    [
      filters,
      setFilter,
      toggleEventCategory,
      clearFilters,
      reports,
      loading,
      connected,
      simulatorRunning,
      startSimulator,
      stopSimulator,
      liveTicker,
      anomalies,
      leaderboard,
      states,
      cities,
      verify,
      bulkVerify,
      refetchReports,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
