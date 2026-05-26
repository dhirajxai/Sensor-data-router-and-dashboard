import { useEffect, useMemo } from 'react';
import { useAppStore } from '@context/store';
import { getAlerts, getFleetData, getFleetMetrics } from '@services/mockData';
import type { VehicleData, Alert, FleetMetrics } from '@shared/index';

interface UseFleetDataResult {
  vehicles: VehicleData[];
  metrics: FleetMetrics;
  alerts: Alert[];
  isLoading: boolean;
  error: Error | null;
}

export function useFleetData(): UseFleetDataResult {
  const fleet = useAppStore((state) => state.fleet);
  const setFleetData = useAppStore((state) => state.setFleetData);

  useEffect(() => {
    if (fleet.hasLoaded) {
      return;
    }

    setFleetData({ isLoading: true, error: null });

    const timer = window.setTimeout(() => {
      try {
        const mockVehicles = getFleetData();
        const mockAlerts = getAlerts();

        setFleetData({
          vehicles: mockVehicles,
          alerts: mockAlerts,
          isLoading: false,
          error: null,
          hasLoaded: true,
        });
      } catch (err) {
        setFleetData({
          isLoading: false,
          error: err instanceof Error ? err : new Error(String(err)),
          hasLoaded: false,
        });
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fleet.hasLoaded, setFleetData]);

  const metrics = useMemo(() => getFleetMetrics(fleet.vehicles, fleet.alerts), [fleet.alerts, fleet.vehicles]);

  return {
    vehicles: fleet.vehicles,
    metrics,
    alerts: fleet.alerts,
    isLoading: fleet.isLoading,
    error: fleet.error,
  };
}
