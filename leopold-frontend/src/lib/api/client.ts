// src/lib/api/client.ts - API Client for Leopold Backend

import { browser } from '$app/environment';
import type { 
  ApiResponse, 
  User, 
  Observation, 
  SpeciesSearchResult,
  ObservationFilters,
  MapBounds 
} from '$lib/types';

// API Configuration
const API_BASE_URL = browser ? 
  (import.meta.env.VITE_API_URL || 'http://localhost:8000') : 
  'http://localhost:8000';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Enhanced fetch wrapper with authentication, error handling, and retries
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/api/v1${endpoint}`;
  
  // Get auth token from localStorage
  const token = browser ? localStorage.getItem('leopold_auth_token') : null;
  
  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle different response types
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-200 responses
    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        // Clear invalid token
        if (browser) {
          localStorage.removeItem('leopold_auth_token');
          localStorage.removeItem('leopold_user');
        }
        throw new APIError('Authentication required', 401, 'UNAUTHORIZED');
      }

      throw new APIError(
        data.error || data.message || `HTTP ${response.status}`,
        response.status,
        data.code,
        data.details
      );
    }

    return data;
    
  } catch (error) {
    // Retry on network errors
    if (retries > 0 && (error instanceof TypeError || error.message.includes('fetch'))) {
      console.warn(`API request failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest<T>(endpoint, options, retries - 1);
    }
    
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }
    
    // Wrap other errors
    throw new APIError(
      error instanceof Error ? error.message : 'Network request failed',
      0,
      'NETWORK_ERROR'
    );
  }
}

// ==================== AUTHENTICATION API ====================

export const authAPI = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await apiRequest<{ user: User; token: string }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      // Store auth data
      if (browser) {
        localStorage.setItem('leopold_auth_token', response.data.token);
        localStorage.setItem('leopold_user', JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new APIError(response.error || 'Sign in failed', 400);
  },

  /**
   * Sign up new user
   */
  async signUp(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const response = await apiRequest<{ user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      // Store auth data
      if (browser) {
        localStorage.setItem('leopold_auth_token', response.data.token);
        localStorage.setItem('leopold_user', JSON.stringify(response.data.user));
      }
      return response.data;
    }

    throw new APIError(response.error || 'Sign up failed', 400);
  },

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await apiRequest('/auth/signout', { method: 'POST' });
    } catch (error) {
      // Continue with local cleanup even if server request fails
      console.warn('Server signout failed:', error);
    }

    // Clear local auth data
    if (browser) {
      localStorage.removeItem('leopold_auth_token');
      localStorage.removeItem('leopold_user');
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiRequest<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data) {
      if (browser) {
        localStorage.setItem('leopold_auth_token', response.data.token);
      }
      return response.data;
    }

    throw new APIError(response.error || 'Token refresh failed', 401);
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await apiRequest<User>('/auth/profile');

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Failed to get profile', 400);
  },
};

// ==================== OBSERVATIONS API ====================

export const observationsAPI = {
  /**
   * Get observations with optional filtering
   */
  async getObservations(params: {
    bounds?: MapBounds;
    filters?: ObservationFilters;
    page?: number;
    per_page?: number;
  } = {}): Promise<{ observations: Observation[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params.bounds) {
      searchParams.set('bounds', JSON.stringify(params.bounds));
    }
    
    if (params.filters) {
      searchParams.set('filters', JSON.stringify(params.filters));
    }
    
    if (params.page) {
      searchParams.set('page', params.page.toString());
    }
    
    if (params.per_page) {
      searchParams.set('per_page', params.per_page.toString());
    }

    const endpoint = `/observations?${searchParams.toString()}`;
    const response = await apiRequest<{ observations: Observation[]; pagination: any }>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Failed to get observations', 400);
  },

  /**
   * Get observation by ID
   */
  async getObservation(id: string): Promise<Observation> {
    const response = await apiRequest<Observation>(`/observations/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Observation not found', 404);
  },

  /**
   * Create new observation
   */
  async createObservation(observationData: FormData): Promise<Observation> {
    const response = await apiRequest<Observation>('/observations', {
      method: 'POST',
      body: observationData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Failed to create observation', 400);
  },

  /**
   * Update observation
   */
  async updateObservation(id: string, updates: Partial<Observation>): Promise<Observation> {
    const response = await apiRequest<Observation>(`/observations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Failed to update observation', 400);
  },

  /**
   * Delete observation
   */
  async deleteObservation(id: string): Promise<void> {
    const response = await apiRequest(`/observations/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new APIError(response.error || 'Failed to delete observation', 400);
    }
  },

  /**
   * Get user's observations
   */
  async getUserObservations(userId: string, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<{ observations: Observation[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params.page) {
      searchParams.set('page', params.page.toString());
    }
    
    if (params.per_page) {
      searchParams.set('per_page', params.per_page.toString());
    }

    const endpoint = `/users/${userId}/observations?${searchParams.toString()}`;
    const response = await apiRequest<{ observations: Observation[]; pagination: any }>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Failed to get user observations', 400);
  },
};

// ==================== SPECIES API ====================

export const speciesAPI = {
  /**
   * Search for species
   */
  async searchSpecies(params: {
    query: string;
    observation_type?: string;
    location?: { latitude: number; longitude: number };
    limit?: number;
  }): Promise<SpeciesSearchResult[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.query);
    
    if (params.observation_type) {
      searchParams.set('observation_type', params.observation_type);
    }
    
    if (params.location) {
      searchParams.set('lat', params.location.latitude.toString());
      searchParams.set('lng', params.location.longitude.toString());
    }
    
    if (params.limit) {
      searchParams.set('limit', params.limit.toString());
    }

    const endpoint = `/species/search?${searchParams.toString()}`;
    const response = await apiRequest<SpeciesSearchResult[]>(endpoint);

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Species search failed', 400);
  },

  /**
   * Get AI species suggestions
   */
  async getAISuggestions(params: {
    observation_type: string;
    location?: { latitude: number; longitude: number };
    audio_features?: number[];
    image_features?: number[];
    limit?: number;
  }): Promise<SpeciesSearchResult[]> {
    const response = await apiRequest<SpeciesSearchResult[]>('/species/ai-suggestions', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'AI suggestions failed', 400);
  },

  /**
   * Get species details
   */
  async getSpeciesDetails(id: string): Promise<SpeciesSearchResult> {
    const response = await apiRequest<SpeciesSearchResult>(`/species/${id}`);

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Species not found', 404);
  },
};

// ==================== FILE UPLOAD API ====================

export const uploadAPI = {
  /**
   * Upload image file
   */
  async uploadImage(file: File, observationId?: string): Promise<{ url: string; id: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    if (observationId) {
      formData.append('observation_id', observationId);
    }

    const response = await apiRequest<{ url: string; id: string }>('/upload/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Image upload failed', 400);
  },

  /**
   * Upload audio file
   */
  async uploadAudio(file: File, observationId?: string): Promise<{ 
    url: string; 
    id: string; 
    spectrogram_url?: string;
    audio_features?: any;
  }> {
    const formData = new FormData();
    formData.append('audio', file);
    
    if (observationId) {
      formData.append('observation_id', observationId);
    }

    const response = await apiRequest<{ 
      url: string; 
      id: string; 
      spectrogram_url?: string;
      audio_features?: any;
    }>('/upload/audio', {
      method: 'POST',
      body: formData,
      headers: {},
    });

    if (response.success && response.data) {
      return response.data;
    }

    throw new APIError(response.error || 'Audio upload failed', 400);
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (!browser) return false;
  
  const token = localStorage.getItem('leopold_auth_token');
  const user = localStorage.getItem('leopold_user');
  
  return !!(token && user);
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (!browser) return null;
  
  const userStr = localStorage.getItem('leopold_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Format API errors for user display
 */
export function formatAPIError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'UNAUTHORIZED':
        return 'Please sign in to continue';
      case 'NETWORK_ERROR':
        return 'Network connection failed. Please check your internet connection.';
      case 'VALIDATION_ERROR':
        return error.details?.message || 'Please check your input and try again';
      default:
        return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Create FormData for observation submission
 */
export function createObservationFormData(observation: {
  species_name?: string;
  description?: string;
  observation_type: string;
  location: { latitude: number; longitude: number };
  confidence?: number;
  weather_conditions?: string;
  habitat_type?: string;
  call_type?: string;
  images?: File[];
  audio?: File;
}): FormData {
  const formData = new FormData();
  
  // Add text fields
  Object.entries(observation).forEach(([key, value]) => {
    if (value != null && key !== 'images' && key !== 'audio') {
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  
  // Add image files
  if (observation.images) {
    observation.images.forEach((image, index) => {
      formData.append(`images`, image);
    });
  }
  
  // Add audio file
  if (observation.audio) {
    formData.append('audio', observation.audio);
  }
  
  return formData;
}

// ==================== WEBSOCKET CONNECTION ====================

export class ObservationWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    private url: string,
    private onMessage: (data: any) => void,
    private onError: (error: Event) => void = () => {}
  ) {}

  connect(): void {
    if (!browser) return;

    try {
      const wsUrl = this.url.replace('http:', 'ws:').replace('https:', 'wss:');
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.onError(error as Event);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }
}

// Export the APIError class for use in components
export { APIError };