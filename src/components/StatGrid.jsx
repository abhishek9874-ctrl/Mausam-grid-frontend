export default function StatGrid({ cards }) {
  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div className="stat-card" key={c.label} style={{ "--accent": c.accent }}>
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">{c.value.toLocaleString()}</div>
          {c.sub && <div className="stat-sub">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}
