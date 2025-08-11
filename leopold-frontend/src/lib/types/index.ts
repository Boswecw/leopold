// src/lib/types/index.ts - Comprehensive Leopold Types

// ===== CORE ENUMS =====
export type ObservationType = 'visual' | 'audio' | 'multi-modal' | 'plant';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// ===== LOCATION TYPES =====
export interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  region?: string;
  country?: string;
  address?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  zoom: number;
}

export interface ClusterInfo {
  count: number;
  bounds: MapBounds;
  observations: Observation[];
}

// ===== USER TYPES =====
export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  joined_date: string;
  observation_count?: number;
  species_count?: number;
  badges?: string[];
  preferences?: UserPreferences;
  is_verified?: boolean;
  is_expert?: boolean;
  reputation_score?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  public_profile: boolean;
  default_observation_privacy: 'public' | 'private' | 'friends';
  measurement_units: 'metric' | 'imperial';
  map_default_zoom: number;
  audio_auto_play: boolean;
}

// ===== AUDIO TYPES =====
export interface AudioRecording {
  id?: string;
  url: string;
  blob?: Blob;
  duration: number;
  file_size?: number;
  format?: string;
  sample_rate?: number;
  channels?: number;
  created_at?: string;
  waveform_data?: number[];
  spectrogram_url?: string;
  analysis?: AudioAnalysis;
}

export interface AudioAnalysis {
  dominant_frequency: number;
  frequency_range: {
    min: number;
    max: number;
  };
  amplitude_range: {
    min: number;
    max: number;
  };
  species_predictions?: SpeciesPrediction[];
  confidence_score: number;
  analysis_timestamp: string;
}

export interface SpeciesPrediction {
  species_name: string;
  scientific_name?: string;
  confidence: number;
  frequency_match: number;
  temporal_match: number;
}

// ===== OBSERVATION TYPES =====
export interface Observation {
  id: string;
  user_id: string;
  species_name?: string;
  scientific_name?: string;
  common_names?: string[];
  observation_type: ObservationType;
  location: Location;
  created_at: string;
  updated_at?: string;
  description?: string;
  notes?: string;
  
  // Media
  images?: string[];
  audio_recording?: AudioRecording;
  
  // Metadata
  count?: number;
  confidence?: number;
  weather_conditions?: string;
  habitat_description?: string;
  behavior_notes?: string;
  tags?: string[];
  
  // Verification
  is_verified?: boolean;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  
  // Community
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  
  // Privacy
  is_private?: boolean;
  visibility: 'public' | 'private' | 'friends' | 'experts';
  
  // Additional fields
  season?: string;
  time_of_day?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
  moon_phase?: string;
  temperature?: number;
  humidity?: number;
  wind_conditions?: string;
}

export interface ObservationFormData {
  observation_type: ObservationType;
  species_name: string;
  scientific_name?: string;
  location: Location;
  images?: File[] | string[];
  audio_recording?: File | AudioRecording;
  description?: string;
  notes?: string;
  count?: number;
  confidence?: number;
  weather_conditions?: string;
  habitat_description?: string;
  behavior_notes?: string;
  tags?: string[];
  is_private?: boolean;
  visibility?: 'public' | 'private' | 'friends' | 'experts';
}

// ===== FILTER TYPES =====
export interface ObservationFilters {
  species?: string[];
  location?: {
    center: {
      latitude: number;
      longitude: number;
    };
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
}

// ===== SPECIES TYPES =====
export interface Species {
  id: string;
  common_name: string;
  scientific_name: string;
  family?: string;
  order?: string;
  class?: string;
  kingdom?: string;
  conservation_status?: ConservationStatus;
  description?: string;
  habitat?: string;
  diet?: string;
  size_range?: {
    min_length?: number;
    max_length?: number;
    min_weight?: number;
    max_weight?: number;
  };
  typical_sounds?: string[];
  identification_tips?: string[];
  similar_species?: string[];
  seasonal_behavior?: Record<string, string>;
  geographic_range?: string[];
  image_urls?: string[];
  audio_urls?: string[];
  external_links?: ExternalLink[];
}

export type ConservationStatus = 
  | 'LC' // Least Concern
  | 'NT' // Near Threatened  
  | 'VU' // Vulnerable
  | 'EN' // Endangered
  | 'CR' // Critically Endangered
  | 'EW' // Extinct in Wild
  | 'EX' // Extinct
  | 'DD' // Data Deficient
  | 'NE'; // Not Evaluated

export interface ExternalLink {
  name: string;
  url: string;
  type: 'wikipedia' | 'ebird' | 'inaturalist' | 'allaboutbirds' | 'other';
}

// ===== API TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// ===== VALIDATION TYPES =====
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// ===== GAMIFICATION TYPES =====
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: BadgeCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: BadgeRequirement[];
  earned_at?: string;
  progress?: number;
  max_progress?: number;
}

export type BadgeCategory = 
  | 'observer' 
  | 'explorer' 
  | 'contributor' 
  | 'community' 
  | 'expert' 
  | 'conservation'
  | 'seasonal'
  | 'species_specialist';

export interface BadgeRequirement {
  type: 'observation_count' | 'species_count' | 'location_count' | 'verification_count' | 'community_engagement';
  value: number;
  timeframe?: 'all_time' | 'yearly' | 'monthly' | 'weekly';
  filters?: Record<string, any>;
}

export interface UserStats {
  total_observations: number;
  unique_species: number;
  locations_visited: number;
  verifications_made: number;
  likes_received: number;
  comments_made: number;
  streak_days: number;
  rank: number;
  points: number;
  badges_earned: Badge[];
  recent_achievements: Achievement[];
}

export interface Achievement {
  id: string;
  type: 'badge_earned' | 'milestone_reached' | 'streak_achieved' | 'rank_up';
  title: string;
  description: string;
  earned_at: string;
  points_awarded: number;
  badge?: Badge;
}

// ===== COMMENT TYPES =====
export interface Comment {
  id: string;
  observation_id: string;
  user_id: string;
  user: Pick<User, 'id' | 'username' | 'avatar_url' | 'is_verified'>;
  content: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  replies_count: number;
  is_liked?: boolean;
  is_flagged?: boolean;
  parent_comment_id?: string;
  replies?: Comment[];
}

// ===== SEARCH TYPES =====
export interface SearchFilters extends ObservationFilters {
  query?: string;
  sort_by?: 'relevance' | 'date' | 'popularity' | 'distance';
  sort_order?: 'asc' | 'desc';
  include_private?: boolean;
  verified_only?: boolean;
  with_media?: boolean;
  with_audio?: boolean;
  with_images?: boolean;
}

export interface SearchResult {
  type: 'observation' | 'species' | 'user' | 'location';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  relevance_score: number;
  url: string;
  metadata?: Record<string, any>;
}

// ===== EVENT TYPES =====
export interface AppEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: number;
  source: 'user' | 'system' | 'api';
}

export interface UserEvent extends AppEvent {
  user_id: string;
  session_id: string;
}

// ===== EXPORT ALL =====
export type {
  // Re-export everything for convenience
  ObservationType,
  LoadingState, 
  NotificationType,
  Location,
  MapBounds,
  ClusterInfo,
  User,
  UserPreferences,
  AudioRecording,
  AudioAnalysis,
  SpeciesPrediction,
  Observation,
  ObservationFormData,
  ObservationFilters,
  Species,
  ConservationStatus,
  ExternalLink,
  ApiResponse,
  PaginationInfo,
  ApiError,
  ValidationResult,
  FieldValidation,
  ValidationRule,
  Badge,
  BadgeCategory,
  BadgeRequirement,
  UserStats,
  Achievement,
  Comment,
  SearchFilters,
  SearchResult,
  AppEvent,
  UserEvent
};
