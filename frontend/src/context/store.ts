import { create } from 'zustand';
import type { Alert, VehicleData } from '@shared/index';
import type { FilterState, UIState } from '../types/index';

interface FleetDataState {
  vehicles: VehicleData[];
  alerts: Alert[];
  isLoading: boolean;
  error: Error | null;
  hasLoaded: boolean;
}

interface AppState {
  // Filters
  filters: FilterState;
  updateFilter: (filter: Partial<FilterState>) => void;
  resetFilters: () => void;

  // UI State
  ui: UIState;
  selectVehicle: (vehicleId: string | undefined) => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  setTimeRange: (range: UIState['timeRange']) => void;

  // Fleet data
  fleet: FleetDataState;
  setFleetData: (payload: Partial<FleetDataState>) => void;
  resetFleetData: () => void;
}

const initialFilters: FilterState = {
  search: '',
};

const initialUI: UIState = {
  selectedVehicleId: undefined,
  activeTab: 'map',
  timeRange: '24h',
};

const initialFleetData: FleetDataState = {
  vehicles: [],
  alerts: [],
  isLoading: true,
  error: null,
  hasLoaded: false,
};

export const useAppStore = create<AppState>((set) => ({
  filters: initialFilters,
  updateFilter: (filter) =>
    set((state) => ({
      filters: { ...state.filters, ...filter },
    })),
  resetFilters: () => set({ filters: initialFilters }),

  ui: initialUI,
  selectVehicle: (vehicleId) =>
    set((state) => ({
      ui: { ...state.ui, selectedVehicleId: vehicleId },
    })),
  setActiveTab: (tab) =>
    set((state) => ({
      ui: { ...state.ui, activeTab: tab },
    })),
  setTimeRange: (range) =>
    set((state) => ({
      ui: { ...state.ui, timeRange: range },
    })),

  fleet: initialFleetData,
  setFleetData: (payload) =>
    set((state) => ({
      fleet: { ...state.fleet, ...payload },
    })),
  resetFleetData: () => set({ fleet: initialFleetData }),
}));
