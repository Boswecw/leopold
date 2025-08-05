// src/lib/types/index.ts - Leopold Type Definitions

/**
 * Core observation types with multi-modal support
 */
export type ObservationType = 'visual' | 'audio' | 'multi-modal' | 'plant' | 'wildlife';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  region?: string;
  habitat?: string;
  elevation?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  total_observations: number;
  achievement_count: number;
  expert_level: number;
}

/**
 * Audio-specific interfaces
 */
export interface AudioFeatures {
  dominant_frequency: number;
  frequency_range: [number, number];
  spectral_centroid: number;
  spectral_rolloff: number;
  zero_crossing_rate: number;
  mfccs: number[];
  tempo: number;
  duration: number;
  pattern_type: 'single' | 'repetitive' | 'complex' | 'continuous';
  noise_ratio: number;
  confidence: number;
}

export interface AudioRecording {
  blob: Blob;
  url: string;
  duration: number;
  waveform_data: number[];
  spectrogram_data: number[];
  file_format: string;
  sample_rate: number;
  channels: number;
}

export interface AudioAnalysis {
  id: string;
  observation_id: string;
  features: AudioFeatures;
  signal_to_noise_ratio: number;
  clarity_score: number;
  processing_algorithm: string;
  analysis_timestamp: string;
}

/**
 * AI Prediction interfaces
 */
export interface SpeciesPrediction {
  species_name: string;
  scientific_name: string;
  confidence: number;
  common_names: string[];
  taxonomy: {
    kingdom: string;
    phylum: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    species: string;
  };
}

export interface AIPredictions {
  visual_predictions?: SpeciesPrediction[];
  audio_predictions?: SpeciesPrediction[];
  fusion_prediction?: SpeciesPrediction;
  confidence: number;
  identification_method: 'visual' | 'audio' | 'multi-modal';
  processing_time: number;
  model_versions: {
    visual?: string;
    audio?: string;
    fusion?: string;
  };
}

/**
 * Main observation interface
 */
export interface Observation {
  id: string;
  user_id: string;
  user?: User;
  species_name: string;
  scientific_name?: string;
  observation_type: ObservationType;
  description?: string;
  
  // Media URLs
  image_urls: string[];
  audio_urls: string[];
  spectrogram_urls: string[];
  
  // Location and timing
  location: Location;
  observed_at: string;
  recording_duration?: number;
  
  // AI analysis
  ai_predictions?: AIPredictions;
  audio_features?: AudioFeatures;
  confidence_level: number;
  
  // Environmental context
  weather_conditions?: string;
  habitat_type?: string;
  background_noise_level?: 'quiet' | 'moderate' | 'noisy';
  call_type?: 'song' | 'call' | 'alarm' | 'territorial' | 'mating' | 'contact';
  audio_quality?: 'clear' | 'moderate' | 'poor';
  
  // Verification and community
  expert_verified: boolean;
  community_consensus?: 'agreed' | 'disputed' | 'uncertain';
  verification_count: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Map and filtering interfaces
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ObservationFilters {
  species: string[];
  observation_types: ObservationType[];
  date_range: {
    start: string;
    end: string;
  } | null;
  location_bounds: MapBounds | null;
  confidence_min: number;
  audio_features?: {
    min_frequency: number;
    max_frequency: number;
    call_types: string[];
    audio_quality: string[];
  };
  verified_only: boolean;
  user_id?: string;
}

/**
 * Gamification interfaces
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  criteria: Record<string, any>;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'observation' | 'identification' | 'community' | 'exploration' | 'conservation';
}

export interface UserAchievement {
  achievement: Achievement;
  unlocked_at: string;
  progress: number;
  is_completed: boolean;
}

export interface UserStats {
  total_observations: number;
  species_identified: number;
  audio_recordings: number;
  visual_observations: number;
  multi_modal_observations: number;
  accuracy_rating: number;
  contribution_score: number;
  achievements: UserAchievement[];
  favorite_habitats: string[];
  most_active_hours: number[];
}

/**
 * Audio component interfaces
 */
export interface AudioRecorderProps {
  max_duration?: number;
  sample_rate?: number;
  enable_visualization?: boolean;
  enable_noise_reduction?: boolean;
  auto_stop?: boolean;
}

export interface AudioRecorderEvents {
  recordingStarted: void;
  recordingStopped: void;
  recordingComplete: AudioRecording;
  error: { message: string; code?: string };
  levelUpdate: { level: number; peak: number };
}

/**
 * Map component interfaces
 */
export interface MapMarker {
  id: string;
  observation: Observation;
  latitude: number;
  longitude: number;
  type: ObservationType;
  confidence: number;
  cluster?: boolean;
}

export interface ClusterInfo {
  count: number;
  audio_count: number;
  visual_count: number;
  multi_modal_count: number;
  average_confidence: number;
}

/**
 * API response interfaces
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface SpeciesSearchResult {
  id: string;
  common_name: string;
  scientific_name: string;
  taxonomy: Record<string, string>;
  habitat_types: string[];
  audio_characteristics?: {
    frequency_range: [number, number];
    call_patterns: string[];
    seasonal_activity: string[];
  };
  image_url?: string;
  conservation_status?: string;
}

/**
 * Form interfaces
 */
export interface ObservationFormData {
  observation_type: ObservationType;
  species_name?: string;
  description?: string;
  location: Location;
  audio_recording?: AudioRecording;
  images?: File[];
  weather_conditions?: string;
  habitat_type?: string;
  call_type?: string;
  confidence?: number;
}

/**
 * Store interfaces
 */
export interface AppState {
  user: User | null;
  observations: Observation[];
  filters: ObservationFilters;
  loading: boolean;
  error: string | null;
  map_bounds: MapBounds | null;
  selected_observation: Observation | null;
}

export interface AudioState {
  is_recording: boolean;
  recording_time: number;
  audio_level: number;
  current_recording: AudioRecording | null;
  supported_formats: string[];
  permissions_granted: boolean;
}

/**
 * Utility types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortOption = 
  | 'date_desc' 
  | 'date_asc' 
  | 'confidence_desc' 
  | 'confidence_asc'
  | 'species_name'
  | 'distance';

export type ViewMode = 'map' | 'list' | 'grid' | 'timeline';

/**
 * Component event types
 */
export interface ComponentEvents {
  observationSelected: Observation;
  observationSubmitted: Observation;
  filtersChanged: ObservationFilters;
  mapBoundsChanged: MapBounds;
  speciesSelected: SpeciesSearchResult;
  achievementUnlocked: Achievement;
  errorOccurred: { message: string; context?: string };
}

/**
 * Environment and configuration
 */
export interface AppConfig {
  api_base_url: string;
  websocket_url: string;
  map_tile_url: string;
  max_audio_duration: number;
  max_image_size: number;
  supported_audio_formats: string[];
  supported_image_formats: string[];
  enable_offline_mode: boolean;
  enable_location_tracking: boolean;
  enable_push_notifications: boolean;
}

// Extend global window object for audio APIs
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    mozAudioContext: typeof AudioContext;
    msAudioContext: typeof AudioContext;
  }
}

// Export commonly used type unions
export type MediaType = 'image' | 'audio' | 'video';
export type QualityLevel = 'low' | 'medium' | 'high' | 'best';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type ThemeMode = 'light' | 'dark' | 'auto';