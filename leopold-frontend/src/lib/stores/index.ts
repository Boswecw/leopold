// src/lib/stores/index.ts - Leopold Core Stores

import { writable, derived, readable } from 'svelte/store';
import { browser } from '$app/environment';
import type { 
  User, 
  Observation, 
  ObservationFilters, 
  AudioRecording, 
  AudioState,
  AppState,
  MapBounds,
  LoadingState,
  NotificationType
} from '$lib/types';

/**
 * Authentication Store
 */
function createAuthStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    login: (user: User) => {
      set(user);
      if (browser) {
        localStorage.setItem('leopold_user', JSON.stringify(user));
      }
    },
    logout: () => {
      set(null);
      if (browser) {
        localStorage.removeItem('leopold_user');
      }
    },
    update: (userData: Partial<User>) => {
      update(user => user ? { ...user, ...userData } : null);
    },
    initialize: () => {
      if (browser) {
        const stored = localStorage.getItem('leopold_user');
        if (stored) {
          try {
            set(JSON.parse(stored));
          } catch {
            localStorage.removeItem('leopold_user');
          }
        }
      }
    }
  };
}

export const authStore = createAuthStore();

/**
 * Observations Store with Audio Support
 */
function createObservationsStore() {
  const { subscribe, set, update } = writable<Observation[]>([]);

  return {
    subscribe,
    set,
    add: (observation: Observation) => {
      update(observations => [observation, ...observations]);
    },
    update: (id: string, updates: Partial<Observation>) => {
      update(observations => 
        observations.map(obs => 
          obs.id === id ? { ...obs, ...updates } : obs
        )
      );
    },
    remove: (id: string) => {
      update(observations => observations.filter(obs => obs.id !== id));
    },
    clear: () => set([]),
    // Audio-specific methods
    addAudioObservation: (observation: Observation, audioRecording: AudioRecording) => {
      const enhancedObservation = {
        ...observation,
        audio_urls: [audioRecording.url],
        recording_duration: audioRecording.duration,
        observation_type: 'audio' as const
      };
      update(observations => [enhancedObservation, ...observations]);
    },
    // Multi-modal observation
    addMultiModalObservation: (observation: Observation, audioRecording: AudioRecording, imageUrls: string[]) => {
      const enhancedObservation = {
        ...observation,
        audio_urls: [audioRecording.url],
        image_urls: imageUrls,
        recording_duration: audioRecording.duration,
        observation_type: 'multi-modal' as const
      };
      update(observations => [enhancedObservation, ...observations]);
    }
  };
}

export const observationsStore = createObservationsStore();

/**
 * Audio Recording Store
 */
function createAudioStore() {
  const initialState: AudioState = {
    is_recording: false,
    recording_time: 0,
    audio_level: 0,
    current_recording: null,
    supported_formats: [],
    permissions_granted: false
  };

  const { subscribe, set, update } = writable<AudioState>(initialState);

  let mediaRecorder: MediaRecorder | null = null;
  let audioStream: MediaStream | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let recordingTimer: number | null = null;

  return {
    subscribe,
    
    // Initialize audio system
    initialize: async () => {
      if (!browser) return false;

      try {
        // Check for audio support
        const formats = [];
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          formats.push('audio/webm;codecs=opus');
        }
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          formats.push('audio/mp4');
        }
        if (MediaRecorder.isTypeSupported('audio/wav')) {
          formats.push('audio/wav');
        }

        update(state => ({ 
          ...state, 
          supported_formats: formats 
        }));

        return formats.length > 0;
      } catch (error) {
        console.error('Audio initialization failed:', error);
        return false;
      }
    },

    // Request microphone permissions
    requestPermissions: async () => {
      if (!browser) return false;

      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });

        // Set up audio context for level monitoring
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(audioStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.3;
        source.connect(analyser);

        update(state => ({ ...state, permissions_granted: true }));
        return true;
      } catch (error) {
        console.error('Microphone permission denied:', error);
        update(state => ({ ...state, permissions_granted: false }));
        return false;
      }
    },

    // Start recording
    startRecording: async (maxDuration = 60) => {
      if (!audioStream) {
        const hasPermission = await createAudioStore().requestPermissions();
        if (!hasPermission) return false;
      }

      try {
        const audioChunks: Blob[] = [];
        const mimeType = 'audio/webm;codecs=opus';
        
        mediaRecorder = new MediaRecorder(audioStream!, { mimeType });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: mimeType });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          const recording: AudioRecording = {
            blob: audioBlob,
            url: audioUrl,
            duration: 0, // Will be calculated
            waveform_data: [],
            spectrogram_data: [],
            file_format: mimeType,
            sample_rate: 44100,
            channels: 1
          };

          update(state => ({ 
            ...state, 
            current_recording: recording,
            is_recording: false,
            recording_time: 0
          }));
        };

        mediaRecorder.start();
        
        // Start timer and level monitoring
        let startTime = Date.now();
        recordingTimer = window.setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          
          // Update audio level
          if (analyser) {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const level = average / 255;
            
            update(state => ({ 
              ...state, 
              recording_time: elapsed,
              audio_level: level
            }));
          } else {
            update(state => ({ ...state, recording_time: elapsed }));
          }

          // Auto-stop at max duration
          if (elapsed >= maxDuration) {
            createAudioStore().stopRecording();
          }
        }, 100);

        update(state => ({ ...state, is_recording: true }));
        return true;
      } catch (error) {
        console.error('Recording start failed:', error);
        return false;
      }
    },

    // Stop recording
    stopRecording: () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }

      update(state => ({ 
        ...state, 
        is_recording: false,
        audio_level: 0
      }));
    },

    // Clear current recording
    clearRecording: () => {
      update(state => {
        if (state.current_recording?.url) {
          URL.revokeObjectURL(state.current_recording.url);
        }
        return { ...state, current_recording: null };
      });
    },

    // Cleanup resources
    cleanup: () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
      }
      
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
      
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }

      set(initialState);
    }
  };
}

export const audioStore = createAudioStore();

/**
 * Filters Store
 */
function createFiltersStore() {
  const initialFilters: ObservationFilters = {
    species: [],
    observation_types: [],
    date_range: null,
    location_bounds: null,
    confidence_min: 0,
    audio_features: {
      min_frequency: 0,
      max_frequency: 20000,
      call_types: [],
      audio_quality: []
    },
    verified_only: false
  };

  const { subscribe, set, update } = writable<ObservationFilters>(initialFilters);

  return {
    subscribe,
    set,
    reset: () => set(initialFilters),
    updateSpecies: (species: string[]) => {
      update(filters => ({ ...filters, species }));
    },
    updateObservationTypes: (observation_types: string[]) => {
      update(filters => ({ 
        ...filters, 
        observation_types: observation_types as any[]
      }));
    },
    updateDateRange: (start: string, end: string) => {
      update(filters => ({ 
        ...filters, 
        date_range: { start, end }
      }));
    },
    updateAudioFilters: (audioFilters: Partial<NonNullable<ObservationFilters['audio_features']>>) => {
      update(filters => ({
        ...filters,
        audio_features: { ...filters.audio_features!, ...audioFilters }
      }));
    },
    updateBounds: (bounds: MapBounds) => {
      update(filters => ({ ...filters, location_bounds: bounds }));
    }
  };
}

export const filtersStore = createFiltersStore();

/**
 * UI State Store
 */
interface UIState {
  loading: LoadingState;
  error: string | null;
  notification: { type: NotificationType; message: string } | null;
  sidebar_open: boolean;
  view_mode: 'map' | 'list' | 'grid';
  selected_observation: Observation | null;
  modal_open: boolean;
  modal_content: string | null;
}

function createUIStore() {
  const initialState: UIState = {
    loading: 'idle',
    error: null,
    notification: null,
    sidebar_open: false,
    view_mode: 'map',
    selected_observation: null,
    modal_open: false,
    modal_content: null
  };

  const { subscribe, set, update } = writable<UIState>(initialState);

  return {
    subscribe,
    
    // Loading states
    setLoading: (loading: LoadingState) => {
      update(state => ({ ...state, loading }));
    },
    
    // Error handling
    setError: (error: string | null) => {
      update(state => ({ ...state, error }));
    },
    
    // Notifications
    showNotification: (type: NotificationType, message: string) => {
      update(state => ({ ...state, notification: { type, message } }));
      // Auto-clear after 5 seconds
      setTimeout(() => {
        update(state => ({ ...state, notification: null }));
      }, 5000);
    },
    
    clearNotification: () => {
      update(state => ({ ...state, notification: null }));
    },
    
    // UI state
    toggleSidebar: () => {
      update(state => ({ ...state, sidebar_open: !state.sidebar_open }));
    },
    
    setViewMode: (view_mode: 'map' | 'list' | 'grid') => {
      update(state => ({ ...state, view_mode }));
    },
    
    selectObservation: (observation: Observation | null) => {
      update(state => ({ ...state, selected_observation: observation }));
    },
    
    // Modal management
    openModal: (content: string) => {
      update(state => ({ ...state, modal_open: true, modal_content: content }));
    },
    
    closeModal: () => {
      update(state => ({ ...state, modal_open: false, modal_content: null }));
    }
  };
}

export const uiStore = createUIStore();

/**
 * Derived Stores
 */

// Filtered observations based on current filters
export const filteredObservations = derived(
  [observationsStore, filtersStore],
  ([observations, filters]) => {
    return observations.filter(obs => {
      // Species filter
      if (filters.species.length > 0 && !filters.species.includes(obs.species_name)) {
        return false;
      }
      
      // Observation type filter
      if (filters.observation_types.length > 0 && !filters.observation_types.includes(obs.observation_type)) {
        return false;
      }
      
      // Date range filter
      if (filters.date_range) {
        const obsDate = new Date(obs.observed_at);
        const startDate = new Date(filters.date_range.start);
        const endDate = new Date(filters.date_range.end);
        if (obsDate < startDate || obsDate > endDate) {
          return false;
        }
      }
      
      // Confidence filter
      if (obs.confidence_level < filters.confidence_min) {
        return false;
      }
      
      // Audio frequency filter
      if (filters.audio_features && obs.audio_features) {
        const freq = obs.audio_features.dominant_frequency;
        if (freq < filters.audio_features.min_frequency || 
            freq > filters.audio_features.max_frequency) {
          return false;
        }
      }
      
      // Verified only filter
      if (filters.verified_only && !obs.expert_verified) {
        return false;
      }
      
      return true;
    });
  }
);

// Audio observations only
export const audioObservations = derived(
  observationsStore,
  $observations => $observations.filter(obs => 
    obs.observation_type === 'audio' || obs.observation_type === 'multi-modal'
  )
);

// User statistics
export const userStats = derived(
  [observationsStore, authStore],
  ([observations, user]) => {
    if (!user) return null;
    
    const userObservations = observations.filter(obs => obs.user_id === user.id);
    
    return {
      total_observations: userObservations.length,
      audio_recordings: userObservations.filter(obs => 
        obs.observation_type === 'audio' || obs.observation_type === 'multi-modal'
      ).length,
      visual_observations: userObservations.filter(obs => 
        obs.observation_type === 'visual'
      ).length,
      species_identified: new Set(userObservations.map(obs => obs.species_name)).size,
      average_confidence: userObservations.reduce((sum, obs) => 
        sum + obs.confidence_level, 0) / userObservations.length || 0
    };
  }
);

// Initialize stores on app start
if (browser) {
  authStore.initialize();
  audioStore.initialize();
}