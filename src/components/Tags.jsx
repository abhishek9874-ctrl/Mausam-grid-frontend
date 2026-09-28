import { EVENT_LABELS, STATUS_LABELS } from "../constants";

export function StatusTag({ status }) {
  return <span className={`tag ${status}`}>{STATUS_LABELS[status] || status}</span>;
}

export function EventTag({ category }) {
  return <span className="tag event">{EVENT_LABELS[category] || category}</span>;
}

export function SeverityText({ severity }) {
  return <span className={`sev-${severity}`}>{severity}</span>;
}
