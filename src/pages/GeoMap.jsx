import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useData } from "../context/DataContext";
import FilterBar from "../components/FilterBar";
import { EVENT_COLORS, EVENT_LABELS } from "../constants";

const SEV_RADIUS = { low: 5, moderate: 7, severe: 9, extreme: 12 };

export default function GeoMap() {
  const { reports } = useData();

  const points = useMemo(
    () =>
      reports
        .filter((r) => r.location && r.location.coordinates && r.location.coordinates.length === 2)
        .slice(0, 500),
    [reports]
  );

  return (
    <div>
      <FilterBar showStatus={false} />
      <div className="panel">
        <div className="panel-head">
          <h3>Geo-tagged reports</h3>
          <span className="hint">marker colour = event category, size = severity</span>
        </div>
        <div className="map-box">
          <MapContainer center={[22.9, 79.0]} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {points.map((r) => {
              const [lng, lat] = r.location.coordinates;
              return (
                <CircleMarker
                  key={r._id}
                  center={[lat, lng]}
                  radius={SEV_RADIUS[r.severity] || 5}
                  pathOptions={{ color: EVENT_COLORS[r.eventCategory], fillColor: EVENT_COLORS[r.eventCategory], fillOpacity: 0.55, weight: 1.3 }}
                >
                  <Popup>
                    <b>{EVENT_LABELS[r.eventCategory]}</b> · {r.severity}
                    <br />
                    {r.rawText}
                    <br />
                    <small>
                      {r.city}, {r.state} · credibility {r.credibilityScore}
                    </small>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
        <div className="legend">
          {Object.entries(EVENT_LABELS).map(([k, v]) => (
            <span key={k}>
              <i style={{ background: EVENT_COLORS[k] }} /> {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
