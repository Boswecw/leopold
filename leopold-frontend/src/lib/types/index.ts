// src/lib/types/index.ts - Clean, complete types file
// Replace your entire src/lib/types/index.ts with this

// ===== BASIC TYPES (define first) =====
export type ObservationType = 'visual' | 'audio' | 'multi-modal' | 'plant';
export type ViewMode = 'map' | 'list' | 'grid' | 'timeline';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// ===== CORE INTERFACES =====
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile_image?: string;
  bio?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  verified?: boolean;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  region?: string;
  country?: string;
  address?: string;
  elevation?: number;
}

// ===== OBSERVATION TYPES =====
export interface Observation {
  id: string;
  user_id: string;
  user?: User;
  observation_type: ObservationType;
  species_name?: string;
  scientific_name?: string;
  common_name?: string;
  description?: string;
  notes?: string;
  location: Location;
  created_at: string;
  updated_at: string;
  observed_at?: string;
  
  // Media
  image_urls?: string[];
  images?: string[];
  audio_url?: string;
  
  // Analysis
  confidence?: number;
  audio_features?: AudioFeatures;
  ai_predictions?: AIPredictions;
  
  // Metadata
  weather_conditions?: string;
  habitat_type?: string;
  habitat_description?: string;
  call_type?: string;
  count?: number;
  verification_status?: 'pending' | 'verified' | 'rejected';
  is_verified?: boolean;
  tags?: string[];
  
  // Legacy support
  latitude?: number;
  longitude?: number;
}

// ===== AUDIO TYPES =====
export interface AudioFeatures {
  frequency_peak: number;
  amplitude: number;
  duration: number;
  noise_ratio: number;
  pattern_type?: string;
  dominant_frequency?: number;
  spectral_centroid?: number;
  zero_crossing_rate?: number;
}

export interface AudioRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  format: string;
  size: number;
  created_at: string;
  file_name?: string;
  sample_rate?: number;
  channels?: number;
  bit_depth?: number;
}

export interface AudioState {
  isRecording: boolean;
  isPlaying: boolean;
  hasPermission: boolean;
  currentRecording: AudioRecording | null;
  error: string | null;
  recordingTime?: number;
  audioLevel?: number;
  is_recording?: boolean;
  recording_time?: number;
  audio_level?: number;
  current_recording?: AudioRecording | null;
  supported_formats?: string[];
  permissions_granted?: boolean;
}

// ===== AI TYPES =====
export interface AIPredictions {
  species: Array<{
    name: string;
    scientific_name: string;
    confidence: number;
  }>;
  identification_method: string;
  confidence?: number;
  processing_time?: number;
  model_version?: string;
}

// ===== FILTER TYPES =====
export interface ObservationFilters {
  observation_types?: string[];
  species_name?: string;
  location_radius?: {
    center: { latitude: number; longitude: number };
    radius_km: number;
  };
  species?: string[];
  location?: {
    center: { latitude: number; longitude: number };
    radius_km: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  observationType?: ObservationType | 'all';
  user?: string;
  tags?: string[];
  verified?: boolean;
  verified_only?: boolean;
}

// ===== FORM TYPES =====
export interface ObservationFormData {
  observation_type: ObservationType;
  species_name?: string;
  scientific_name?: string;
  description?: string;
  notes?: string;
  location: Location;
  audio_recording?: AudioRecording;
  images?: File[];
  weather_conditions?: string;
  habitat_type?: string;
  call_type?: string;
  confidence?: number;
  count?: number;
  tags?: string[];
}

// ===== UTILITY TYPES =====
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface SpeciesSearchResult {
  id: string;
  common_name: string;
  scientific_name: string;
  habitat_types: string[];
  image_url?: string;
  conservation_status?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom?: number;
}

export interface ClusterInfo {
  count: number;
  audio_count: number;
  visual_count: number;
  multi_modal_count: number;
  average_confidence: number;
}

// ===== HELPER FUNCTIONS =====
export function isValidLocation(loc: any): loc is Location {
  return loc &&
         typeof loc.latitude === 'number' &&
         typeof loc.longitude === 'number' &&
         loc.latitude >= -90 && loc.latitude <= 90 &&
         loc.longitude >= -180 && loc.longitude <= 180;
}

export function validateSpeciesName(name: string): ValidationResult {
  const errors: string[] = [];
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    errors.push('Species name is required');
  } else if (trimmedName.length < 2) {
    errors.push('Species name must be at least 2 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function createEmptyObservation(userId: string): Partial<Observation> {
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    location: {
      latitude: 0,
      longitude: 0
    }
  };
}

export function validateObservation(obs: Partial<ObservationFormData>): ValidationResult {
  const errors: string[] = [];
  
  if (!obs.observation_type) {
    errors.push('Observation type is required');
  }
  
  if (!obs.location || obs.location.latitude === 0 || obs.location.longitude === 0) {
    errors.push('Valid location is required');
  }
  
  if (!obs.species_name && !obs.description) {
    errors.push('Either species name or description is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}