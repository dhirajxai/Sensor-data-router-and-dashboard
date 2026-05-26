import type { Alert } from '@shared/index';

interface AlertPanelProps {
  alerts: Alert[];
}

const AlertPanel = ({ alerts }: AlertPanelProps) => {
  return (
    <section aria-label="Alert panel">
      <h2>Alerts</h2>
      {alerts.length === 0 ? (
        <p>No active alerts.</p>
      ) : (
        <ul>
          {alerts.map((alert) => (
            <li key={alert.id}>
              <strong>{alert.type}</strong> — {alert.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AlertPanel;
