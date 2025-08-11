import { browser } from '$app/environment';
import type {
  ApiResponse,
  User,
  Observation,
  ObservationFormData
} from '$lib/types';

const API_BASE_URL = browser ? 
  (import.meta.env?.VITE_API_URL as string || 'http://localhost:8000') :
  'http://localhost:8000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (!browser) return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    // Initialize headers and set defaults only when appropriate
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>)
    };

    const hasContentType = Object.keys(headers).some(
      (key) => key.toLowerCase() === 'content-type'
    );

    if (
      options.body &&
      typeof options.body === 'string' &&
      !hasContentType
    ) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,  // Added missing status field
          error: data.message || `HTTP Error: ${response.status}`,
          message: data.message || `HTTP Error: ${response.status}`
        };
      }

      return {
        success: true,
        status: response.status,  // Added missing status field
        data,
        message: data.message || 'Success'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,  // Added status field for network errors
        error: error instanceof Error ? error.message : 'Network error',
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Auth methods
  async signIn(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async signUp(userData: { email: string; username: string; password: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async signOut(): Promise<ApiResponse<null>> {
    const result = await this.request<null>('/auth/signout', { method: 'POST' });
    if (browser && result.success) {
      localStorage.removeItem('auth_token');
    }
    return result;
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request('/auth/me');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  // Observation methods
  async getObservations(params?: {
    limit?: number;
    offset?: number;
    species?: string;
    location?: { lat: number; lng: number; radius: number };
    dateRange?: { start: string; end: string };
    observationType?: string;
  }): Promise<ApiResponse<Observation[]>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());
      if (params.species) searchParams.set('species', params.species);
      if (params.observationType) searchParams.set('type', params.observationType);
      if (params.location) {
        searchParams.set('lat', params.location.lat.toString());
        searchParams.set('lng', params.location.lng.toString());
        searchParams.set('radius', params.location.radius.toString());
      }
      if (params.dateRange) {
        searchParams.set('start_date', params.dateRange.start);
        searchParams.set('end_date', params.dateRange.end);
      }
    }

    const endpoint = `/observations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async createObservation(observation: ObservationFormData): Promise<ApiResponse<Observation>> {
    return this.request('/observations', {
      method: 'POST',
      body: JSON.stringify(observation)
    });
  }

  async getObservation(id: string): Promise<ApiResponse<Observation>> {
    return this.request(`/observations/${id}`);
  }

  async updateObservation(id: string, updates: Partial<ObservationFormData>): Promise<ApiResponse<Observation>> {
    return this.request(`/observations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteObservation(id: string): Promise<ApiResponse<null>> {
    return this.request(`/observations/${id}`, {
      method: 'DELETE'
    });
  }

  // Species methods
  async searchSpecies(query: string, location?: { lat: number; lng: number }): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams({ q: query });
    if (location) {
      searchParams.set('lat', location.lat.toString());
      searchParams.set('lng', location.lng.toString());
    }
    
    return this.request(`/species/search?${searchParams.toString()}`);
  }

  async getSpecies(id: string): Promise<ApiResponse<any>> {
    return this.request(`/species/${id}`);
  }

  // File upload methods
  async uploadImage(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/uploads/images`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: data.message || `Upload failed: ${response.status}`,
          message: data.message || `Upload failed: ${response.status}`
        };
      }

      return {
        success: true,
        status: response.status,
        data,
        message: 'Upload successful'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Upload error',
        message: error instanceof Error ? error.message : 'Upload error'
      };
    }
  }

  async uploadAudio(file: File): Promise<ApiResponse<{ url: string; id: string }>> {
    const formData = new FormData();
    formData.append('audio', file);

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}/uploads/audio`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          error: data.message || `Upload failed: ${response.status}`,
          message: data.message || `Upload failed: ${response.status}`
        };
      }

      return {
        success: true,
        status: response.status,
        data,
        message: 'Upload successful'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Upload error',
        message: error instanceof Error ? error.message : 'Upload error'
      };
    }
  }

  // Location/geocoding methods
  async geocodeLocation(query: string): Promise<ApiResponse<any[]>> {
    const searchParams = new URLSearchParams({ q: query });
    return this.request(`/geocode?${searchParams.toString()}`);
  }

  async reverseGeocode(lat: number, lng: number): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams({ 
      lat: lat.toString(), 
      lng: lng.toString() 
    });
    return this.request(`/geocode/reverse?${searchParams.toString()}`);
  }
}

export const apiClient = new APIClient();