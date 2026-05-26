---
name: fleet-dashboard-visualization
description: |
  Use when: Building interactive dashboards for fleet operators to visualize vehicles, trends, and metrics. Generates responsive chart components, map integrations, KPI displays, and filtering systems. Handles real-time updates, historical analysis, and drill-down interactions.
authors: [Dhiraj]
---

# Fleet Dashboard Visualization Generator

## Use Cases
- Building live vehicle map with real-time markers
- Creating speed/battery trend charts
- Displaying KPI cards (avg speed, total distance, battery status)
- Building vehicle filter and search UI
- Creating alerts and anomaly displays
- Building fleet health score visualizations

## Component Architecture

### 1. Main Dashboard Layout
```typescript
// components/dashboard/FleetDashboard.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { VehicleMap } from './sections/VehicleMap';
import { MetricsPanel } from './sections/MetricsPanel';
import { VehicleList } from './sections/VehicleList';
import { TrendCharts } from './sections/TrendCharts';
import { AlertsPanel } from './sections/AlertsPanel';
import { useFleetData } from '@hooks/useFleetData';
import { useFilters } from '@hooks/useFilters';
import styles from './FleetDashboard.module.css';

interface DashboardState {
  selectedVehicles: string[];
  timeRange: '1h' | '6h' | '24h' | '7d';
  activeTab: 'map' | 'list' | 'analytics';
  showAlerts: boolean;
}

export const FleetDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>({
    selectedVehicles: [],
    timeRange: '24h',
    activeTab: 'map',
    showAlerts: true,
  });

  const { fleetData, isLoading, error } = useFleetData(state.timeRange);
  const { filters, updateFilter } = useFilters();

  // Memoize filtered vehicle data
  const filteredVehicles = useMemo(() => {
    if (!fleetData?.vehicles) return [];
    
    return fleetData.vehicles.filter(v => {
      if (filters.status && v.status !== filters.status) return false;
      if (filters.batteryMin && v.battery < filters.batteryMin) return false;
      if (filters.speedMax && v.speed > filters.speedMax) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return v.name.toLowerCase().includes(search) || v.id.toLowerCase().includes(search);
      }
      return true;
    });
  }, [fleetData, filters]);

  const metrics = useMemo(() => {
    if (!filteredVehicles) return null;
    return {
      totalVehicles: filteredVehicles.length,
      activeVehicles: filteredVehicles.filter(v => v.status === 'active').length,
      avgSpeed: (
        filteredVehicles.reduce((sum, v) => sum + v.speed, 0) / filteredVehicles.length
      ).toFixed(1),
      lowBattery: filteredVehicles.filter(v => v.battery < 20).length,
    };
  }, [filteredVehicles]);

  if (error) {
    return (
      <div className={styles.error} role="alert">
        <h2>Error Loading Dashboard</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Fleet Monitoring</h1>
        <TimeRangeSelector
          value={state.timeRange}
          onChange={(timeRange) => setState(prev => ({ ...prev, timeRange }))}
        />
      </header>

      <div className={styles.container}>
        {/* Left Sidebar - Filters and Metrics */}
        <aside className={styles.sidebar}>
          <MetricsPanel metrics={metrics} isLoading={isLoading} />
          <FilterPanel filters={filters} onFilterChange={updateFilter} />
          {state.showAlerts && <AlertsPanel alerts={fleetData?.alerts} />}
        </aside>

        {/* Main Content Area */}
        <main className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Loading fleet data...</div>
          ) : (
            <>
              {state.activeTab === 'map' && (
                <VehicleMap vehicles={filteredVehicles} onSelect={(vehicleId) => {
                  setState(prev => ({
                    ...prev,
                    selectedVehicles: [vehicleId],
                  }));
                }} />
              )}
              {state.activeTab === 'list' && (
                <VehicleList vehicles={filteredVehicles} />
              )}
              {state.activeTab === 'analytics' && (
                <TrendCharts vehicles={filteredVehicles} timeRange={state.timeRange} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Tab Navigation */}
      <nav className={styles.tabs}>
        <button
          className={state.activeTab === 'map' ? styles.active : ''}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'map' }))}
        >
          🗺️ Map View
        </button>
        <button
          className={state.activeTab === 'list' ? styles.active : ''}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'list' }))}
        >
          📋 Vehicle List
        </button>
        <button
          className={state.activeTab === 'analytics' ? styles.active : ''}
          onClick={() => setState(prev => ({ ...prev, activeTab: 'analytics' }))}
        >
          📊 Analytics
        </button>
      </nav>
    </div>
  );
};

export default FleetDashboard;
```

### 2. Vehicle Map Component (Mapbox/Leaflet)
```typescript
// components/dashboard/sections/VehicleMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Vehicle } from '@types/vehicle';
import styles from './VehicleMap.module.css';

interface VehicleMapProps {
  vehicles: Vehicle[];
  onSelect: (vehicleId: string) => void;
}

export const VehicleMap: React.FC<VehicleMapProps> = ({ vehicles, onSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<Map<string, mapboxgl.Marker>>(new Map());

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.4194, 37.7749], // Default: San Francisco
      zoom: 12,
      accessToken: process.env.REACT_APP_MAPBOX_TOKEN,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers for vehicles
  useEffect(() => {
    if (!map.current) return;

    const newMarkers = new Map(markers);

    // Add/update markers
    vehicles.forEach(vehicle => {
      if (!vehicle.location) return;

      const markerId = vehicle.id;
      const existing = newMarkers.get(markerId);

      if (existing) {
        // Update position
        existing.setLngLat([vehicle.location.longitude, vehicle.location.latitude]);
      } else {
        // Create new marker
        const el = createMarkerElement(vehicle);
        const marker = new mapboxgl.Marker(el, { anchor: 'center' })
          .setLngLat([vehicle.location.longitude, vehicle.location.latitude])
          .addTo(map.current!);

        el.addEventListener('click', () => onSelect(vehicle.id));
        newMarkers.set(markerId, marker);
      }
    });

    // Remove markers for vehicles no longer in list
    const activeVehicleIds = new Set(vehicles.map(v => v.id));
    for (const [id, marker] of newMarkers.entries()) {
      if (!activeVehicleIds.has(id)) {
        marker.remove();
        newMarkers.delete(id);
      }
    }

    setMarkers(newMarkers);
  }, [vehicles, onSelect]);

  return <div ref={mapContainer} className={styles.mapContainer} />;
};

function createMarkerElement(vehicle: Vehicle): HTMLElement {
  const el = document.createElement('div');
  el.className = 'marker';
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.backgroundImage = getMarkerIcon(vehicle.status, vehicle.batteryLevel);
  el.style.backgroundSize = '100%';
  el.style.cursor = 'pointer';
  return el;
}

function getMarkerIcon(status: string, battery: number): string {
  // SVG data URI for marker
  const color = status === 'active' ? '#22c55e' : '#ef4444';
  const batteryColor = battery < 20 ? '#ef4444' : battery < 50 ? '#eab308' : '#22c55e';
  // Return encoded SVG
  return `url('data:image/svg+xml...')`;
}
```

### 3. Trend Charts Component (Recharts)
```typescript
// components/dashboard/sections/TrendCharts.tsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Vehicle } from '@types/vehicle';
import { useHistoricalData } from '@hooks/useHistoricalData';

interface TrendChartsProps {
  vehicles: Vehicle[];
  timeRange: string;
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ vehicles, timeRange }) => {
  const { speedTrends, batteryTrends, distanceTrends } = useHistoricalData(
    vehicles.map(v => v.id),
    timeRange,
  );

  const avgSpeedData = useMemo(() => {
    if (!speedTrends) return [];
    return speedTrends.map((point: any) => ({
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      avgSpeed: point.average.toFixed(1),
      maxSpeed: point.max.toFixed(1),
    }));
  }, [speedTrends]);

  const batteryData = useMemo(() => {
    if (!batteryTrends) return [];
    return batteryTrends.map((point: any) => ({
      timestamp: new Date(point.timestamp).toLocaleTimeString(),
      avgBattery: point.average.toFixed(1),
      minBattery: point.min.toFixed(1),
    }));
  }, [batteryTrends]);

  return (
    <div className="charts-container">
      {/* Speed Trend */}
      <div className="chart">
        <h3>Speed Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={avgSpeedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgSpeed"
              stroke="#3b82f6"
              name="Avg Speed (km/h)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="maxSpeed"
              stroke="#ef4444"
              name="Max Speed (km/h)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Battery Trend */}
      <div className="chart">
        <h3>Battery Levels</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={batteryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="avgBattery"
              fill="#22c55e"
              name="Avg Battery (%)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="minBattery"
              fill="#ef4444"
              name="Min Battery (%)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Distance Traveled */}
      <div className="chart">
        <h3>Distance Traveled</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={distanceTrends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="totalDistance"
              stroke="#8b5cf6"
              name="Total Distance (km)"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

### 4. Metrics Panel
```typescript
// components/dashboard/sections/MetricsPanel.tsx
import React from 'react';
import styles from './MetricsPanel.module.css';

interface Metrics {
  totalVehicles: number;
  activeVehicles: number;
  avgSpeed: string;
  lowBattery: number;
}

interface MetricsPanelProps {
  metrics: Metrics | null;
  isLoading: boolean;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, isLoading }) => {
  if (!metrics || isLoading) return <div className={styles.loading}>Loading metrics...</div>;

  return (
    <div className={styles.metricsPanel}>
      <MetricCard
        label="Total Vehicles"
        value={metrics.totalVehicles}
        icon="🚗"
      />
      <MetricCard
        label="Active Now"
        value={metrics.activeVehicles}
        icon="✅"
        status="good"
      />
      <MetricCard
        label="Avg Speed"
        value={`${metrics.avgSpeed} km/h`}
        icon="⚡"
      />
      <MetricCard
        label="Low Battery"
        value={metrics.lowBattery}
        icon="🔋"
        status={metrics.lowBattery > 0 ? 'warning' : 'good'}
      />
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  status?: 'good' | 'warning' | 'critical';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, status = 'neutral' }) => (
  <div className={`${styles.card} ${styles[status]}`}>
    <div className={styles.icon}>{icon}</div>
    <div className={styles.label}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
);
```

## Responsive Design

- **Mobile**: Stacked layout, single column
- **Tablet**: Sidebar + main content (2 columns)
- **Desktop**: Full 3-column layout with expanded charts

## Real-Time Updates

Use WebSocket subscriptions to update:
- Marker positions on map (every 500ms)
- Metrics cards (every 1s)
- Chart data points (every 30s aggregation)

## Performance

- Virtual scrolling for vehicle lists >1000 items
- Lazy-load chart data (fetch on tab activation)
- Memoize filtered/computed data with useMemo
- Debounce filter changes to prevent excessive re-renders

## Accessibility

- Keyboard navigation for tabs and buttons
- ARIA labels for charts and metrics
- Color contrast compliance (WCAG AA minimum)
- Screen reader support for dynamic updates
