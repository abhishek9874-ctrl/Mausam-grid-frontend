import { useData } from "../context/DataContext";
import { EVENT_LABELS } from "../constants";

export default function EarlyWarning() {
  const { anomalies } = useData();
  const hotspots = anomalies.hotspots || [];
  const emerging = hotspots.filter((h) => h.isEmerging);
  const watching = hotspots.filter((h) => !h.isEmerging);

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Emerging Event Radar</h3>
          <span className="hint">
            {anomalies.generatedAt ? `updated ${new Date(anomalies.generatedAt).toLocaleTimeString()}` : "warming up…"}
          </span>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-md)", lineHeight: 1.6, margin: 0 }}>
          Ordinary weather sites show you a forecast, or at best the last officially confirmed observation. This radar
          instead watches the <b>velocity</b> of incoming citizen and social reports for every city/event combination,
          compares it against that location's own recent baseline, and only raises an alert once the spike is{" "}
          <b>independently corroborated</b> by several distinct authors and platforms — not a single viral (and possibly
          fake) post. A location can surface here minutes to hours before any agency bulletin.
        </p>
      </div>

      <div className="panel-head" style={{ marginBottom: 10 }}>
        <h3 style={{ color: "var(--red)" }}>Emerging — likely real, act now ({emerging.length})</h3>
      </div>
      {emerging.length === 0 && <div className="empty">No statistically significant, independently corroborated spikes right now.</div>}
      <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
        {emerging.map((h) => (
          <HotspotCard key={h.city + h.eventCategory} h={h} emerging />
        ))}
      </div>

      <div className="panel-head" style={{ marginBottom: 10 }}>
        <h3>Watching — building volume, not yet confirmed ({watching.length})</h3>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {watching.slice(0, 10).map((h) => (
          <HotspotCard key={h.city + h.eventCategory} h={h} />
        ))}
        {watching.length === 0 && <div className="empty">Nothing else on the radar in the last 3 hours.</div>}
      </div>
    </div>
  );
}

function HotspotCard({ h, emerging }) {
  return (
    <div className={"hotspot-card" + (emerging ? " emerging" : "")}>
      <div className="hotspot-title">
        <div>
          <b>{h.city}, {h.state}</b> <span className="tag event" style={{ marginLeft: 8 }}>{EVENT_LABELS[h.eventCategory]}</span>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--text-lo)" }}>score {h.emergingScore}</span>
      </div>
      <div className="hotspot-metrics">
        <div className="hotspot-metric">
          Reports / {h.windowMinutes} min
          <b>{h.recentCount}</b>
        </div>
        <div className="hotspot-metric">
          Velocity vs baseline
          <b>{h.velocityRatio}×</b>
        </div>
        <div className="hotspot-metric">
          Independent authors
          <b>{h.distinctAuthors}</b>
        </div>
        <div className="hotspot-metric">
          Avg. credibility
          <b>{h.avgCredibility}</b>
        </div>
      </div>
      {h.sampleTexts && h.sampleTexts.length > 0 && (
        <div className="hotspot-samples">"{h.sampleTexts[0]}"{h.sampleTexts.length > 1 ? ` — +${h.sampleTexts.length - 1} more similar reports` : ""}</div>
      )}
    </div>
  );
}
