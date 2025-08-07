// place files you want to import through the `$lib` alias in this folder.
// src/lib/stores/index.ts - Fixed stores with missing methods
import { writable, derived, type Writable } from 'svelte/store';
import type { 
  Observation, 
  ObservationFilters, 
  User, 
  AudioState, 
  NotificationType,
  LoadingState 
} from '$lib/types';

/**
 * Observations Store with missing methods
 */
interface ObservationStore extends Writable<Observation[]> {
  add: (observation: Observation) => void;
  remove: (id: string) => void;
  update: (id: string, updates: Partial<Observation>) => void;
}

function createObservationsStore(): ObservationStore {
  const { subscribe, set, update } = writable<Observation[]>([]);

  return {
    subscribe,
    set,
    update,
    add: (observation: Observation) => 
      update(observations => [...observations, observation]),
    remove: (id: string) => 
      update(observations => observations.filter(obs => obs.id !== id)),
    update: (id: string, updates: Partial<Observation>) => 
      update(observations => 
        observations.map(obs => obs.id === id ? { ...obs, ...updates } : obs)
      )
  };
}

export const observationsStore = createObservationsStore();

/**
 * UI Store
 */
interface UIState {
  loading: LoadingState;
  notification: {
    type: NotificationType;
    message: string;
  } | null;
  modal: {
    isOpen: boolean;
    component: string | null;
    props: Record<string, any>;
  };
}

interface UIStore extends Writable<UIState> {
  setLoading: (state: LoadingState) => void;
  showNotification: (type: NotificationType, message: string) => void;
  clearNotification: () => void;
  openModal: (component: string, props?: Record<string, any>) => void;
  closeModal: () => void;
}

function createUIStore(): UIStore {
  const initialState: UIState = {
    loading: 'idle',
    notification: null,
    modal: {
      isOpen: false,
      component: null,
      props: {}
    }
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    set,
    update,
    setLoading: (state: LoadingState) => 
      update(ui => ({ ...ui, loading: state })),
    showNotification: (type: NotificationType, message: string) => 
      update(ui => ({ 
        ...ui, 
        notification: { type, message } 
      })),
    clearNotification: () => 
      update(ui => ({ ...ui, notification: null })),
    openModal: (component: string, props = {}) => 
      update(ui => ({
        ...ui,
        modal: { isOpen: true, component, props }
      })),
    closeModal: () => 
      update(ui => ({
        ...ui,
        modal: { isOpen: false, component: null, props: {} }
      }))
  };
}

export const uiStore = createUIStore();

/**
 * Auth Store
 */
interface AuthStore extends Writable<User | null> {
  login: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

function createAuthStore(): AuthStore {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    set,
    update,
    login: (user: User) => set(user),
    logout: () => set(null),
    initialize: () => {
      // Initialize auth state from localStorage or API
      // For now, just a placeholder
      console.log('Initializing auth store...');
    }
  };
}

export const authStore = createAuthStore();

/**
 * Audio Store
 */
interface AudioStore extends Writable<AudioState> {
  initialize: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setLevel: (level: number) => void;
}

function createAudioStore(): AudioStore {
  const initialState: AudioState = {
    is_recording: false,
    recording_time: 0,
    audio_level: 0,
    current_recording: null,
    supported_formats: [],
    permissions_granted: false
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    set,
    update,
    initialize: () => {
      // Initialize audio capabilities
      console.log('Initializing audio store...');
    },
    startRecording: () => 
      update(state => ({ ...state, is_recording: true })),
    stopRecording: () => 
      update(state => ({ ...state, is_recording: false })),
    setLevel: (level: number) => 
      update(state => ({ ...state, audio_level: level }))
  };
}

export const audioStore = createAudioStore();

/**
 * Filters Store
 */
export const filtersStore = writable<ObservationFilters>({});

/**
 * Derived stores
 */
export const filteredObservations = derived(
  [observationsStore, filtersStore],
  ([observations, filters]) => {
    // Apply filters to observations
    let filtered = observations;

    if (filters.species && filters.species.length > 0) {
      filtered = filtered.filter(obs => 
        filters.species!.includes(obs.species_name)
      );
    }

    if (filters.observation_types && filters.observation_types.length > 0) {
      filtered = filtered.filter(obs => 
        filters.observation_types!.includes(obs.observation_type)
      );
    }

    if (filters.verified_only) {
      filtered = filtered.filter(obs => obs.is_verified);
    }

    return filtered;
  }
);