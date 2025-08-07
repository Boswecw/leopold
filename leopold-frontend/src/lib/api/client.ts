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
    
    // Initialize headers properly
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    };

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
          error: data.message || `HTTP Error: ${response.status}`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
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

  // Observation methods
  async getObservations(): Promise<ApiResponse<Observation[]>> {
    return this.request('/observations');
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
}

export const apiClient = new APIClient();