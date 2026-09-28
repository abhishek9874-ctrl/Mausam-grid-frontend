import { useEffect, useState } from "react";
import { useData } from "../context/DataContext";
import { EVENT_LABELS } from "../constants";

export default function VerifyModal({ report, onClose }) {
  const { verify } = useData();
  const [decision, setDecision] = useState("verified");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null); // { updatedCount } once saved, shown before closing

  useEffect(() => {
    if (report) {
      setDecision(report.verificationStatus === "pending" ? "verified" : report.verificationStatus);
      setNote(report.adminNotes || "");
      setResult(null);
    }
  }, [report]);

  if (!report) return null;

  const save = async () => {
    setSaving(true);
    try {
      const data = await verify(report._id, { verificationStatus: decision, adminNotes: note });
      if (data.updatedCount > 1) {
        setResult(data); // cluster cascade happened — show a confirmation instead of closing instantly
      } else {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <div className="modal-bg open" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <h3>Applied to the whole cluster</h3>
          <p style={{ fontSize: 12.5, color: "var(--text-md)", lineHeight: 1.6 }}>
            This report was part of a duplicate cluster. Your decision (<b>{decision.replace("_", " ")}</b>) was applied to{" "}
            <b>{result.updatedCount}</b> reports in that cluster at once, instead of reviewing each duplicate separately.
          </p>
          <div className="modal-actions">
            <button className="btn primary" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-bg open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>Review report</h3>
        <div className="sub mono">
          #{report._id.slice(-6)} · {report.city}, {report.state} · {EVENT_LABELS[report.eventCategory]} · credibility{" "}
          {report.credibilityScore}
          {report.isLikelyFake && " · flagged likely fake"}
          {report.isDuplicate && " · duplicate cluster"}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55, padding: "10px 12px", background: "var(--bg-panel-alt)", borderRadius: 4, border: "1px solid var(--line)" }}>
          {report.rawText}
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Decision</label>
          <div className="pill-toggle">
            {["verified", "needs_review", "rejected"].map((v) => (
              <button key={v} className={decision === v ? "sel" : ""} onClick={() => setDecision(v)}>
                {v === "verified" ? "Verify" : v === "needs_review" ? "Needs review" : "Reject"}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Admin note (optional)</label>
          <textarea rows={2} style={{ width: "100%" }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason, cross-check source, etc." />
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save decision"}
          </button>
        </div>
      </div>
    </div>
  );
}
