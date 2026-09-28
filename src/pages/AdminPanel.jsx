import { useMemo, useState } from "react";
import { useData } from "../context/DataContext";
import FilterBar from "../components/FilterBar";
import VerifyModal from "../components/VerifyModal";
import { StatusTag, EventTag, SeverityText } from "../components/Tags";

function credColor(score) {
  if (score >= 60) return "var(--green)";
  if (score >= 35) return "var(--amber)";
  return "var(--red)";
}

export default function AdminPanel() {
  const { reports, anomalies, bulkVerify } = useData();
  const [selected, setSelected] = useState(null); // single report open in the review modal
  const [checkedIds, setCheckedIds] = useState(new Set()); // bulk-selected row ids
  const [bulkNote, setBulkNote] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // PRIORITY SORTING: cross-reference the current queue against the
  // Emerging Event Radar. A report whose (city, event) is an active,
  // independently-corroborated hotspot matters far more than an isolated
  // low-signal report — surface those first instead of pure recency.
  const priorityMap = useMemo(() => {
    const map = new Map(); // "city|||event" -> 2 (emerging) | 1 (watching)
    (anomalies.hotspots || []).forEach((h) => {
      const key = `${h.city}|||${h.eventCategory}`;
      map.set(key, h.isEmerging ? 2 : 1);
    });
    return map;
  }, [anomalies]);

  const list = useMemo(() => {
    const withPriority = reports.slice(0, 300).map((r) => ({
      report: r,
      priority: priorityMap.get(`${r.city}|||${r.eventCategory}`) || 0,
    }));
    withPriority.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return new Date(b.report.postedAt) - new Date(a.report.postedAt);
    });
    return withPriority;
  }, [reports, priorityMap]);

  const visibleIds = list.map((x) => x.report._id);
  const allChecked = visibleIds.length > 0 && visibleIds.every((id) => checkedIds.has(id));

  const toggleOne = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setCheckedIds(allChecked ? new Set() : new Set(visibleIds));
  };
  const clearSelection = () => {
    setCheckedIds(new Set());
    setBulkNote("");
    setBulkResult(null);
  };

  const runBulk = async (verificationStatus) => {
    setBulkBusy(true);
    try {
      const data = await bulkVerify([...checkedIds], verificationStatus, bulkNote || undefined);
      setBulkResult(data);
      setCheckedIds(new Set());
      setBulkNote("");
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div>
      <FilterBar />

      {checkedIds.size > 0 && (
        <div className="panel" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <b style={{ fontSize: 12.5 }}>{checkedIds.size} selected</b>
          <input
            type="text"
            placeholder="Optional note applied to all selected"
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="btn small outline-green" disabled={bulkBusy} onClick={() => runBulk("verified")}>
            Verify selected
          </button>
          <button className="btn small" disabled={bulkBusy} onClick={() => runBulk("needs_review")}>
            Needs review
          </button>
          <button className="btn small outline-red" disabled={bulkBusy} onClick={() => runBulk("rejected")}>
            Reject selected
          </button>
          <button className="btn small ghost" onClick={clearSelection}>
            Clear
          </button>
        </div>
      )}

      {bulkResult && (
        <div className="panel" style={{ marginBottom: 14, borderLeft: "3px solid var(--teal)" }}>
          <span style={{ fontSize: 12.5, color: "var(--text-md)" }}>
            Applied to <b style={{ color: "var(--text-hi)" }}>{bulkResult.updatedCount}</b> reports
            {bulkResult.skipped?.length > 0 && ` (${bulkResult.skipped.length} skipped — out of your state or not found)`}.
          </span>
          <button className="btn small ghost" style={{ marginLeft: 10 }} onClick={() => setBulkResult(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <h3>Verification queue</h3>
          <span className="hint">
            {list.length} reports matching filters
            {priorityMap.size > 0 && " · sorted with Emerging Event Radar hotspots first"}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 30 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                </th>
                <th>Time</th>
                <th>Report</th>
                <th>Location</th>
                <th>Event</th>
                <th>Credibility</th>
                <th>Flags</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty">No reports match the current filters.</div>
                  </td>
                </tr>
              )}
              {list.map(({ report: r, priority }) => (
                <tr key={r._id} style={priority > 0 ? { background: priority === 2 ? "rgba(177,74,65,0.05)" : "rgba(189,138,62,0.05)" } : undefined}>
                  <td>
                    <input type="checkbox" checked={checkedIds.has(r._id)} onChange={() => toggleOne(r._id)} />
                  </td>
                  <td className="mono">
                    {new Date(r.postedAt).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="text-cell">
                    {priority === 2 && <span className="tag fake" style={{ marginRight: 6 }}>emerging</span>}
                    {priority === 1 && <span className="tag needs_review" style={{ marginRight: 6 }}>watching</span>}
                    {r.rawText}
                  </td>
                  <td>
                    {r.city}
                    <br />
                    <span className="mono" style={{ color: "var(--text-lo)", fontSize: 10.5 }}>
                      {r.state}
                    </span>
                  </td>
                  <td>
                    <EventTag category={r.eventCategory} />
                    <br />
                    <span style={{ marginTop: 4, display: "inline-block" }}>
                      <SeverityText severity={r.severity} />
                    </span>
                  </td>
                  <td>
                    {r.credibilityScore}
                    <div className="cred-bar">
                      <span style={{ width: `${r.credibilityScore}%`, background: credColor(r.credibilityScore) }} />
                    </div>
                  </td>
                  <td>
                    {r.isLikelyFake && <span className="tag fake">fake</span>}{" "}
                    {r.isDuplicate && <span className="tag dup">dup</span>}
                    {!r.isLikelyFake && !r.isDuplicate && <span className="mono" style={{ color: "var(--text-lo)" }}>—</span>}
                  </td>
                  <td>
                    <StatusTag status={r.verificationStatus} />
                    {r.verifiedBy === "auto-verification-system" && (
                      <div className="mono" style={{ fontSize: 9.5, color: "var(--text-lo)", marginTop: 3 }}>
                        auto-verified
                      </div>
                    )}
                  </td>
                  <td>
                    <button className="btn small outline-green" onClick={() => setSelected(r)}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <VerifyModal report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
