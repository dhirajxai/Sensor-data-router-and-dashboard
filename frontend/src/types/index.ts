/**
 * Frontend-local types (not shared with backend)
 */

export interface FilterState {
  search: string;
  status?: 'active' | 'inactive' | 'offline';
  batteryMin?: number;
  speedMax?: number;
}

export interface UIState {
  selectedVehicleId?: string;
  activeTab: 'map' | 'list' | 'analytics';
  timeRange: '1h' | '6h' | '24h' | '7d';
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
}
