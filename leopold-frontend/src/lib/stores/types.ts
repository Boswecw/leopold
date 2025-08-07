// src/lib/stores/types.ts - Type definitions for stores
// Copy this from your main types file or create as needed

export type ObservationType = 'visual' | 'audio' | 'multi-modal' | 'plant';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

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

export interface ObservationFilters {
  species?: string[];
  location?: {
    center: { latitude: number; longitude: number };
    radius_km: number;
  } | null;
  dateRange?: {
    start: Date;
    end: Date;
  } | null;
  observationType?: ObservationType | null;
  user?: string | null;
  tags?: string[];
  verified?: boolean | null;
}