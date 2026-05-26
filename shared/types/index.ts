/**
 * Core shared types for Vehicle Telemetry Visualization Platform
 * Used by both frontend and backend
 */

/**
 * Vehicle status indicator
 */
export type VehicleStatus = 'active' | 'inactive' | 'offline' | 'idle';

/**
 * Alert severity level
 */
export type AlertSeverity = 'critical' | 'warning' | 'info';

/**
 * Alert type identifier
 */
export type AlertType = 'low_battery' | 'speeding' | 'offline' | 'engine_fault' | 'idle_timeout' | 'geofence_violation';

/**
 * Vehicle geographic location
 */
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
}

/**
 * Single telemetry data point for a vehicle
 */
export interface TelemetrySnapshot {
  vehicleId: string;
  timestamp: string; // ISO 8601
  location: Location;
  speed: number; // km/h
  heading?: number; // degrees 0-360
  temperature?: number; // Celsius
  batteryLevel: number; // 0-100%
  ignitionStatus: boolean;
  distanceTraveled?: number; // km
  [key: string]: unknown; // extensible
}

/**
 * Vehicle information (static)
 */
export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'truck' | 'bike' | 'bus' | 'other';
  status: VehicleStatus;
  vin?: string;
  licensePlate?: string;
  lastSeen: string; // ISO 8601
  createdAt?: string; // ISO 8601
}

/**
 * Vehicle with current telemetry
 */
export interface VehicleData extends Vehicle {
  telemetry: TelemetrySnapshot;
}

/**
 * Fleet-wide aggregated metrics
 */
export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  inactiveVehicles: number;
  offlineVehicles: number;
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  minSpeed: number; // km/h
  lowBatteryCount: number; // < 20%
  avgBattery: number; // percentage
  alertCount: number;
  criticalAlertCount: number;
  timestamp: string; // ISO 8601
}

/**
 * Historical telemetry data point (aggregated)
 */
export interface TelemetryHistoryPoint {
  timestamp: string; // ISO 8601
  vehicleId?: string; // optional for fleet-wide data
  avgSpeed: number;
  maxSpeed: number;
  minSpeed: number;
  avgBattery: number;
  minBattery: number;
  avgTemperature?: number;
  sampleCount: number;
}

/**
 * Alert/Notification
 */
export interface Alert {
  id: string;
  vehicleId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string; // ISO 8601
  resolved?: boolean;
  resolvedAt?: string; // ISO 8601
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string; // ISO 8601
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage<T = unknown> {
  event: string;
  data: T;
  timestamp: string; // ISO 8601
}
