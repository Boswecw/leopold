// src/lib/index.ts - Fixed store implementations
import { writable, type Writable } from 'svelte/store';
import type { 
  Observation, 
  AudioState, 
  FiltersState,
  ObservationType
} from './types';

// FIXED: Don't extend Writable directly - compose it instead
interface ObservationStore {
  subscribe: Writable<Observation[]>['subscribe'];
  set: Writable<Observation[]>['set'];
  update: Writable<Observation[]>['update'];
  // Custom methods with different names to avoid conflicts
  add: (observation: Observation) => void;
  remove: (id: string) => void;
  updateObservation: (id: string, updates: Partial<Observation>) => void;
  getById: (id: string) => Observation | undefined;
  getBySpecies: (species: string) => Observation[];
  getRecent: (limit?: number) => Observation[];
  clear: () => void;
}

// Create the observations store
function createObservationsStore(): ObservationStore {
  const { subscribe, set, update } = writable<Observation[]>([]);
  
  let currentObservations: Observation[] = [];
  
  // Keep track of current state
  subscribe(obs => currentObservations = obs);

  return {
    subscribe,
    set,
    update,
    
    add: (observation: Observation) =>
      update(observations => [...observations, observation]),
    
    remove: (id: string) =>
      update(observations => observations.filter(obs => obs.id !== id)),
    
    updateObservation: (id: string, updates: Partial<Observation>) =>
      update(observations =>
        observations.map(obs =>
          obs.id === id ? { ...obs, ...updates } : obs
        )
      ),
    
    getById: (id: string) => 
      currentObservations.find(obs => obs.id === id),
    
    getBySpecies: (species: string) =>
      currentObservations.filter(obs => 
        obs.species_name?.toLowerCase().includes(species.toLowerCase())
      ),
    
    getRecent: (limit = 10) =>
      [...currentObservations]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit),
    
    clear: () => set([])
  };
}

// FIXED: Audio store with corrected initial state
function createAudioStore() {
  const initialState: AudioState = {
    isRecording: false,
    isPlaying: false,
    hasPermission: false,
    currentRecording: null,
    recordingTime: 0,
    audioLevel: 0,
    supportedFormats: [],
    error: null
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    set,
    update,
    
    startRecording: async () => {
      update(state => ({ ...state, isRecording: true, error: null }));
    },
    
    stopRecording: async () => {
      update(state => ({ ...state, isRecording: false }));
      return null;
    },
    
    playRecording: async (recording: any) => {
      update(state => ({ ...state, isPlaying: true, currentRecording: recording }));
    },
    
    stopPlayback: () => {
      update(state => ({ ...state, isPlaying: false }));
    },
    
    requestPermissions: async () => {
      update(state => ({ ...state, hasPermission: true }));
      return true;
    },
    
    setAudioLevel: (level: number) => {
      update(state => ({ ...state, audioLevel: level }));
    },
    
    clearError: () => {
      update(state => ({ ...state, error: null }));
    }
  };
}

// COMPLETELY FIXED: Filters store that handles exactOptionalPropertyTypes properly
function createFiltersStore() {
  const initialState: FiltersState = {
    species: [],
    // Don't set undefined - just omit the properties entirely
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc'
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    set,
    update,
    
    setLocation: (location: { center: { latitude: number; longitude: number }; radius_km: number } | undefined) =>
      update(filters => {
        if (location === undefined) {
          const { location: _, ...rest } = filters;
          return rest;
        }
        return { ...filters, location };
      }),
    
    setLocationFromPoint: (center: { latitude: number; longitude: number }, radius_km: number) =>
      update(filters => ({ ...filters, location: { center, radius_km } })),
    
    setDateRange: (dateRange: { start: Date; end: Date } | undefined) =>
      update(filters => {
        if (dateRange === undefined) {
          const { dateRange: _, ...rest } = filters;
          return rest;
        }
        return { ...filters, dateRange };
      }),
    
    setObservationType: (observationType: ObservationType | 'all' | undefined) =>
      update(filters => {
        if (observationType === undefined) {
          const { observationType: _, ...rest } = filters;
          return rest;
        }
        return { ...filters, observationType };
      }),
    
    setUser: (user: string | undefined) =>
      update(filters => {
        if (user === undefined) {
          const { user: _, ...rest } = filters;
          return rest;
        }
        return { ...filters, user };
      }),
    
    setTags: (tags: string[]) =>
      update(filters => ({ ...filters, tags })),
    
    addTag: (tag: string) =>
      update(filters => ({ ...filters, tags: [...filters.tags, tag] })),
    
    removeTag: (tag: string) =>
      update(filters => ({ ...filters, tags: filters.tags.filter(t => t !== tag) })),
    
    setSpecies: (species: string[]) =>
      update(filters => ({ ...filters, species })),
    
    addSpecies: (species: string) =>
      update(filters => ({ ...filters, species: [...filters.species, species] })),
    
    removeSpecies: (species: string) =>
      update(filters => ({ ...filters, species: filters.species.filter(s => s !== species) })),
    
    setVerified: (verified: boolean | undefined) =>
      update(filters => {
        if (verified === undefined) {
          const { verified: _, ...rest } = filters;
          return rest;
        }
        return { ...filters, verified };
      }),
    
    setSorting: (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') =>
      update(filters => ({ ...filters, sortBy, sortOrder })),
    
    clearLocation: () =>
      update(filters => {
        const { location: _, ...rest } = filters;
        return rest;
      }),
    
    clearDateRange: () =>
      update(filters => {
        const { dateRange: _, ...rest } = filters;
        return rest;
      }),
    
    clearObservationType: () =>
      update(filters => {
        const { observationType: _, ...rest } = filters;
        return rest;
      }),
    
    clearUser: () =>
      update(filters => {
        const { user: _, ...rest } = filters;
        return rest;
      }),
    
    clearTags: () =>
      update(filters => ({ ...filters, tags: [] })),
    
    clearSpecies: () =>
      update(filters => ({ ...filters, species: [] })),
    
    clearVerified: () =>
      update(filters => {
        const { verified: _, ...rest } = filters;
        return rest;
      }),
    
    clearAll: () => set(initialState)
  };
}

// Export the stores
export const observationsStore = createObservationsStore();
export const audioStore = createAudioStore();
export const filtersStore = createFiltersStore();
