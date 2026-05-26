---
name: telemetry-api-endpoint
description: |
  Use when: Building production-grade backend API endpoints for telemetry data retrieval, ingestion, and querying. Generates Express routes with validation, error handling, caching, pagination, and database optimization. Handles bulk inserts, time-series queries, and real-time subscriptions.
authors: [Dhiraj]
---

# Telemetry API Endpoint Generator

## Use Cases
- Creating a vehicle telemetry history endpoint
- Building real-time telemetry WebSocket listener
- Creating aggregated metrics endpoints (speed average, battery trend)
- Building alert/anomaly detection endpoints
- Creating fleet-wide dashboard API
- Building data export endpoints

## Workflow

### 1. Define Endpoint Requirements
- **Method**: GET (query), POST (insert), PUT (update), DELETE (remove)
- **Purpose**: Real-time subscription, historical data, aggregations, mutations
- **Data Volume**: Expected QPS, payload size, retention period
- **Authentication**: User-based, vehicle-based, fleet-based access control
- **Response Format**: JSON with pagination, metadata, timestamps

### 2. Express Endpoint Template
```typescript
// routes/telemetry.ts
import express, { Router } from 'express';
import { authenticateUser, validateVehicleOwnership } from '@middleware/auth';
import { validateRequest } from '@middleware/validation';
import { asyncHandler } from '@middleware/asyncHandler';
import telemetryController from '@controllers/telemetryController';

const router = Router();

/**
 * GET /api/telemetry/vehicle/:vehicleId/history
 * Retrieve historical telemetry data with pagination and filtering
 */
router.get(
  '/vehicle/:vehicleId/history',
  authenticateUser,
  validateVehicleOwnership,
  validateRequest({
    query: {
      startTime: 'ISO8601',
      endTime: 'ISO8601',
      limit: 'number(1-1000)',
      offset: 'number(0+)',
      fields: 'string (comma-separated)',
    },
  }),
  asyncHandler(telemetryController.getTelemetryHistory),
);

/**
 * POST /api/telemetry/vehicle/:vehicleId/ingest
 * Ingest real-time telemetry from vehicle IoT device
 */
router.post(
  '/vehicle/:vehicleId/ingest',
  validateRequest({
    body: {
      timestamp: 'ISO8601',
      location: { latitude: 'number', longitude: 'number' },
      speed: 'number',
      batteryLevel: 'number(0-100)',
      temperature: 'number',
      ignitionStatus: 'boolean',
    },
  }),
  asyncHandler(telemetryController.ingestTelemetry),
);

/**
 * GET /api/telemetry/vehicle/:vehicleId/current
 * Get latest telemetry snapshot (cached)
 */
router.get(
  '/vehicle/:vehicleId/current',
  authenticateUser,
  validateVehicleOwnership,
  asyncHandler(telemetryController.getCurrentTelemetry),
);

/**
 * GET /api/telemetry/fleet/dashboard
 * Get aggregated metrics for fleet monitoring
 */
router.get(
  '/fleet/dashboard',
  authenticateUser,
  validateRequest({
    query: {
      timeWindow: 'string(1h,6h,24h)',
      aggregation: 'string(avg,min,max,latest)',
    },
  }),
  asyncHandler(telemetryController.getFleetDashboard),
);

export default router;
```

### 3. Controller Implementation
```typescript
// controllers/telemetryController.ts
import { Request, Response } from 'express';
import { TelemetryService } from '@services/TelemetryService';
import { CacheService } from '@services/CacheService';
import { Logger } from '@utils/logger';

const logger = Logger.getLogger('TelemetryController');
const telemetryService = new TelemetryService();
const cacheService = new CacheService();

interface TelemetryHistoryQuery {
  vehicleId: string;
  startTime: string;
  endTime: string;
  limit: number;
  offset: number;
  fields?: string[];
}

export const getTelemetryHistory = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { startTime, endTime, limit = 100, offset = 0, fields } = req.query;

  try {
    // Validate time range (max 30 days)
    const start = new Date(startTime as string);
    const end = new Date(endTime as string);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 30) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TIME_RANGE',
          message: 'Query window cannot exceed 30 days',
        },
      });
    }

    // Check cache first
    const cacheKey = `telemetry:${vehicleId}:${startTime}:${endTime}:${limit}:${offset}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return res.json({
        success: true,
        data: cached,
        _cache: true,
      });
    }

    // Query database with pagination
    const result = await telemetryService.getHistory({
      vehicleId,
      startTime: start,
      endTime: end,
      limit,
      offset,
      fields: fields ? (fields as string).split(',') : undefined,
    });

    // Cache result (5 minutes for historical data)
    await cacheService.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + limit < result.total,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error fetching telemetry history for ${vehicleId}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve telemetry history',
      },
    });
  }
};

export const ingestTelemetry = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const telemetryData = req.body;

  try {
    // Store in database (time-series optimized)
    const saved = await telemetryService.ingest({
      vehicleId,
      ...telemetryData,
    });

    // Update current snapshot in cache (fast lookup)
    const cacheKey = `current:${vehicleId}`;
    await cacheService.set(cacheKey, saved, 3600); // 1 hour TTL

    // Publish to WebSocket subscribers (real-time broadcast)
    await telemetryService.publishUpdate(vehicleId, saved);

    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    logger.error(`Error ingesting telemetry for ${vehicleId}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INGEST_ERROR',
        message: 'Failed to store telemetry data',
      },
    });
  }
};

export const getCurrentTelemetry = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;

  try {
    // Try cache first (typically <100ms)
    const cacheKey = `current:${vehicleId}`;
    let data = await cacheService.get(cacheKey);

    if (!data) {
      // Fall back to database (typically <500ms)
      data = await telemetryService.getLatest(vehicleId);
      if (!data) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `No telemetry found for vehicle ${vehicleId}`,
          },
        });
      }
      // Populate cache for next request
      await cacheService.set(cacheKey, data, 3600);
    }

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Error fetching current telemetry for ${vehicleId}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve telemetry',
      },
    });
  }
};

export const getFleetDashboard = async (req: Request, res: Response) => {
  const { timeWindow = '24h', aggregation = 'latest' } = req.query;
  const userId = req.user.id;

  try {
    // Get all vehicles for user's fleet
    const vehicles = await telemetryService.getUserFleetVehicles(userId);

    if (!vehicles.length) {
      return res.json({
        success: true,
        data: {
          vehicles: [],
          metrics: {},
        },
      });
    }

    // Aggregate telemetry across fleet
    const fleetMetrics = await telemetryService.aggregateFleet(
      vehicles.map(v => v.id),
      timeWindow as string,
      aggregation as string,
    );

    res.json({
      success: true,
      data: {
        vehicles: vehicles.length,
        timeWindow,
        metrics: fleetMetrics,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching fleet dashboard:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AGGREGATION_ERROR',
        message: 'Failed to compute fleet metrics',
      },
    });
  }
};

export default {
  getTelemetryHistory,
  ingestTelemetry,
  getCurrentTelemetry,
  getFleetDashboard,
};
```

### 4. Database Schema (PostgreSQL)
```sql
-- Time-series optimized schema with hypertable (for TimescaleDB)
CREATE TABLE telemetry (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL,
  location POINT NOT NULL, -- PostgreSQL geometry for spatial queries
  speed NUMERIC(5,2) NOT NULL,
  battery_level NUMERIC(5,2) CHECK (battery_level >= 0 AND battery_level <= 100),
  temperature NUMERIC(5,2),
  ignition_status BOOLEAN NOT NULL,
  distance_traveled NUMERIC(10,2),
  
  CONSTRAINT valid_speed CHECK (speed >= 0),
  CONSTRAINT valid_temperature CHECK (temperature IS NULL OR temperature > -50)
);

-- Create hypertable for time-series optimization (if using TimescaleDB)
SELECT create_hypertable('telemetry', 'timestamp', if_not_exists => TRUE);

-- Essential indexes for query performance
CREATE INDEX idx_telemetry_vehicle_timestamp 
  ON telemetry (vehicle_id, timestamp DESC);
CREATE INDEX idx_telemetry_timestamp 
  ON telemetry (timestamp DESC);
CREATE INDEX idx_telemetry_location 
  ON telemetry USING GIST (location);

-- Retention policy (30 days raw data, then aggregate)
SELECT add_retention_policy('telemetry', INTERVAL '30 days', if_not_exists => TRUE);
```

### 5. Testing Template
```typescript
// routes/__tests__/telemetry.test.ts
import request from 'supertest';
import app from '@app';
import { TelemetryService } from '@services/TelemetryService';

jest.mock('@services/TelemetryService');

describe('Telemetry API', () => {
  describe('GET /api/telemetry/vehicle/:vehicleId/current', () => {
    it('returns latest telemetry with 200 status', async () => {
      const vehicleId = 'vehicle-1';
      const mockData = {
        timestamp: new Date().toISOString(),
        speed: 65.5,
        batteryLevel: 85,
      };

      (TelemetryService.prototype.getLatest as jest.Mock).mockResolvedValue(mockData);

      const res = await request(app)
        .get(`/api/telemetry/vehicle/${vehicleId}/current`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockData);
    });

    it('returns 404 when telemetry not found', async () => {
      (TelemetryService.prototype.getLatest as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/telemetry/vehicle/unknown/current`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/telemetry/vehicle/:vehicleId/ingest', () => {
    it('accepts valid telemetry data', async () => {
      const payload = {
        timestamp: new Date().toISOString(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        speed: 55,
        batteryLevel: 90,
        ignitionStatus: true,
      };

      const res = await request(app)
        .post('/api/telemetry/vehicle/vehicle-1/ingest')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects invalid battery level', async () => {
      const payload = {
        timestamp: new Date().toISOString(),
        location: { latitude: 37.7749, longitude: -122.4194 },
        speed: 55,
        batteryLevel: 150, // Invalid
        ignitionStatus: true,
      };

      const res = await request(app)
        .post('/api/telemetry/vehicle/vehicle-1/ingest')
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
```

## Performance Optimization

1. **Time-Series Database**: Use TimescaleDB (PostgreSQL extension) for compression and automatic downsampling.
2. **Indexing**: Create composite indexes on (vehicle_id, timestamp) for fast lookups.
3. **Caching**: Cache current telemetry snapshots (short TTL), historical queries (long TTL).
4. **Pagination**: Always paginate large result sets (default 100, max 1000).
5. **Bulk Inserts**: Use COPY for bulk telemetry ingestion from IoT devices.

## Security Considerations

1. **Access Control**: Validate that authenticated user owns the vehicle/fleet.
2. **Rate Limiting**: Limit ingest to 100 records/second per vehicle.
3. **Input Validation**: Reject invalid coordinates, impossible speeds, etc.
4. **Data Privacy**: Encrypt GPS coordinates at rest and in transit.

## Monitoring & Observasting

- Track endpoint latency (p50, p95, p99).
- Monitor cache hit rates.
- Alert on ingestion failures or anomalies.
- Log all API access with timestamp, user, vehicle, action.
