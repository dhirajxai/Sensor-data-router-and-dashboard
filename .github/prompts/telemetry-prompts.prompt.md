---
title: Vehicle Telemetry Visualization Prompts
description: |
  Specialized prompts for common telemetry development tasks. Use these to quickly scaffold components, endpoints, and features with domain-specific patterns.
applyTo:
  - "**/*"
---

# Vehicle Telemetry Visualization Prompts

Use these prompts as shortcuts for common development tasks. Type the prompt keyword (e.g., `/telemetry-component`) in Copilot chat for instant scaffolding.

---

## Telemetry Component

**Keyword**: `telemetry-component`

**Prompt**:
```
I need a production-grade telemetry visualization component.

Component: [Component Name, e.g., "SpeedGauge", "BatteryMonitor"]
Data Source: [WebSocket stream | REST polling | Static props]
Display Type: [Gauge | Chart | Status Card | Alert Panel | Live Feed]
Update Frequency: [100ms | 500ms | 1s | 5s | 30s]
Interactive Features: [None | Filters | Drill-down | Comparisons]
Responsive Requirements: [Mobile-first | Tablet | Desktop | All]
Error Handling: [Retry with fallback | Show error state | Silent degradation]

Requirements:
- Generate fully-typed React component with TypeScript
- Include WebSocket subscription hook
- Add error boundaries and loading states
- Optimize with React.memo and useCallback
- Include comprehensive unit tests
- Follow accessibility standards (ARIA labels, keyboard nav)
- Add performance metrics logging
```

---

## Telemetry API Endpoint

**Keyword**: `telemetry-api`

**Prompt**:
```
I need a production-grade telemetry API endpoint.

Endpoint: [GET | POST | PUT | DELETE] /api/telemetry/[path]
Purpose: [Real-time subscription | Historical data | Aggregations | Mutations]
Data Model: [Vehicle ID | Timestamp | Location | Speed | Battery | Temperature]
Query Parameters: [Time range | Filters | Pagination | Sorting]
Performance Requirements: [QPS | Latency SLA | Cache strategy]
Database: [PostgreSQL + TimescaleDB | MongoDB | Other]

Requirements:
- Generate Express route with validation middleware
- Implement pagination and field filtering
- Add Redis caching strategy
- Include database optimization (indexes, query planning)
- Generate integration tests
- Document rate limiting
- Include monitoring/observability
```

---

## WebSocket Handler

**Keyword**: `websocket-handler`

**Prompt**:
```
I need a WebSocket handler for real-time telemetry streaming.

Event Type: [Vehicle telemetry | Fleet metrics | Alerts | Geofence events]
Update Frequency: [10Hz | 2Hz | 1Hz | Lower]
Client Subscriptions: [Single vehicle | Fleet | Multiple vehicles]
Scalability: [Single server | Multi-server with Redis | Cluster]
Features Needed: [Message batching | Compression | Reconnection recovery]

Requirements:
- Generate Socket.IO namespace handler
- Implement subscription management
- Add authentication and access control
- Include memory-efficient buffering
- Support graceful degradation (fallback to polling)
- Test with concurrent connections
- Monitor connection churn and throughput
```

---

## Fleet Dashboard

**Keyword**: `fleet-dashboard`

**Prompt**:
```
I need a fleet monitoring dashboard component.

Dashboard Elements: [Map | List | Analytics | KPIs | Alerts]
Vehicles to Display: [10-100 | 100-1000 | 1000+]
Real-time Updates: [Yes | No] | Frequency: [100ms | 500ms | 1s]
Interactive Features: [Filtering | Search | Drill-down | Export]
Time Range Analysis: [1h | 6h | 24h | 7d | Custom]
Dark Mode: [Required | Optional | Not needed]

Requirements:
- Build responsive layout (mobile-first)
- Implement vehicle filtering and search
- Add KPI metrics panel
- Include trend charts (Recharts/Chart.js)
- Optimize for 1000+ vehicles (virtual scrolling)
- Real-time updates via WebSocket
- Add keyboard navigation
- Performance: <100ms initial render, <50ms updates
```

---

## Alert System

**Keyword**: `alert-system`

**Prompt**:
```
I need an alert and anomaly detection system.

Alert Types: [Battery low | Speeding | Geofence violation | Engine fault | Idle timeout]
Trigger Conditions: [Real-time detection | Batch processing | Manual review]
Notification Channels: [WebSocket | Email | SMS | In-app]
Alert Priority: [Critical | Warning | Info]
Alert Retention: [7 days | 30 days | Configurable]

Requirements:
- Backend: Create alert rule engine
- Database: Schema for alert definitions and history
- Real-time: WebSocket broadcast to fleet operators
- UI: Alert panel with filtering and dismissal
- Tests: Unit tests for rule engine
- Monitoring: Track alert volume and latency
```

---

## Data Ingestion Pipeline

**Keyword**: `data-ingest`

**Prompt**:
```
I need to build a data ingestion pipeline for vehicle telemetry.

Data Source: [IoT devices | Third-party API | MQTT | Other]
Expected Volume: [100 QPS | 1000 QPS | 10000+ QPS]
Data Format: [JSON | Protocol Buffers | CSV | Other]
Storage: [PostgreSQL | MongoDB | TimescaleDB | Data Lake]
Processing: [Real-time | Batch | Both]
Data Validation: [Schema | Type checking | Range validation]

Requirements:
- Design scalable architecture
- Implement error handling and retry logic
- Add data validation and transformation
- Set up monitoring and alerting
- Create load testing scenario
- Document scaling limits
```

---

## Performance Optimization

**Keyword**: `optimize-telemetry`

**Prompt**:
```
I need to optimize telemetry system performance.

Current Bottleneck: [Frontend rendering | Backend query | Network latency | Database]
Current Metrics: [Latency | Throughput | Memory | CPU]
Target: [Latency < Xms | Throughput > X QPS | Reduce memory by X%]
Constraints: [Budget | Existing tech stack | Team skills]

Requirements:
- Analyze current performance
- Propose optimization strategy
- Implement profiling/monitoring
- Benchmark before/after
- Document trade-offs
- Create performance testing suite
```

---

## Testing & QA

**Keyword**: `telemetry-tests`

**Prompt**:
```
I need comprehensive tests for the telemetry system.

Component/Service: [React component | API endpoint | WebSocket handler | Service]
Test Levels: [Unit | Integration | E2E]
Coverage Target: [80% | 90% | 100%]
Test Data: [Mock | Real database | Fixtures]
Performance Tests: [Required | Optional]

Requirements:
- Write unit tests with >85% coverage
- Create integration tests with database
- Add E2E tests for critical workflows
- Include performance benchmarks
- Document test strategy
- CI/CD pipeline configuration
```

---

## Migration & Legacy Integration

**Keyword**: `telemetry-migration`

**Prompt**:
```
I need to migrate legacy telemetry system to new architecture.

Source System: [System name | API | Database]
Target: [New API | New database | Both]
Timeline: [1 week | 1 month | Phased]
Backward Compatibility: [Required | Optional]
Data Migration: [Zero-downtime | Maintenance window]

Requirements:
- Design migration strategy
- Create data transformation logic
- Implement dual-write for validation
- Set up monitoring and alerts
- Rollback plan
- Testing and validation approach
```

---

## Tips for Using Prompts

1. **Be Specific**: Include exact names, numbers, and requirements
2. **Include Context**: Reference existing code patterns or constraints
3. **Ask for Completeness**: Request full implementations with tests
4. **Performance First**: Always mention latency, throughput, or scaling requirements
5. **Security Awareness**: Specify authentication, authorization, and data privacy needs

---

**Example Usage**:

```
@copilot I need to build a SpeedGauge component using the telemetry-component prompt.

Component: SpeedGauge
Data Source: WebSocket stream (realtime vehicle telemetry)
Display Type: Gauge (circular with needle)
Update Frequency: 500ms
Interactive Features: None (display only)
Responsive Requirements: Mobile-first (mobile, tablet, desktop)
Error Handling: Show error state with retry button

Special Requirements:
- Display color-coded zones: green (0-80), yellow (80-120), red (120+)
- Show current speed and max speed in this session
- Include last update timestamp
- Fallback to last-known value during network issues
```

---

**Last Updated**: May 26, 2026
