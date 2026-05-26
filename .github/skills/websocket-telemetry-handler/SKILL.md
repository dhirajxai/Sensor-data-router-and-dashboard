---
name: websocket-telemetry-handler
description: |
  Use when: Building real-time WebSocket handlers for live telemetry streaming, subscription management, and multi-client broadcasting. Generates Socket.IO namespaces with authentication, subscription logic, reconnection handling, and memory-efficient message batching for high-throughput scenarios.
authors: [Dhiraj]
---

# WebSocket Telemetry Handler Generator

## Use Cases
- Creating live vehicle tracking stream
- Building real-time battery/speed monitoring
- Implementing alert broadcasting system
- Creating multi-vehicle subscription manager
- Building driver behavior monitoring feeds
- Implementing geofence event notifications

## Workflow

### 1. Socket.IO Server Setup
```typescript
// services/socketServer.ts
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { Logger } from '@utils/logger';
import { authenticateSocket } from '@middleware/auth';
import { TelemetryNamespace } from './namespaces/telemetryNamespace';
import { AlertNamespace } from './namespaces/alertNamespace';

const logger = Logger.getLogger('SocketServer');

export class SocketIOServer {
  private io: Server;
  private telemetryNamespace: TelemetryNamespace;
  private alertNamespace: AlertNamespace;

  constructor(app: express.Application) {
    const httpServer = createServer(app);
    this.io = new Server(httpServer, {
      cors: { origin: process.env.CLIENT_URL, credentials: true },
      transports: ['websocket', 'polling'], // Fallback to polling if needed
      serveClient: false,
      maxHttpBufferSize: 1e6, // 1MB max message
      pingInterval: 25000,
      pingTimeout: 60000,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true,
      },
    });

    // Middleware: Authenticate on connection
    this.io.use(authenticateSocket);

    // Initialize namespaces
    this.telemetryNamespace = new TelemetryNamespace(this.io);
    this.alertNamespace = new AlertNamespace(this.io);

    // Global event handlers
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.user?.id;
      logger.info(`Client connected: ${socket.id} (User: ${userId})`);

      socket.on('disconnect', (reason: string) => {
        logger.info(`Client disconnected: ${socket.id} (Reason: ${reason})`);
      });

      socket.on('error', (error: any) => {
        logger.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  public getIO(): Server {
    return this.io;
  }

  public start(port: number) {
    const httpServer = this.io.httpServer;
    httpServer?.listen(port, () => {
      logger.info(`Socket.IO server running on port ${port}`);
    });
  }
}
```

### 2. Telemetry Namespace Handler
```typescript
// services/namespaces/telemetryNamespace.ts
import { Server, Socket, Namespace } from 'socket.io';
import { Logger } from '@utils/logger';
import { TelemetryService } from '@services/TelemetryService';
import { RateLimiter } from '@utils/rateLimiter';

const logger = Logger.getLogger('TelemetryNamespace');
const telemetryService = new TelemetryService();
const rateLimiter = new RateLimiter();

interface SubscriptionOptions {
  vehicleId: string;
  updateInterval?: number; // ms between batches
}

interface ClientSubscription {
  vehicleId: string;
  userId: string;
  socketId: string;
  updateInterval: number;
  lastUpdate: number;
}

export class TelemetryNamespace {
  private namespace: Namespace;
  private subscriptions = new Map<string, ClientSubscription[]>();
  private updateBuffer = new Map<string, any[]>();
  private flushIntervals = new Map<string, NodeJS.Timeout>();

  constructor(io: Server) {
    this.namespace = io.of('/telemetry');
    this.setupHandlers();
  }

  private setupHandlers() {
    this.namespace.on('connection', (socket: Socket) => {
      logger.debug(`Client connected to /telemetry: ${socket.id}`);
      const userId = socket.data.user?.id;

      // Subscribe to vehicle telemetry stream
      socket.on('subscribe', (options: SubscriptionOptions, callback) => {
        this.handleSubscribe(socket, userId, options, callback);
      });

      // Unsubscribe from vehicle
      socket.on('unsubscribe', (vehicleId: string, callback) => {
        this.handleUnsubscribe(socket, vehicleId, callback);
      });

      // Client requests latest data (on-demand)
      socket.on('get:latest', (vehicleId: string, callback) => {
        this.handleGetLatest(vehicleId, callback);
      });

      // Cleanup on disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket.id, userId);
      });
    });
  }

  private async handleSubscribe(
    socket: Socket,
    userId: string,
    options: SubscriptionOptions,
    callback: Function,
  ) {
    const { vehicleId, updateInterval = 500 } = options;

    try {
      // Validate user owns this vehicle
      const owns = await telemetryService.userOwnsVehicle(userId, vehicleId);
      if (!owns) {
        return callback({
          success: false,
          error: 'Access denied',
        });
      }

      // Rate limit subscriptions (max 50 subscriptions per client)
      const clientSubs = this.subscriptions.get(userId) || [];
      if (clientSubs.length >= 50) {
        return callback({
          success: false,
          error: 'Too many subscriptions',
        });
      }

      // Record subscription
      const subscription: ClientSubscription = {
        vehicleId,
        userId,
        socketId: socket.id,
        updateInterval,
        lastUpdate: Date.now(),
      };
      clientSubs.push(subscription);
      this.subscriptions.set(userId, clientSubs);

      // Join socket to vehicle room
      socket.join(`vehicle:${vehicleId}`);

      // Send initial data
      const latest = await telemetryService.getLatest(vehicleId);
      callback({
        success: true,
        data: latest,
      });

      logger.debug(`Subscribed ${socket.id} to vehicle ${vehicleId}`);

      // Start flushing updates on interval
      this.startUpdateBuffer(vehicleId, updateInterval);
    } catch (error) {
      logger.error('Error subscribing to telemetry:', error);
      callback({
        success: false,
        error: 'Subscription failed',
      });
    }
  }

  private handleUnsubscribe(socket: Socket, vehicleId: string, callback: Function) {
    socket.leave(`vehicle:${vehicleId}`);
    callback({ success: true });
  }

  private async handleGetLatest(vehicleId: string, callback: Function) {
    try {
      const data = await telemetryService.getLatest(vehicleId);
      callback({ success: true, data });
    } catch (error) {
      logger.error('Error fetching latest telemetry:', error);
      callback({
        success: false,
        error: 'Failed to fetch data',
      });
    }
  }

  private handleDisconnect(socketId: string, userId: string) {
    // Remove all subscriptions for this socket
    const subs = this.subscriptions.get(userId) || [];
    const remaining = subs.filter(s => s.socketId !== socketId);
    if (remaining.length > 0) {
      this.subscriptions.set(userId, remaining);
    } else {
      this.subscriptions.delete(userId);
    }

    logger.debug(`Cleaned up subscriptions for disconnected socket: ${socketId}`);
  }

  private startUpdateBuffer(vehicleId: string, updateInterval: number) {
    // Prevent duplicate intervals
    if (this.flushIntervals.has(vehicleId)) return;

    // Batch updates and flush on interval
    const interval = setInterval(() => {
      const buffer = this.updateBuffer.get(vehicleId) || [];
      if (buffer.length > 0) {
        this.namespace.to(`vehicle:${vehicleId}`).emit('telemetry:update', {
          vehicleId,
          updates: buffer,
          batchSize: buffer.length,
          timestamp: new Date().toISOString(),
        });
        this.updateBuffer.delete(vehicleId);
      }
    }, updateInterval);

    this.flushIntervals.set(vehicleId, interval);
  }

  // Called by backend service when new telemetry arrives
  public async broadcastUpdate(vehicleId: string, telemetryData: any) {
    // Buffer update
    const buffer = this.updateBuffer.get(vehicleId) || [];
    buffer.push(telemetryData);
    this.updateBuffer.set(vehicleId, buffer);

    // If buffer is too large, flush immediately
    if (buffer.length >= 100) {
      this.namespace.to(`vehicle:${vehicleId}`).emit('telemetry:update', {
        vehicleId,
        updates: buffer,
        batchSize: buffer.length,
        timestamp: new Date().toISOString(),
      });
      this.updateBuffer.delete(vehicleId);
    }
  }
}
```

### 3. Client-Side Hook (React)
```typescript
// hooks/useRealtimeTelemetry.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { TelemetryData } from '@types/telemetry';
import { io, Socket } from 'socket.io-client';

interface UseRealtimeTelemetryOptions {
  vehicleId: string;
  updateInterval?: number;
  onError?: (error: string) => void;
}

export const useRealtimeTelemetry = ({
  vehicleId,
  updateInterval = 500,
  onError,
}: UseRealtimeTelemetryOptions) => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Prevent reconnecting if already connected
    if (socketRef.current?.connected) return;

    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setError(null);
      logger.debug('Connected to telemetry server');

      // Subscribe to vehicle on connect
      socketRef.current?.emit(
        'subscribe',
        { vehicleId, updateInterval },
        (response: any) => {
          if (response.success) {
            setTelemetry(response.data);
          } else {
            handleError(response.error);
          }
        },
      );
    });

    socketRef.current.on('telemetry:update', (batch: any) => {
      if (batch.updates && batch.updates.length > 0) {
        // Take the latest update from batch
        const latest = batch.updates[batch.updates.length - 1];
        setTelemetry(latest);
      }
    });

    socketRef.current.on('connect_error', (err: any) => {
      handleError(`Connection error: ${err.message}`);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('unsubscribe', vehicleId);
        socketRef.current.disconnect();
      }
    };
  }, [vehicleId, updateInterval]);

  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    onError?.(errorMsg);
  }, [onError]);

  const getLatest = useCallback(() => {
    return new Promise<TelemetryData>((resolve, reject) => {
      socketRef.current?.emit('get:latest', vehicleId, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [vehicleId]);

  return {
    telemetry,
    isConnected,
    error,
    getLatest,
  };
};
```

### 4. Alert Namespace Example
```typescript
// services/namespaces/alertNamespace.ts
import { Server, Namespace } from 'socket.io';
import { Logger } from '@utils/logger';

const logger = Logger.getLogger('AlertNamespace');

export class AlertNamespace {
  private namespace: Namespace;

  constructor(io: Server) {
    this.namespace = io.of('/alerts');
    this.setupHandlers();
  }

  private setupHandlers() {
    this.namespace.on('connection', (socket) => {
      const userId = socket.data.user?.id;
      logger.debug(`Client connected to /alerts: ${socket.id}`);

      // Join user-specific alert room
      socket.join(`user:${userId}`);

      socket.on('disconnect', () => {
        logger.debug(`Client disconnected from /alerts: ${socket.id}`);
      });
    });
  }

  // Called by backend when alert is triggered
  public broadcastAlert(userId: string, alert: any) {
    this.namespace.to(`user:${userId}`).emit('alert:triggered', {
      ...alert,
      receivedAt: new Date().toISOString(),
    });
  }
}
```

## Performance Optimization

1. **Message Batching**: Buffer 100ms of updates, send in one message.
2. **Compression**: Enable gzip compression for payloads >1KB.
3. **Connection Recovery**: Store last known state during brief disconnects.
4. **Fallback Transport**: Use HTTP long-polling if WebSocket unavailable.
5. **Backpressure**: Limit client subscriptions to prevent memory bloat.

## Scalability Considerations

For multi-server deployments:
- Use Redis adapter for cross-server broadcasting
- Implement sticky sessions for connection affinity
- Load balance WebSocket connections

## Monitoring

- Track active connections per namespace
- Monitor message throughput (msg/sec)
- Alert on connection churn
- Log subscription/unsubscription events
