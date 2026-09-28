import { useData } from "../context/DataContext";
import { EVENT_CATEGORIES, EVENT_LABELS } from "../constants";

export default function FilterBar({ showStatus = true }) {
  const { filters, setFilter, toggleEventCategory, clearFilters, states, cities } = useData();

  return (
    <div className="filterbar">
      <div className="field">
        <label>From</label>
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilter({ dateFrom: e.target.value })} />
      </div>
      <div className="field">
        <label>To</label>
        <input type="date" value={filters.dateTo} onChange={(e) => setFilter({ dateTo: e.target.value })} />
      </div>
      <div className="field">
        <label>State</label>
        <select value={filters.state} onChange={(e) => setFilter({ state: e.target.value, city: "" })}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>City</label>
        <select value={filters.city} onChange={(e) => setFilter({ city: e.target.value })}>
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {showStatus && (
        <div className="field">
          <label>Verification</label>
          <select value={filters.verificationStatus} onChange={(e) => setFilter({ verificationStatus: e.target.value })}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="needs_review">Needs review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}
      <div className="field" style={{ flex: 1, minWidth: 280 }}>
        <label>Event type</label>
        <div className="chip-row">
          {EVENT_CATEGORIES.map((cat) => (
            <div
              key={cat}
              className={"chip" + (filters.eventCategories.includes(cat) ? " on" : "")}
              onClick={() => toggleEventCategory(cat)}
            >
              {EVENT_LABELS[cat]}
            </div>
          ))}
        </div>
      </div>
      <button className="btn ghost small" onClick={clearFilters}>
        Clear filters
      </button>
    </div>
  );
}
