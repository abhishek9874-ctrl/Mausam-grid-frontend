import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL, timeout: 8000, withCredentials: true });

// ---- in-memory access token (never localStorage — avoids XSS token theft) ----
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// On a 401 (expired access token), try exactly one silent refresh via the
// httpOnly cookie before giving up and forcing the caller to handle it.
let refreshPromise = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried && !original.url.includes("/api/auth/")) {
      original._retried = true;
      try {
        refreshPromise = refreshPromise || api.post("/api/auth/refresh");
        const { data } = await refreshPromise;
        refreshPromise = null;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (e) {
        refreshPromise = null;
        setAccessToken(null);
      }
    }
    return Promise.reject(error);
  }
);

export function buildReportQuery(filters) {
  const params = {};
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo + "T23:59:59";
  if (filters.eventCategories && filters.eventCategories.length) params.eventCategory = filters.eventCategories.join(",");
  if (filters.state) params.state = filters.state;
  if (filters.city) params.city = filters.city;
  if (filters.verificationStatus) params.verificationStatus = filters.verificationStatus;
  params.limit = filters.limit || 500;
  return params;
}

export const Endpoints = {
  health: () => api.get("/api/health"),
  signup: (body) => api.post("/api/auth/signup", body),
  login: (body) => api.post("/api/auth/login", body),
  refresh: () => api.post("/api/auth/refresh"),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
  adminCreate: (body) => api.post("/api/auth/admin-create", body),
  listReports: (filters) => api.get("/api/reports", { params: buildReportQuery(filters) }),
  getReport: (id) => api.get(`/api/reports/${id}`),
  verifyReport: (id, body) => api.patch(`/api/reports/${id}/verify`, body),
  bulkVerifyReports: (ids, verificationStatus, adminNotes) =>
    api.patch(`/api/reports/bulk-verify`, { ids, verificationStatus, adminNotes }),
  stats: (hours = 24) => api.get("/api/stats", { params: { hours } }),
  anomalies: () => api.get("/api/anomalies"),
  states: () => api.get("/api/meta/states"),
  cities: (state) => api.get("/api/meta/cities", { params: state ? { state } : {} }),
  leaderboard: () => api.get("/api/meta/reporters/leaderboard"),
  simulatorStart: (ratePerMin) => api.post("/api/simulate/start", null, { params: { ratePerMin } }),
  simulatorStop: () => api.post("/api/simulate/stop"),
  simulatorStatus: () => api.get("/api/simulate/status"),
};
