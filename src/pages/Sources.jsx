import { useMemo } from "react";
import { useData } from "../context/DataContext";
import { SOURCE_LABELS } from "../constants";

const STEPS = [
  ["1. Multi-source collectors", "Twitter/X filtered stream, Facebook/Instagram pollers, citizen mobile app gateway, IMD public API/bulletins, and regional news scrapers — all normalised to one schema and published onto a Kafka topic."],
  ["2. Stream ingestion", "Kafka + Spark Structured Streaming consume the raw topic, attach geo/time metadata, and hand off to the Node.js ingestion service."],
  ["3. NLP event classification", "Text is classified into rainfall, flooding, thunderstorm, heatwave, fog, dust storm, strong wind or snowfall, with a confidence score."],
  ["4. Credibility & fake-report scoring", "Source trust, author signals, sensational-language detection, geo-plausibility and the author's Reporter Trust Network history combine into a 0–100 credibility score."],
  ["5. Deduplication", "Near-duplicate reports (same event, place and time window, similar text) are clustered so one confirmed event isn't double-counted."],
  ["6. Emerging Event Radar", "Report velocity per city/event is compared to its own baseline and checked for independent corroboration, surfacing hotspots before an official bulletin."],
  ["7. Human-in-the-loop verification", "Admins review flagged and pending reports in the Admin Panel and mark them verified, rejected, or needs review — feeding back into reporter trust."],
  ["8. Storage & serving", "MongoDB (with 2dsphere geo indexes) stores every report; Socket.IO pushes new/updated reports to every connected dashboard in real time."],
];

export default function Sources() {
  const { reports } = useData();

  const counts = useMemo(() => {
    const c = {};
    Object.keys(SOURCE_LABELS).forEach((s) => (c[s] = 0));
    reports.forEach((r) => (c[r.source] = (c[r.source] || 0) + 1));
    return c;
  }, [reports]);

  return (
    <div>
      <div className="grid-3" style={{ marginBottom: 18 }}>
        {Object.entries(SOURCE_LABELS).map(([key, label]) => (
          <div className="panel" key={key}>
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ fontSize: 22 }}>
              {(counts[key] || 0).toLocaleString()}
            </div>
            <div className="stat-sub">reports ingested this session</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Pipeline architecture</h3>
          <span className="hint">what happens to every report, in order</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {STEPS.map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              <div className="mono" style={{ color: "var(--teal)", minWidth: 220, fontSize: 12, fontWeight: 600 }}>
                {title}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-md)", lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
