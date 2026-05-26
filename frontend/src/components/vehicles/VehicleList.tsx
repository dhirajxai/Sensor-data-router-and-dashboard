import { Link } from 'react-router-dom';
import type { VehicleData } from '@shared/index';
import styles from './VehicleList.module.css';

interface VehicleListProps {
  vehicles: VehicleData[];
  selectedVehicleId?: string;
  onSelectVehicle: (vehicleId?: string) => void;
}

const VehicleList = ({ vehicles, selectedVehicleId, onSelectVehicle }: VehicleListProps) => {
  return (
    <section className={styles.container} aria-label="Vehicle list">
      <div className={styles.headerRow}>
        <div>
          <p className={styles.kicker}>Fleet roster</p>
          <h2>Vehicles</h2>
        </div>
        <span className={styles.countBadge}>{vehicles.length} visible</span>
      </div>

      {vehicles.length === 0 ? (
        <div className={styles.emptyState}>No vehicles match the current filters.</div>
      ) : (
        <div className={styles.vehicleGrid}>
          {vehicles.map((vehicle) => {
            const badgeClass =
              vehicle.status === 'offline'
                ? styles.badgeOffline
                : vehicle.status === 'inactive'
                  ? styles.badgeInactive
                  : styles.badge;

            return (
              <article key={vehicle.id} className={styles.vehicleCard}>
                <div className={styles.vehicleTitle}>
                  <h3>{vehicle.name}</h3>
                  <span className={badgeClass}>{vehicle.status}</span>
                </div>
                <p className={styles.metaLine}>{vehicle.id}</p>
                <div className={styles.metricRow}>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Speed</span>
                    <span className={styles.metricValue}>{vehicle.telemetry.speed.toFixed(1)} km/h</span>
                  </div>
                  <div className={styles.metricBlock}>
                    <span className={styles.metricLabel}>Battery</span>
                    <span className={styles.metricValue}>{vehicle.telemetry.batteryLevel.toFixed(0)}%</span>
                  </div>
                </div>
                <p className={styles.metaLine}>Last seen {new Date(vehicle.lastSeen).toLocaleString()}</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className={styles.detailButton}
                    onClick={() => onSelectVehicle(vehicle.id === selectedVehicleId ? undefined : vehicle.id)}
                  >
                    {vehicle.id === selectedVehicleId ? 'Clear selection' : 'Focus on map'}
                  </button>
                  <Link to={`/vehicle/${vehicle.id}`} className={styles.detailButton}>
                    View details
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default VehicleList;
