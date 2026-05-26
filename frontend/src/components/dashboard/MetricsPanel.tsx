import type { FleetMetrics } from '@shared/index';
import styles from './MetricsPanel.module.css';

interface MetricsPanelProps {
  metrics: FleetMetrics;
  isLoading: boolean;
}

const MetricCard = ({ label, value, status }: { label: string; value: string | number; status?: 'good' | 'warning' | 'critical' }) => {
  const className = [styles.card, status ? styles[status] : ''].join(' ').trim();
  return (
    <div className={className}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};

const MetricsPanel = ({ metrics, isLoading }: MetricsPanelProps) => {
  if (isLoading) {
    return <div className={styles.loading}>Loading summary metrics...</div>;
  }

  return (
    <section className={styles.panel} aria-label="Fleet metrics">
      <MetricCard label="Total Vehicles" value={metrics.totalVehicles} status="good" />
      <MetricCard label="Active Vehicles" value={metrics.activeVehicles} status="good" />
      <MetricCard label="Average Speed" value={`${metrics.avgSpeed.toFixed(1)} km/h`} status="warning" />
      <MetricCard label="Low Battery" value={metrics.lowBatteryCount} status={metrics.lowBatteryCount > 0 ? 'critical' : 'good'} />
    </section>
  );
};

export default MetricsPanel;
