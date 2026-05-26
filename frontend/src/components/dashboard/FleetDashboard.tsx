import { useMemo } from 'react';
import { useAppStore } from '@context/store';
import { useFleetData } from '@hooks/useFleetData';
import MetricsPanel from './MetricsPanel';
import FilterPanel from './FilterPanel';
import VehicleList from '@components/vehicles/VehicleList';
import AlertPanel from '@components/alerts/AlertPanel';
import MapView from './MapView';
import styles from './FleetDashboard.module.css';

const FleetDashboard = () => {
  const activeTab = useAppStore((state) => state.ui.activeTab);
  const selectedVehicleId = useAppStore((state) => state.ui.selectedVehicleId);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const selectVehicle = useAppStore((state) => state.selectVehicle);
  const filters = useAppStore((state) => state.filters);
  const { vehicles, metrics, alerts, isLoading, error } = useFleetData();

  const filteredVehicles = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesQuery =
        query.length === 0 ||
        vehicle.name.toLowerCase().includes(query) ||
        vehicle.id.toLowerCase().includes(query);

      const matchesStatus = !filters.status || vehicle.status === filters.status;
      const matchesBattery =
        filters.batteryMin === undefined || vehicle.telemetry.batteryLevel >= filters.batteryMin;
      const matchesSpeed = filters.speedMax === undefined || vehicle.telemetry.speed <= filters.speedMax;

      return matchesQuery && matchesStatus && matchesBattery && matchesSpeed;
    });
  }, [filters, vehicles]);

  if (error) {
    return <div className={styles.error}>Failed to load fleet data: {error.message}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.topSection}>
        <MetricsPanel metrics={metrics} isLoading={isLoading} />
        <FilterPanel />
      </section>

      <section className={styles.tabBar} role="tablist" aria-label="Dashboard views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'map'}
          onClick={() => setActiveTab('map')}
          className={activeTab === 'map' ? styles.tabActive : ''}
        >
          🗺️ Map
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
          className={activeTab === 'list' ? styles.tabActive : ''}
        >
          📋 Vehicles
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          className={activeTab === 'analytics' ? styles.tabActive : ''}
        >
          📊 Analytics
        </button>
      </section>

      <section className={styles.contentSection}>
        {isLoading ? (
          <div className={styles.loading}>Loading fleet telemetry...</div>
        ) : (
          <>
            {activeTab === 'map' && (
              <MapView
                vehicles={filteredVehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={selectVehicle}
              />
            )}
            {activeTab === 'list' && (
              <VehicleList
                vehicles={filteredVehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={selectVehicle}
              />
            )}
            {activeTab === 'analytics' && (
              <div className={styles.placeholder}>
                <p>Analytics charts will be rendered here in the next phase.</p>
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.alertSection}>
        <AlertPanel alerts={alerts} />
      </section>
    </div>
  );
};

export default FleetDashboard;
