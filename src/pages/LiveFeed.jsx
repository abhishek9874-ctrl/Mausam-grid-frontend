import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useData } from "../context/DataContext";
import FilterBar from "../components/FilterBar";
import FeedItem from "../components/FeedItem";

export default function LiveFeed() {
  const { liveTicker, filters } = useData();

  const filtered = useMemo(() => {
    return liveTicker.filter((r) => {
      if (filters.eventCategories.length && !filters.eventCategories.includes(r.eventCategory)) return false;
      if (filters.state && r.state !== filters.state) return false;
      if (filters.city && r.city !== filters.city) return false;
      return true;
    });
  }, [liveTicker, filters]);

  const quality = useMemo(() => {
    const sample = liveTicker.slice(0, 60);
    const credible = sample.filter((r) => !r.isLikelyFake && !r.isDuplicate).length;
    const fake = sample.filter((r) => r.isLikelyFake).length;
    const dup = sample.filter((r) => r.isDuplicate && !r.isLikelyFake).length;
    return [
      { name: "Credible", value: credible, color: "#4A9268" },
      { name: "Likely fake", value: fake, color: "#B14A41" },
      { name: "Duplicate", value: dup, color: "#6478AA" },
    ];
  }, [liveTicker]);

  return (
    <div>
      <FilterBar showStatus={false} />
      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="panel">
          <div className="panel-head">
            <h3>
              Incoming reports <span className="mono" style={{ color: "var(--teal)" }}>· {filtered.length} shown</span>
            </h3>
            <span className="hint">#IMD, #rainfall, #flood, #heatwave and 30+ tracked hashtags</span>
          </div>
          <div className="feed-list">
            {filtered.length === 0 && (
              <div className="empty">Waiting for the ingestion stream to start — use "Start live ingestion" in the top bar.</div>
            )}
            {filtered.map((r) => (
              <FeedItem key={r._id} report={r} />
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>Live signal quality</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={quality} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={2}>
                {quality.map((q) => (
                  <Cell key={q.name} fill={q.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {quality.map((q) => (
              <span key={q.name}>
                <i style={{ background: q.color }} /> {q.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
