import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useFleetData } from '@hooks/useFleetData';

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { vehicles } = useFleetData();

  const vehicle = useMemo(() => vehicles.find((item) => item.id === id) ?? null, [id, vehicles]);

  if (!vehicle) {
    return <div>Vehicle not found.</div>;
  }

  return (
    <section aria-label="Vehicle details">
      <h2>{vehicle.name}</h2>
      <p>Status: {vehicle.status}</p>
      <p>Speed: {vehicle.telemetry.speed.toFixed(1)} km/h</p>
      <p>Battery: {vehicle.telemetry.batteryLevel.toFixed(1)}%</p>
      <p>Last seen: {vehicle.lastSeen}</p>
    </section>
  );
};

export default VehicleDetail;
