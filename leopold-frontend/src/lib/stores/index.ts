import { writable, type Writable } from 'svelte/store';
import type { User, Observation, ObservationFilters as ObservationFiltersType } from '$lib/types';

// Auth Store
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false
};

export const authStore = writable<AuthState>(initialAuthState);

// Observations Store
export const observationsStore = writable<Observation[]>([]);

// Filters Store - renamed to avoid conflict
export const filtersStore = writable<ObservationFiltersType>({
  species: undefined,
  location: undefined,
  dateRange: undefined,
  observationType: undefined,
  user: undefined,
  tags: undefined,
  verified: undefined
});

// UI Store
export interface UIState {
  activeModal: string | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    created_at: string;
  }>;
  loading: boolean;
  error?: string;
  theme: 'light' | 'dark';
}

const initialUIState: UIState = {
  activeModal: null,
  notifications: [],
  loading: false,
  theme: 'light'
};

function createUIStore() {
  const { subscribe, set, update } = writable<UIState>(initialUIState);

  return {
    subscribe,
    set,
    update,
    setLoading: (loading: boolean) => update(state => ({ ...state, loading })),
    setError: (error?: string) => update(state => ({ ...state, error })),
    clearError: () => update(state => ({ ...state, error: undefined })),
    showNotification: (type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 5000) => {
      const notification = {
        id: crypto.randomUUID(),
        type,
        message,
        duration,
        created_at: new Date().toISOString()
      };
      update(state => ({
        ...state,
        notifications: [...state.notifications, notification]
      }));
      
      if (duration > 0) {
        setTimeout(() => {
          update(state => ({
            ...state,
            notifications: state.notifications.filter(n => n.id !== notification.id)
          }));
        }, duration);
      }
    }
  };
}

export const uiStore = createUIStore();

// Audio Store
export interface AudioState {
  isRecording: boolean;
  isPlaying: boolean;
  hasPermission: boolean;
  currentRecording: AudioRecording | null;
  error: string | null;
}

interface AudioRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  created_at: string;
  spectrogram_data?: any;
}

const initialAudioState: AudioState = {
  isRecording: false,
  isPlaying: false,
  hasPermission: false,
  currentRecording: null,
  error: null
};

function createAudioStore() {
  const { subscribe, set, update } = writable<AudioState>(initialAudioState);

  return {
    subscribe,
    set,
    update,
    initialize: () => {
      // Initialize audio context if needed
      console.log('Audio store initialized');
    },
    requestPermissions: async (): Promise<boolean> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        update(state => ({ ...state, hasPermission: true, error: null }));
        return true;
      } catch (error) {
        update(state => ({ ...state, hasPermission: false, error: 'Permission denied' }));
        return false;
      }
    },
    startRecording: async (maxDuration?: number): Promise<void> => {
      update(state => ({ ...state, isRecording: true, error: null }));
      // Recording logic would go here
      console.log('Recording started', maxDuration);
    },
    stopRecording: (): void => {
      update(state => ({ ...state, isRecording: false }));
      // Stop recording logic would go here
    },
    clearRecording: (): void => {
      update(state => ({ ...state, currentRecording: null }));
    },
    cleanup: (): void => {
      update(state => ({ ...state, isRecording: false, isPlaying: false }));
    }
  };
}

export const audioStore = createAudioStore();