// src/lib/stores/index.ts - Properly typed stores implementation
import { writable, derived, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

import type {
  Observation,
  User,
  ObservationFilters,
  LoadingState,
  NotificationType,
  ObservationType,
  AudioRecording,
  Location
} from '$lib/types';

// ===== OBSERVATIONS STORE =====
interface ObservationStore extends Writable<Observation[]> {
  add: (observation: Observation) => void;
  remove: (id: string) => void;
  updateObservation: (id: string, updates: Partial<Observation>) => void;
  clear: () => void;
  addMany: (newObservations: Observation[]) => void;
  getByUserId: (userId: string) => Observation[];
  getByType: (observationType: ObservationType) => Observation[];
}

function createObservationsStore(): ObservationStore {
  const { subscribe, set, update } = writable<Observation[]>([]);

  return {
    subscribe,
    set,
    update,
    // Enhanced methods that were missing
    add: (observation: Observation) => 
      update((observations: Observation[]) => [...observations, observation]),
    remove: (id: string) => 
      update((observations: Observation[]) => observations.filter(obs => obs.id !== id)),
    updateObservation: (id: string, updates: Partial<Observation>) => 
      update((observations: Observation[]) => 
        observations.map(obs => obs.id === id ? { ...obs, ...updates } : obs)
      ),
    clear: () => set([]),
    // Bulk operations
    addMany: (newObservations: Observation[]) =>
      update((observations: Observation[]) => [...observations, ...newObservations]),
    // Filter operations  
    getByUserId: (userId: string): Observation[] => {
      let result: Observation[] = [];
      const unsubscribe = subscribe((observations: Observation[]) => {
        result = observations.filter(obs => obs.user_id === userId);
      });
      unsubscribe();
      return result;
    },
    getByType: (observationType: ObservationType): Observation[] => {
      let result: Observation[] = [];
      const unsubscribe = subscribe((observations: Observation[]) => {
        result = observations.filter(obs => obs.observation_type === observationType);
      });
      unsubscribe();
      return result;
    }
  };
}

export const observationsStore = createObservationsStore();

// ===== AUTH STORE =====
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends Writable<AuthState> {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

function createAuthStore(): AuthStore {
  const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    set,
    update,
    // Auth methods
    login: (user: User) => {
      update((state: AuthState) => ({
        ...state,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }));
      
      // Persist to localStorage if in browser
      if (browser && user) {
        try {
          localStorage.setItem('leopold_user', JSON.stringify(user));
        } catch (e) {
          console.warn('Failed to save user to localStorage:', e);
        }
      }
    },
    logout: () => {
      set(initialState);
      
      // Clear localStorage if in browser
      if (browser) {
        try {
          localStorage.removeItem('leopold_user');
          localStorage.removeItem('auth_token');
        } catch (e) {
          console.warn('Failed to clear user from localStorage:', e);
        }
      }
    },
    setLoading: (isLoading: boolean) =>
      update((state: AuthState) => ({ ...state, isLoading })),
    setError: (error: string | null) =>
      update((state: AuthState) => ({ ...state, error, isLoading: false })),
    clearError: () =>
      update((state: AuthState) => ({ ...state, error: null })),
    // Initialize from localStorage
    initialize: () => {
      if (browser) {
        try {
          const savedUser = localStorage.getItem('leopold_user');
          const authToken = localStorage.getItem('auth_token');
          
          if (savedUser && authToken) {
            const user: User = JSON.parse(savedUser);
            update((state: AuthState) => ({
              ...state,
              user,
              isAuthenticated: true
            }));
          }
        } catch (e) {
          console.warn('Failed to initialize auth from localStorage:', e);
        }
      }
    },
    // Update user profile
    updateProfile: (updates: Partial<User>) =>
      update((state: AuthState) => {
        if (state.user) {
          const updatedUser: User = { ...state.user, ...updates };
          // Persist to localStorage
          if (browser) {
            try {
              localStorage.setItem('leopold_user', JSON.stringify(updatedUser));
            } catch (e) {
              console.warn('Failed to save updated user:', e);
            }
          }
          return {
            ...state,
            user: updatedUser
          };
        }
        return state;
      })
  };
}

export const authStore = createAuthStore();

// ===== UI STORE =====
interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  duration: number;
}

interface Modal {
  isOpen: boolean;
  component: string | null;
  props: Record<string, any>;
}

interface Sidebar {
  isOpen: boolean;
}

interface UIState {
  loading: LoadingState;
  notifications: Notification[];
  modals: Modal;
  sidebar: Sidebar;
  theme: 'light' | 'dark';
  error: string | null;
}

interface UIStore extends Writable<UIState> {
  setLoading: (state: LoadingState) => void;
  showNotification: (type: NotificationType, message: string, duration?: number) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (component: string, props?: Record<string, any>) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => void;
}

function createUIStore(): UIStore {
  const initialState: UIState = {
    loading: 'idle' as LoadingState,
    notifications: [] as Notification[],
    modals: {
      isOpen: false,
      component: null,
      props: {}
    } as Modal,
    sidebar: {
      isOpen: false
    } as Sidebar,
    theme: 'light' as const,
    error: null
  };

  const { subscribe, set, update } = writable<UIState>(initialState);

  return {
    subscribe,
    set,
    update,
    // Loading state
    setLoading: (state: LoadingState) =>
      update((ui: UIState) => ({ ...ui, loading: state })),
    // Notifications
    showNotification: (type: NotificationType, message: string, duration: number = 5000): string => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type,
        message,
        timestamp: Date.now(),
        duration
      };
      
      update((ui: UIState) => ({
        ...ui,
        notifications: [...ui.notifications, notification]
      }));

      // Auto-remove notification after duration
      if (duration > 0) {
        setTimeout(() => {
          update((ui: UIState) => ({
            ...ui,
            notifications: ui.notifications.filter(n => n.id !== notification.id)
          }));
        }, duration);
      }

      return notification.id;
    },
    removeNotification: (id: string) =>
      update((ui: UIState) => ({
        ...ui,
        notifications: ui.notifications.filter(n => n.id !== id)
      })),
    clearNotifications: () =>
      update((ui: UIState) => ({ ...ui, notifications: [] })),
    // Modals
    openModal: (component: string, props: Record<string, any> = {}) =>
      update((ui: UIState) => ({
        ...ui,
        modals: {
          isOpen: true,
          component,
          props
        }
      })),
    closeModal: () =>
      update((ui: UIState) => ({
        ...ui,
        modals: {
          isOpen: false,
          component: null,
          props: {}
        }
      })),
    // Sidebar
    toggleSidebar: () =>
      update((ui: UIState) => ({
        ...ui,
        sidebar: { isOpen: !ui.sidebar.isOpen }
      })),
    openSidebar: () =>
      update((ui: UIState) => ({
        ...ui,
        sidebar: { isOpen: true }
      })),
    closeSidebar: () =>
      update((ui: UIState) => ({
        ...ui,
        sidebar: { isOpen: false }
      })),
    // Theme
    setTheme: (theme: 'light' | 'dark') => {
      update((ui: UIState) => ({ ...ui, theme }));
      
      // Persist theme preference
      if (browser) {
        try {
          localStorage.setItem('leopold_theme', theme);
          
          // Apply theme to document
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {
          console.warn('Failed to save theme preference:', e);
        }
      }
    },
    toggleTheme: () => {
      let currentTheme: 'light' | 'dark' = 'light';
      const unsubscribe = subscribe((ui: UIState) => {
        currentTheme = ui.theme;
      });
      unsubscribe();
      
      const newTheme: 'light' | 'dark' = currentTheme === 'light' ? 'dark' : 'light';
      update((ui: UIState) => ({ ...ui, theme: newTheme }));
      
      // Apply theme
      if (browser) {
        try {
          localStorage.setItem('leopold_theme', newTheme);
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {
          console.warn('Failed to save theme preference:', e);
        }
      }
    },
    // Error handling
    setError: (error: string | null) =>
      update((ui: UIState) => ({ ...ui, error, loading: 'error' })),
    clearError: () =>
      update((ui: UIState) => ({ ...ui, error: null })),
    // Initialize UI preferences
    initialize: () => {
      if (browser) {
        try {
          const savedTheme = localStorage.getItem('leopold_theme');
          if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            update((ui: UIState) => ({ ...ui, theme: savedTheme as 'light' | 'dark' }));
            
            if (savedTheme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          }
        } catch (e) {
          console.warn('Failed to initialize UI preferences:', e);
        }
      }
    }
  };
}

export const uiStore = createUIStore();

// ===== FILTERS STORE =====
interface FiltersState extends ObservationFilters {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface FiltersStore extends Writable<FiltersState> {
  setSpecies: (species: string[]) => void;
  addSpecies: (species: string) => void;
  removeSpecies: (species: string) => void;
  setLocation: (location: { center: { latitude: number; longitude: number }; radius_km: number } | undefined) => void;
  setLocationFromPoint: (center: { latitude: number; longitude: number }, radius_km: number) => void;
  setDateRange: (dateRange: { start: Date; end: Date } | undefined) => void;
  setObservationType: (observationType: ObservationType | undefined) => void;
  setUser: (user: string | undefined) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setVerified: (verified: boolean | undefined) => void;
  setSorting: (sortBy: string, sortOrder?: 'asc' | 'desc') => void;
  reset: () => void;
  clearSpecies: () => void;
  clearLocation: () => void;
  clearDateRange: () => void;
  clearObservationType: () => void;
  clearUser: () => void;
  clearTags: () => void;
  clearVerified: () => void;
}

function createFiltersStore(): FiltersStore {
  const initialState: FiltersState = {
    species: [] as string[],
    location: undefined,
    dateRange: undefined,
    observationType: undefined,
    user: undefined,
    tags: [] as string[],
    verified: undefined,
    sortBy: 'created_at',
    sortOrder: 'desc' as const
  };

  const { subscribe, set, update } = writable<FiltersState>(initialState);

  return {
    subscribe,
    set,
    update,
    // Filter methods
    setSpecies: (species: string[]) =>
      update((filters: FiltersState) => ({ ...filters, species })),
    addSpecies: (species: string) =>
      update((filters: FiltersState) => ({
        ...filters,
        species: [...(filters.species || []), species]
      })),
    removeSpecies: (species: string) =>
      update((filters: FiltersState) => ({
        ...filters,
        species: (filters.species || []).filter((s: string) => s !== species)
      })),
    setLocation: (location: { center: { latitude: number; longitude: number }; radius_km: number } | undefined) =>
      update((filters: FiltersState) => ({ ...filters, location })),
    setLocationFromPoint: (center: { latitude: number; longitude: number }, radius_km: number) =>
      update((filters: FiltersState) => ({ ...filters, location: { center, radius_km } })),
    setDateRange: (dateRange: { start: Date; end: Date } | undefined) =>
      update((filters: FiltersState) => ({ ...filters, dateRange })),
    setObservationType: (observationType: ObservationType | undefined) =>
      update((filters: FiltersState) => ({ ...filters, observationType })),
    setUser: (user: string | undefined) =>
      update((filters: FiltersState) => ({ ...filters, user })),
    setTags: (tags: string[]) =>
      update((filters: FiltersState) => ({ ...filters, tags })),
    addTag: (tag: string) =>
      update((filters: FiltersState) => ({
        ...filters,
        tags: [...(filters.tags || []), tag]
      })),
    removeTag: (tag: string) =>
      update((filters: FiltersState) => ({
        ...filters,
        tags: (filters.tags || []).filter((t: string) => t !== tag)
      })),
    setVerified: (verified: boolean | undefined) =>
      update((filters: FiltersState) => ({ ...filters, verified })),
    setSorting: (sortBy: string, sortOrder: 'asc' | 'desc' = 'desc') =>
      update((filters: FiltersState) => ({ ...filters, sortBy, sortOrder })),
    // Reset filters
    reset: () => set(initialState),
    // Clear specific filter
    clearSpecies: () =>
      update((filters: FiltersState) => ({ ...filters, species: [] })),
    clearLocation: () =>
      update((filters: FiltersState) => ({ ...filters, location: undefined })),
    clearDateRange: () =>
      update((filters: FiltersState) => ({ ...filters, dateRange: undefined })),
    clearObservationType: () =>
      update((filters: FiltersState) => ({ ...filters, observationType: undefined })),
    clearUser: () =>
      update((filters: FiltersState) => ({ ...filters, user: undefined })),
    clearTags: () =>
      update((filters: FiltersState) => ({ ...filters, tags: [] })),
    clearVerified: () =>
      update((filters: FiltersState) => ({ ...filters, verified: undefined }))
  };
}

export const filtersStore = createFiltersStore();

// ===== AUDIO STORE =====
interface AudioState {
  isRecording: boolean;
  isPlaying: boolean;
  hasPermission: boolean;
  currentRecording: AudioRecording | null;
  error: string | null;
  recordingTime: number;
  audioLevel: number;
  supportedFormats: string[];
  settings: {
    sampleRate: number;
    channels: number;
    bitsPerSample: number;
  };
}

interface AudioStore extends Writable<AudioState> {
  startRecording: () => void;
  stopRecording: () => void;
  startPlaying: () => void;
  stopPlaying: () => void;
  setPermission: (hasPermission: boolean) => void;
  setCurrentRecording: (recording: AudioRecording | null) => void;
  clearCurrentRecording: () => void;
  setAudioLevel: (level: number) => void;
  setRecordingTime: (time: number) => void;
  incrementRecordingTime: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  updateSettings: (settings: Partial<AudioState['settings']>) => void;
  reset: () => void;
}

function createAudioStore(): AudioStore {
  const initialState: AudioState = {
    isRecording: false,
    isPlaying: false,
    hasPermission: false,
    currentRecording: null,
    error: null,
    recordingTime: 0,
    audioLevel: 0,
    supportedFormats: ['webm', 'mp4', 'wav'],
    settings: {
      sampleRate: 44100,
      channels: 1,
      bitsPerSample: 16
    }
  };

  const { subscribe, set, update } = writable<AudioState>(initialState);

  return {
    subscribe,
    set,
    update,
    // Recording control
    startRecording: () =>
      update((state: AudioState) => ({ 
        ...state, 
        isRecording: true, 
        recordingTime: 0,
        error: null 
      })),
    stopRecording: () =>
      update((state: AudioState) => ({ ...state, isRecording: false })),
    // Playback control  
    startPlaying: () =>
      update((state: AudioState) => ({ ...state, isPlaying: true })),
    stopPlaying: () =>
      update((state: AudioState) => ({ ...state, isPlaying: false })),
    // Permission handling
    setPermission: (hasPermission: boolean) =>
      update((state: AudioState) => ({ ...state, hasPermission })),
    // Recording management
    setCurrentRecording: (recording: AudioRecording | null) =>
      update((state: AudioState) => ({ ...state, currentRecording: recording })),
    clearCurrentRecording: () =>
      update((state: AudioState) => ({ ...state, currentRecording: null })),
    // Audio level monitoring
    setAudioLevel: (level: number) =>
      update((state: AudioState) => ({ ...state, audioLevel: level })),
    // Recording time
    setRecordingTime: (time: number) =>
      update((state: AudioState) => ({ ...state, recordingTime: time })),
    incrementRecordingTime: () =>
      update((state: AudioState) => ({ ...state, recordingTime: state.recordingTime + 1 })),
    // Error handling
    setError: (error: string | null) =>
      update((state: AudioState) => ({ 
        ...state, 
        error, 
        isRecording: false, 
        isPlaying: false 
      })),
    clearError: () =>
      update((state: AudioState) => ({ ...state, error: null })),
    // Settings
    updateSettings: (settings: Partial<AudioState['settings']>) =>
      update((state: AudioState) => ({ 
        ...state, 
        settings: { ...state.settings, ...settings } 
      })),
    // Reset audio state
    reset: () => set(initialState)
  };
}

export const audioStore = createAudioStore();

// ===== DERIVED STORES =====

// Filtered observations based on current filters
export const filteredObservations = derived(
  [observationsStore, filtersStore],
  ([observations, filters]: [Observation[], FiltersState]) => {
    let filtered: Observation[] = observations;

    // Filter by species
    if (filters.species && filters.species.length > 0) {
      filtered = filtered.filter((obs: Observation) => 
        filters.species!.some((species: string) => 
          obs.species_name?.toLowerCase().includes(species.toLowerCase()) ||
          obs.scientific_name?.toLowerCase().includes(species.toLowerCase())
        )
      );
    }

    // Filter by observation type
    if (filters.observationType && filters.observationType !== 'all') {
      filtered = filtered.filter((obs: Observation) => 
        obs.observation_type === filters.observationType
      );
    }

    // Filter by user
    if (filters.user) {
      filtered = filtered.filter((obs: Observation) => obs.user_id === filters.user);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((obs: Observation) =>
        obs.tags && filters.tags!.some((tag: string) => 
          obs.tags!.includes(tag)
        )
      );
    }

    // Filter by verification status
    if (filters.verified !== undefined) {
      filtered = filtered.filter((obs: Observation) => obs.is_verified === filters.verified);
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter((obs: Observation) => {
        const obsDate = new Date(obs.created_at);
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;
        
        return (!startDate || obsDate >= startDate) &&
               (!endDate || obsDate <= endDate);
      });
    }

    // Sort results
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    
    filtered.sort((a: Observation, b: Observation) => {
      let aValue: any = (a as any)[sortBy];
      let bValue: any = (b as any)[sortBy];
      
      // Handle date sorting
      if (sortBy.includes('_at')) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortOrder === 'desc' ? -result : result;
    });

    return filtered;
  }
);

// Current user observations
export const userObservations = derived(
  [observationsStore, authStore],
  ([observations, auth]: [Observation[], AuthState]) => {
    if (!auth.user) return [];
    return observations.filter((obs: Observation) => obs.user_id === auth.user!.id);
  }
);

// Observation statistics
export const observationStats = derived(
  [observationsStore, authStore],
  ([observations, auth]: [Observation[], AuthState]) => {
    const stats = {
      total: observations.length,
      byUser: auth.user ? observations.filter((obs: Observation) => obs.user_id === auth.user!.id).length : 0,
      byType: {
        visual: observations.filter((obs: Observation) => obs.observation_type === 'visual').length,
        audio: observations.filter((obs: Observation) => obs.observation_type === 'audio').length,
        'multi-modal': observations.filter((obs: Observation) => obs.observation_type === 'multi-modal').length
      },
      uniqueSpecies: new Set(observations.map((obs: Observation) => obs.species_name).filter(Boolean)).size,
      verified: observations.filter((obs: Observation) => obs.is_verified).length,
      thisWeek: (() => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return observations.filter((obs: Observation) => 
          new Date(obs.created_at) > oneWeekAgo
        ).length;
      })(),
      thisMonth: (() => {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return observations.filter((obs: Observation) => 
          new Date(obs.created_at) > oneMonthAgo
        ).length;
      })()
    };

    return stats;
  }
);

// ===== INITIALIZATION =====

// Initialize stores when in browser
if (browser) {
  // Initialize auth from localStorage
  authStore.initialize();
  
  // Initialize UI preferences
  uiStore.initialize();
}