import type { Vehicle, VehicleData, TelemetrySnapshot, Alert, FleetMetrics } from '@shared/index';

/**
 * Mock vehicle data - 15 realistic vehicles
 */
const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-001',
    name: 'Tesla Model 3 - Alpha',
    type: 'car',
    status: 'active',
    vin: '5YJ3E1EA7JF000001',
    licensePlate: 'TM3-001',
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: 'vehicle-002',
    name: 'Ford Transit Van',
    type: 'truck',
    status: 'active',
    vin: '1FTDS1DT5FFC12345',
    licensePlate: 'FT-002',
    lastSeen: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: 'vehicle-003',
    name: 'BMW i4 - Fleet',
    type: 'car',
    status: 'active',
    vin: '4F4CF1DE3MG000003',
    licensePlate: 'BMW-003',
    lastSeen: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: 'vehicle-004',
    name: 'Volvo XC90 - Executive',
    type: 'car',
    status: 'active',
    vin: 'YV1LS57D992230004',
    licensePlate: 'XC90-004',
    lastSeen: new Date(Date.now() - 8 * 60000).toISOString(),
  },
  {
    id: 'vehicle-005',
    name: 'Mercedes Sprinter',
    type: 'truck',
    status: 'inactive',
    vin: 'WDAPF4CC5GA123456',
    licensePlate: 'SPR-005',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'vehicle-006',
    name: 'Audi A6 - Sales',
    type: 'car',
    status: 'active',
    vin: 'WAUYGAFF1EN000006',
    licensePlate: 'AUD-006',
    lastSeen: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'vehicle-007',
    name: 'Harley-Davidson Street 750',
    type: 'bike',
    status: 'offline',
    vin: 'R16DB07A48A000007',
    licensePlate: 'HD-007',
    lastSeen: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'vehicle-008',
    name: 'Chevrolet Bolt EV',
    type: 'car',
    status: 'active',
    vin: '1G1FV6S08F1150008',
    licensePlate: 'CHV-008',
    lastSeen: new Date(Date.now() - 3 * 60000).toISOString(),
  },
  {
    id: 'vehicle-009',
    name: 'Hyundai Ioniq 5',
    type: 'car',
    status: 'active',
    vin: 'KM8K33AG0CU000009',
    licensePlate: 'HYU-009',
    lastSeen: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'vehicle-010',
    name: 'MAN Truck',
    type: 'truck',
    status: 'active',
    vin: 'WMA0AZBZ5C0000010',
    licensePlate: 'MAN-010',
    lastSeen: new Date(Date.now() - 6 * 60000).toISOString(),
  },
  {
    id: 'vehicle-011',
    name: 'Nissan Leaf',
    type: 'car',
    status: 'inactive',
    vin: '1N4BZ1CP5HC000011',
    licensePlate: 'NIS-011',
    lastSeen: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'vehicle-012',
    name: 'Porsche Taycan',
    type: 'car',
    status: 'active',
    vin: 'WP0AA2Y55KL000012',
    licensePlate: 'POR-012',
    lastSeen: new Date(Date.now() - 4 * 60000).toISOString(),
  },
  {
    id: 'vehicle-013',
    name: 'Scania R440',
    type: 'truck',
    status: 'active',
    vin: 'XSCSCD0FKC0000013',
    licensePlate: 'SCA-013',
    lastSeen: new Date(Date.now() - 9 * 60000).toISOString(),
  },
  {
    id: 'vehicle-014',
    name: 'Honda Civic',
    type: 'car',
    status: 'offline',
    vin: '2HGCV52607H500014',
    licensePlate: 'HON-014',
    lastSeen: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'vehicle-015',
    name: 'Kia EV6',
    type: 'car',
    status: 'active',
    vin: 'KNDC4AE46N1000015',
    licensePlate: 'KIA-015',
    lastSeen: new Date(Date.now() - 7 * 60000).toISOString(),
  },
];

/**
 * Generate random telemetry data for a vehicle
 */
function generateTelemetry(vehicleId: string): TelemetrySnapshot {
  const baseLocations: Record<string, { lat: number; lng: number }> = {
    'vehicle-001': { lat: 37.7749, lng: -122.4194 }, // SF
    'vehicle-002': { lat: 37.3382, lng: -121.8863 }, // San Jose
    'vehicle-003': { lat: 37.8044, lng: -122.2712 }, // Oakland
    'vehicle-004': { lat: 37.5485, lng: -122.2363 }, // Palo Alto
    'vehicle-005': { lat: 37.4419, lng: -122.143 }, // Mountain View
    'vehicle-006': { lat: 37.5382, lng: -121.9873 }, // Hayward
    'vehicle-007': { lat: 37.6879, lng: -122.0808 }, // Berkeley
    'vehicle-008': { lat: 37.4419, lng: -122.143 }, // Mountain View
    'vehicle-009': { lat: 37.3382, lng: -121.8863 }, // San Jose
    'vehicle-010': { lat: 37.7749, lng: -122.4194 }, // SF
    'vehicle-011': { lat: 37.8044, lng: -122.2712 }, // Oakland
    'vehicle-012': { lat: 37.5485, lng: -122.2363 }, // Palo Alto
    'vehicle-013': { lat: 37.4419, lng: -122.143 }, // Mountain View
    'vehicle-014': { lat: 37.3382, lng: -121.8863 }, // San Jose
    'vehicle-015': { lat: 37.5382, lng: -121.9873 }, // Hayward
  };

  const loc = baseLocations[vehicleId] || { lat: 37.7749, lng: -122.4194 };

  return {
    vehicleId,
    timestamp: new Date().toISOString(),
    location: {
      latitude: loc.lat + (Math.random() - 0.5) * 0.1,
      longitude: loc.lng + (Math.random() - 0.5) * 0.1,
      accuracy: Math.random() * 20,
    },
    speed: Math.random() * 130,
    heading: Math.random() * 360,
    temperature: 20 + Math.random() * 20,
    batteryLevel: 30 + Math.random() * 70,
    ignitionStatus: Math.random() > 0.2,
    distanceTraveled: Math.random() * 500,
  };
}

/**
 * Generate mock alerts
 */
function generateAlerts(): Alert[] {
  return [
    {
      id: 'alert-001',
      vehicleId: 'vehicle-005',
      type: 'low_battery',
      severity: 'warning',
      message: 'Battery level below 25%',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 'alert-002',
      vehicleId: 'vehicle-007',
      type: 'offline',
      severity: 'critical',
      message: 'Vehicle offline for 2+ hours',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'alert-003',
      vehicleId: 'vehicle-003',
      type: 'speeding',
      severity: 'warning',
      message: 'Exceeding speed limit (80 km/h in 60 zone)',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'alert-004',
      vehicleId: 'vehicle-010',
      type: 'engine_fault',
      severity: 'critical',
      message: 'Engine temperature critical',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    },
    {
      id: 'alert-005',
      vehicleId: 'vehicle-011',
      type: 'idle_timeout',
      severity: 'info',
      message: 'Vehicle idle for 3+ hours',
      timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    },
    {
      id: 'alert-006',
      vehicleId: 'vehicle-014',
      type: 'offline',
      severity: 'critical',
      message: 'Vehicle offline (last seen 1.5 hours ago)',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    },
  ];
}

/**
 * Get all mock vehicles with current telemetry
 */
export function getFleetData(): VehicleData[] {
  return mockVehicles.map((vehicle) => ({
    ...vehicle,
    telemetry: generateTelemetry(vehicle.id),
  }));
}

/**
 * Get single vehicle with telemetry
 */
export function getVehicleData(vehicleId: string): VehicleData | null {
  const vehicle = mockVehicles.find((v) => v.id === vehicleId);
  if (!vehicle) return null;

  return {
    ...vehicle,
    telemetry: generateTelemetry(vehicleId),
  };
}

/**
 * Get all mock alerts
 */
export function getAlerts(): Alert[] {
  return generateAlerts();
}

/**
 * Calculate fleet metrics
 */
export function getFleetMetrics(vehicles: VehicleData[], alerts: Alert[] = generateAlerts()): FleetMetrics {
  const activeCount = vehicles.filter((v) => v.status === 'active').length;
  const inactiveCount = vehicles.filter((v) => v.status === 'inactive').length;
  const offlineCount = vehicles.filter((v) => v.status === 'offline').length;
  const lowBatteryCount = vehicles.filter((v) => v.telemetry.batteryLevel < 20).length;

  const speeds = vehicles.map((v) => v.telemetry.speed);
  const batteries = vehicles.map((v) => v.telemetry.batteryLevel);

  return {
    totalVehicles: vehicles.length,
    activeVehicles: activeCount,
    inactiveVehicles: inactiveCount,
    offlineVehicles: offlineCount,
    avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
    maxSpeed: Math.max(...speeds),
    minSpeed: Math.min(...speeds),
    lowBatteryCount,
    avgBattery: batteries.reduce((a, b) => a + b, 0) / batteries.length,
    alertCount: alerts.length,
    criticalAlertCount: alerts.filter((alert) => alert.severity === 'critical').length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get historical telemetry data (mock)
 */
export function getHistoricalData(
  _vehicleId: string,
  timeRange: '1h' | '6h' | '24h' | '7d'
): Array<{
  timestamp: string;
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  avgBattery: number;
  minBattery: number;
  sampleCount: number;
}> {
  const pointsCount = timeRange === '1h' ? 60 : timeRange === '6h' ? 360 : timeRange === '24h' ? 1440 : 10080;
  const interval = timeRange === '1h' ? 1 : timeRange === '6h' ? 1 : timeRange === '24h' ? 1 : 1;

  const data = [];
  for (let i = 0; i < pointsCount; i++) {
    const timestamp = new Date(Date.now() - (pointsCount - i) * 60000 * interval).toISOString();
    data.push({
      timestamp,
      avgSpeed: 40 + Math.random() * 40,
      maxSpeed: 80 + Math.random() * 50,
      minSpeed: 20 + Math.random() * 20,
      avgBattery: 50 + Math.random() * 30,
      minBattery: 40 + Math.random() * 30,
      sampleCount: Math.floor(Math.random() * 60) + 10,
    });
  }

  return data;
}
