import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { VehicleData } from '@shared/index';
import styles from './MapView.module.css';

interface MapViewProps {
  vehicles: VehicleData[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicleId?: string) => void;
}

const MAP_MIN_LAT = 37.3;
const MAP_MAX_LAT = 37.8;
const MAP_MIN_LNG = -122.45;
const MAP_MAX_LNG = -121.85;

const toX = (longitude: number) => ((longitude - MAP_MIN_LNG) / (MAP_MAX_LNG - MAP_MIN_LNG)) * 1000;
const toY = (latitude: number) => 650 - ((latitude - MAP_MIN_LAT) / (MAP_MAX_LAT - MAP_MIN_LAT)) * 650;

const MapView = ({ vehicles, selectedVehicleId, onSelectVehicle }: MapViewProps) => {
  const navigate = useNavigate();

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? vehicles[0] ?? null,
    [selectedVehicleId, vehicles]
  );

  const markers = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        ...vehicle,
        x: toX(vehicle.telemetry.location.longitude),
        y: toY(vehicle.telemetry.location.latitude),
      })),
    [vehicles]
  );

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.kicker}>Live fleet tracking</p>
          <h2>Vehicle map</h2>
        </div>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{vehicles.length} visible</span>
          <span className={styles.badgeAlt}>{selectedVehicle?.status ?? 'No selection'}</span>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className={styles.emptyState}>No vehicles match the current filters.</div>
      ) : (
        <div className={styles.mapGrid}>
          <div className={styles.mapCanvas} aria-label="Fleet map">
            <svg viewBox="0 0 1000 650" className={styles.mapGraphic} role="img" aria-label="Stylized fleet map">
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#c7d2fe" />
                </linearGradient>
              </defs>
              <rect width="1000" height="650" rx="28" fill="url(#mapGradient)" />
              <path d="M90 520C160 480 220 432 300 400C380 368 440 324 520 306C600 288 700 292 780 330C860 368 910 412 930 474" fill="none" stroke="#93c5fd" strokeWidth="18" strokeLinecap="round" strokeDasharray="10 18" />
              <path d="M180 180C250 200 320 230 390 250C468 272 540 284 620 272C682 264 742 236 840 180" fill="none" stroke="#bfdbfe" strokeWidth="10" strokeLinecap="round" />
              <path d="M160 360C240 340 280 300 340 280C410 258 490 254 560 276C640 304 710 352 820 348" fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round" opacity="0.65" />
              <circle cx="820" cy="180" r="42" fill="#eff6ff" stroke="#2563eb" strokeWidth="6" />
              <circle cx="690" cy="420" r="28" fill="#eff6ff" stroke="#0f172a" strokeWidth="3" opacity="0.2" />

              {markers.map((marker) => (
                <g key={marker.id} transform={`translate(${marker.x} ${marker.y})`}>
                  <circle r="18" fill={marker.id === selectedVehicleId ? '#16a34a' : '#2563eb'} opacity="0.92" />
                  <circle r="7" fill="#fff" />
                </g>
              ))}
            </svg>

            <div className={styles.markerLayer}>
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  type="button"
                  className={`${styles.marker} ${marker.id === selectedVehicleId ? styles.markerSelected : ''}`}
                  style={{ left: `${marker.x / 10}%`, top: `${marker.y / 6.5}%` }}
                  onClick={() => onSelectVehicle(marker.id === selectedVehicleId ? undefined : marker.id)}
                  aria-label={`Select ${marker.name}`}
                >
                  <span>{marker.status === 'active' ? '●' : '◌'}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className={styles.sideCard}>
            <p className={styles.kicker}>Selected vehicle</p>
            {selectedVehicle ? (
              <>
                <h3>{selectedVehicle.name}</h3>
                <p className={styles.metaText}>{selectedVehicle.type.toUpperCase()}</p>
                <div className={styles.statsGrid}>
                  <div>
                    <span className={styles.statLabel}>Speed</span>
                    <strong>{selectedVehicle.telemetry.speed.toFixed(1)} km/h</strong>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Battery</span>
                    <strong>{selectedVehicle.telemetry.batteryLevel.toFixed(0)}%</strong>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Status</span>
                    <strong>{selectedVehicle.status}</strong>
                  </div>
                  <div>
                    <span className={styles.statLabel}>Last seen</span>
                    <strong>{new Date(selectedVehicle.lastSeen).toLocaleTimeString()}</strong>
                  </div>
                </div>
                <button type="button" className={styles.primaryButton} onClick={() => navigate(`/vehicle/${selectedVehicle.id}`)}>
                  Open vehicle details
                </button>
              </>
            ) : (
              <p className={styles.metaText}>Select a vehicle marker to inspect live telemetry.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default MapView;
