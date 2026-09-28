import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { useData } from "../context/DataContext";
import FilterBar from "../components/FilterBar";
import StatGrid from "../components/StatGrid";
import { EVENT_COLORS, EVENT_LABELS } from "../constants";

const VERIFY_COLORS = { pending: "#BD8A3E", verified: "#4A9268", needs_review: "#6478AA", rejected: "#B14A41" };

export default function Overview() {
  const { reports, loading } = useData();

  const stats = useMemo(() => {
    const total = reports.length;
    const count = (pred) => reports.filter(pred).length;
    return {
      total,
      verified: count((r) => r.verificationStatus === "verified"),
      pending: count((r) => r.verificationStatus === "pending"),
      needsReview: count((r) => r.verificationStatus === "needs_review"),
      rejected: count((r) => r.verificationStatus === "rejected"),
      duplicates: count((r) => r.isDuplicate),
    };
  }, [reports]);

  const timeline = useMemo(() => {
    const buckets = {};
    reports.forEach((r) => {
      const key = new Date(r.postedAt).toISOString().slice(0, 13) + ":00";
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour: hour.slice(11, 16), count }));
  }, [reports]);

  const eventMix = useMemo(() => {
    const counts = {};
    reports.forEach((r) => (counts[r.eventCategory] = (counts[r.eventCategory] || 0) + 1));
    return Object.entries(counts).map(([category, value]) => ({ name: EVENT_LABELS[category] || category, value, category }));
  }, [reports]);

  const stateMix = useMemo(() => {
    const counts = {};
    reports.forEach((r) => (counts[r.state] = (counts[r.state] || 0) + 1));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([state, count]) => ({ state, count }));
  }, [reports]);

  const verifyMix = useMemo(() => {
    return [
      { name: "Pending", value: stats.pending, key: "pending" },
      { name: "Verified", value: stats.verified, key: "verified" },
      { name: "Needs review", value: stats.needsReview, key: "needs_review" },
      { name: "Rejected", value: stats.rejected, key: "rejected" },
    ];
  }, [stats]);

  return (
    <div>
      <FilterBar />
      <StatGrid
        cards={[
          { label: "Total reports", value: stats.total, accent: "var(--teal)" },
          { label: "Verified", value: stats.verified, accent: "var(--green)", sub: pct(stats.verified, stats.total) },
          { label: "Pending review", value: stats.pending, accent: "var(--amber)", sub: pct(stats.pending, stats.total) },
          { label: "Needs review", value: stats.needsReview, accent: "var(--indigo)", sub: pct(stats.needsReview, stats.total) },
          { label: "Rejected / fake", value: stats.rejected, accent: "var(--red)", sub: pct(stats.rejected, stats.total) },
          { label: "Duplicates merged", value: stats.duplicates, accent: "var(--text-lo)", sub: pct(stats.duplicates, stats.total) },
        ]}
      />

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Reports over time</h3>
            <span className="hint">hourly volume, all sources, current filters</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={timeline}>
              <defs>
                <linearGradient id="fillTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4C9A93" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4C9A93" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(184,199,212,0.08)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#67747F", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#67747F", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1C242F", border: "1px solid rgba(184,199,212,0.22)", fontSize: 12 }} />
              <Area type="monotone" dataKey="count" name="Reports" stroke="#4C9A93" fill="url(#fillTeal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Event category mix</h3>
            <span className="hint">classified by NLP pipeline</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={eventMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {eventMix.map((e) => (
                  <Cell key={e.category} fill={EVENT_COLORS[e.category]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#9AA8B6" }} />
              <Tooltip contentStyle={{ background: "#1C242F", border: "1px solid rgba(184,199,212,0.22)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div className="panel">
          <div className="panel-head">
            <h3>Top reporting states</h3>
            <span className="hint">report volume by state</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stateMix} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid stroke="rgba(184,199,212,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#67747F", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="state" tick={{ fill: "#9AA8B6", fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: "#1C242F", border: "1px solid rgba(184,199,212,0.22)", fontSize: 12 }} />
              <Bar dataKey="count" name="Reports" fill="#5C7FD6" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Verification pipeline</h3>
            <span className="hint">trust &amp; QA breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={verifyMix} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {verifyMix.map((v) => (
                  <Cell key={v.key} fill={VERIFY_COLORS[v.key]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: "#9AA8B6" }} />
              <Tooltip contentStyle={{ background: "#1C242F", border: "1px solid rgba(184,199,212,0.22)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!loading && reports.length === 0 && (
        <div className="empty">No reports match the current filters yet. Try starting live ingestion from the top bar.</div>
      )}
    </div>
  );
}

function pct(n, total) {
  if (!total) return "0% of filtered set";
  return `${Math.round((n / total) * 100)}% of filtered set`;
}
