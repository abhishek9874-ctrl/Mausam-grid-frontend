import { EVENT_COLORS, EVENT_LABELS, SOURCE_LABELS } from "../constants";

function credColor(score) {
  if (score >= 60) return "var(--green)";
  if (score >= 35) return "var(--amber)";
  return "var(--red)";
}

export default function FeedItem({ report }) {
  const t = new Date(report.postedAt);
  return (
    <div className="feed-item" style={{ "--accent": EVENT_COLORS[report.eventCategory] }}>
      <div className="feed-top">
        <span className="tag event">{EVENT_LABELS[report.eventCategory]}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--text-lo)" }}>
          {t.toLocaleTimeString()}
        </span>
      </div>
      <div className="feed-text">{report.rawText}</div>
      <div className="feed-meta">
        <span>{report.city}, {report.state}</span>
        <span className="mono">via {SOURCE_LABELS[report.source] || report.source}</span>
        <span className={`sev-${report.severity}`}>{report.severity}</span>
        {report.isLikelyFake && <span className="tag fake">flagged likely fake</span>}
        {report.isDuplicate && <span className="tag dup">duplicate</span>}
        <span className="mono" style={{ color: credColor(report.credibilityScore) }}>
          credibility {report.credibilityScore}
        </span>
      </div>
    </div>
  );
}
