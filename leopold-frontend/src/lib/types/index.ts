// src/lib/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  profile_image?: string;
  bio?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  region?: string;
  country?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom?: number;
}

export type ObservationType = 'visual' | 'audio' | 'multi-modal' | 'plant';
export type ViewMode = 'map' | 'list' | 'grid' | 'timeline';

export interface Observation {
  id: string;
  user_id: string;
  observation_type: ObservationType;
  species_name?: string;
  description?: string;
  location: Location;
  created_at: string;
  updated_at: string;
  confidence?: number;
  weather_conditions?: string;
  habitat_type?: string;
  call_type?: string;
  images?: string[];
  audio_url?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
}

export interface ClusterInfo {
  count: number;
  audio_count: number;
  visual_count: number;
  multi_modal_count: number;
  average_confidence: number;
}

export interface AudioRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  format: string;
  size: number;
  created_at: string;
}

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

export interface ObservationFilters {
  observation_types?: string[];
  species_name?: string;
  location_radius?: {
    center: { latitude: number; longitude: number };
    radius_km: number;
  };
}

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

export function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}