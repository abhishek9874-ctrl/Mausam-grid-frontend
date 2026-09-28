import { useData } from "../context/DataContext";

export default function Reporters() {
  const { leaderboard } = useData();

  return (
    <div>
      <div className="panel" style={{ marginBottom: 18 }}>
        <div className="panel-head">
          <h3>Reporter Trust Network</h3>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--text-md)", lineHeight: 1.6, margin: 0 }}>
          Every report is tied to a reputation record for its author, not just a one-off classification. When an admin
          verifies or rejects a report, that author's trust score moves accordingly — and it carries forward into the
          credibility scoring of everything they submit next. A citizen with a strong track record gets more benefit
          of the doubt before official review; someone with a history of rejected reports starts from a lower baseline.
          Mainstream weather sites don't track submitters at all, so they can't do this.
        </p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Leaderboard</h3>
          <span className="hint">ranked by trust score, {leaderboard.length} active reporters</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Reporter</th>
                <th>Primary source</th>
                <th>Reports filed</th>
                <th>Verified</th>
                <th>Rejected</th>
                <th>Trust score</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty">No reporter activity yet — start live ingestion or verify a few reports.</div>
                  </td>
                </tr>
              )}
              {leaderboard.map((r, i) => (
                <tr key={r._id}>
                  <td className="mono">{i + 1}</td>
                  <td className="text-cell">{r.authorHandle}</td>
                  <td>{r.source}</td>
                  <td>{r.totalReports}</td>
                  <td style={{ color: "var(--green)" }}>{r.verifiedReports}</td>
                  <td style={{ color: "var(--red)" }}>{r.rejectedReports}</td>
                  <td>
                    <b className="mono">{Math.round(r.trustScore)}</b>
                    <div className="cred-bar">
                      <span
                        style={{
                          width: `${r.trustScore}%`,
                          background: r.trustScore >= 60 ? "var(--green)" : r.trustScore >= 35 ? "var(--amber)" : "var(--red)",
                        }}
                      />
                    </div>
                  </td>
                  <td>{(r.badges || []).map((b) => <span key={b} className="tag event" style={{ marginRight: 4 }}>{b}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
