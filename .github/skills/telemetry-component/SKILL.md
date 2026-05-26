---
name: telemetry-component
description: |
  Use when: Creating production-grade React components for telemetry visualization, data panels, gauges, charts, or real-time displays. Generates fully-typed components with hooks, memoization, error boundaries, and WebSocket integration. Handles loading states, error states, and graceful degradation.
authors: [Dhiraj]
---

# Telemetry Component Generator

## Use Cases
- Building a speed gauge component
- Creating a battery status monitor
- Displaying live GPS coordinates
- Building trend charts for battery/speed
- Creating vehicle status cards
- Building alert notification panels

## Workflow

### 1. Define Component Requirements
Clarify these details before implementing:
- **Component Type**: Gauge, Chart, Status Card, Alert Panel, Live Feed
- **Data Source**: WebSocket stream, REST polling, or static props
- **Refresh Rate**: How frequently does the data update? (100ms, 500ms, 1s, etc.)
- **Interactive**: Does it respond to user interaction (filters, toggles)?
- **Responsive**: Mobile-first, tablet, desktop?

### 2. Component Template
```typescript
// components/telemetry/[ComponentName].tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TelemetryData } from '@types/telemetry';
import { useOptimizedTelemetry } from '@hooks/useOptimizedTelemetry';

interface [ComponentName]Props {
  vehicleId: string;
  realtime?: boolean;
  updateInterval?: number; // ms
  onError?: (error: Error) => void;
}

interface ComponentState {
  data: TelemetryData | null;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
}

export const [ComponentName]: React.FC<[ComponentName]Props> = ({
  vehicleId,
  realtime = true,
  updateInterval = 500,
  onError,
}) => {
  const [state, setState] = useState<ComponentState>({
    data: null,
    isLoading: true,
    error: null,
    isConnected: false,
  });

  // Use custom hook for optimized data fetching
  const { subscribe, unsubscribe } = useOptimizedTelemetry(vehicleId);

  useEffect(() => {
    if (!realtime) return;

    const handleUpdate = (data: TelemetryData) => {
      setState(prev => ({
        ...prev,
        data,
        isLoading: false,
        isConnected: true,
        error: null,
      }));
    };

    const handleError = (error: Error) => {
      setState(prev => ({ ...prev, error, isConnected: false }));
      onError?.(error);
    };

    const unsubscribeFn = subscribe(handleUpdate, handleError, updateInterval);

    return () => {
      unsubscribeFn();
    };
  }, [vehicleId, realtime, updateInterval, subscribe, onError]);

  const handleRetry = useCallback(() => {
    setState(prev => ({ ...prev, error: null, isLoading: true }));
  }, []);

  // Memoize computed values
  const displayValue = useMemo(() => {
    if (!state.data) return null;
    // Transform/compute display value
    return state.data;
  }, [state.data]);

  if (!state.data && state.isLoading) {
    return <div className="telemetry-loading">Loading...</div>;
  }

  if (state.error) {
    return (
      <div className="telemetry-error" role="alert">
        <p>Error loading telemetry: {state.error.message}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  if (state.data) {
    return (
      <div className="telemetry-component" data-testid="telemetry-component">
        {/* Component implementation */}
        {displayValue}
      </div>
    );
  }

  return <div className="telemetry-empty">No data available</div>;
};

export default React.memo([ComponentName]);
```

### 3. Hook Pattern for Data Fetching
```typescript
// hooks/useOptimizedTelemetry.ts
import { useCallback, useEffect, useRef } from 'react';
import { TelemetryData } from '@types/telemetry';

export const useOptimizedTelemetry = (vehicleId: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const subscribe = useCallback(
    (
      onUpdate: (data: TelemetryData) => void,
      onError: (error: Error) => void,
      debounceMs: number = 500,
    ) => {
      // Connect to WebSocket
      socketRef.current = new WebSocket(`wss://api/telemetry/${vehicleId}`);

      socketRef.current.onmessage = (event) => {
        const data: TelemetryData = JSON.parse(event.data);

        // Debounce updates to prevent excessive re-renders
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onUpdate(data);
        }, debounceMs);
      };

      socketRef.current.onerror = () => {
        onError(new Error('WebSocket connection failed'));
      };

      // Return unsubscribe function
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    },
    [vehicleId],
  );

  return { subscribe };
};
```

### 4. Testing Template
```typescript
// components/telemetry/__tests__/[ComponentName].test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { [ComponentName] } from '../[ComponentName]';

describe('[ComponentName]', () => {
  it('renders loading state initially', () => {
    render(<[ComponentName] vehicleId="test-vehicle" realtime={false} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays telemetry data when loaded', async () => {
    render(<[ComponentName] vehicleId="test-vehicle" realtime={false} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('telemetry-component')).toBeInTheDocument();
    });
  });

  it('handles errors gracefully', async () => {
    render(<[ComponentName] vehicleId="invalid" realtime={true} />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('retries on error button click', async () => {
    render(<[ComponentName] vehicleId="test-vehicle" realtime={false} />);
    
    const retryButton = screen.getByText(/retry/i);
    retryButton.click();
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

## Performance Considerations

1. **Debouncing**: Telemetry updates can be 10-100+ Hz; debounce to 500ms for UI.
2. **Memoization**: Use `React.memo()` to prevent re-renders unless props change.
3. **useCallback**: Memoize callbacks passed to WebSocket handlers.
4. **Error Boundaries**: Wrap in error boundary for dashboard resilience.
5. **Cleanup**: Always unsubscribe/close connections in useEffect cleanup.

## Styling Guidelines

- Use CSS modules or styled-components for encapsulation.
- Ensure components are responsive (mobile-first).
- Include dark mode support if applicable.
- Use accessibility attributes (role, aria-label, etc.).

## Type Safety

All components must use strict TypeScript:
- Define Props interface with all required/optional fields.
- Type state explicitly (ComponentState interface).
- Return type annotations on component functions.
- No `any` types — use `unknown` if necessary and type-guard it.

## Monitoring & Observability

Components should emit:
- Performance metrics: Render time, update frequency
- Error events: Log to monitoring service
- Connection status: WebSocket connect/disconnect events

## Example Use

```
generate a battery level gauge component that:
- displays current battery percentage as a circular gauge
- shows red when <20%, yellow when <50%, green when >50%
- updates every 500ms via WebSocket
- handles connection loss with fallback to last-known value
- is fully responsive and accessible
```
