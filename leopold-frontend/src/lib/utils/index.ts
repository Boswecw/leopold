// src/lib/utils/index.ts - Core Utility Functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format duration in human readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
}

/**
 * Format coordinates in human readable format
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance in human readable format
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 1) {
    const meters = Math.round(kilometers * 1000);
    return `${meters}m`;
  }
  
  if (kilometers < 10) {
    return `${kilometers.toFixed(1)}km`;
  }
  
  return `${Math.round(kilometers)}km`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Get device information
 */
export function getDeviceInfo(): {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
  userAgent: string;
} {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android.*Tablet|PlayBook|Silk/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  let platform = 'Unknown';
  if (/Mac/i.test(userAgent)) platform = 'macOS';
  else if (/Win/i.test(userAgent)) platform = 'Windows';
  else if (/Linux/i.test(userAgent)) platform = 'Linux';
  else if (/Android/i.test(userAgent)) platform = 'Android';
  else if (/iOS|iPhone|iPad/i.test(userAgent)) platform = 'iOS';
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    platform,
    userAgent
  };
}

/**
 * Check if feature is supported
 */
export function checkFeatureSupport(): {
  webAudio: boolean;
  mediaRecorder: boolean;
  geolocation: boolean;
  serviceWorker: boolean;
  webRTC: boolean;
  localStorage: boolean;
} {
  return {
    webAudio: !!(window.AudioContext || (window as any).webkitAudioContext),
    mediaRecorder: typeof MediaRecorder !== 'undefined',
    geolocation: 'geolocation' in navigator,
    serviceWorker: 'serviceWorker' in navigator,
    webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    localStorage: (() => {
      try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })()
  };
}

/**
 * Safely parse JSON
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Create URL-safe slug from string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get contrast color (black or white) for background
 */
export function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Generate color from string (deterministic)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll element into view smoothly
 */
export function scrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
    ...options
  });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Clamp number between min and max
 */
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

// src/lib/utils/audio.ts - Audio-specific utilities

/**
 * Audio processing utilities for Leopold
 */

/**
 * Convert audio buffer to different sample rate
 */
export function resampleAudioBuffer(
  audioContext: AudioContext,
  buffer: AudioBuffer,
  targetSampleRate: number
): AudioBuffer {
  if (buffer.sampleRate === targetSampleRate) {
    return buffer;
  }
  
  const ratio = buffer.sampleRate / targetSampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = audioContext.createBuffer(
    buffer.numberOfChannels,
    newLength,
    targetSampleRate
  );
  
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const inputData = buffer.getChannelData(channel);
    const outputData = result.getChannelData(channel);
    
    for (let i = 0; i < newLength; i++) {
      const index = Math.floor(i * ratio);
      outputData[i] = inputData[index];
    }
  }
  
  return result;
}

/**
 * Apply window function to audio data
 */
export function applyWindow(data: Float32Array, windowType: 'hann' | 'hamming' | 'blackman' = 'hann'): Float32Array {
  const result = new Float32Array(data.length);
  const N = data.length;
  
  for (let i = 0; i < N; i++) {
    let window = 1;
    
    switch (windowType) {
      case 'hann':
        window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
        break;
      case 'hamming':
        window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
        break;
      case 'blackman':
        window = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (N - 1));
        break;
    }
    
    result[i] = data[i] * window;
  }
  
  return result;
}

/**
 * Calculate RMS (Root Mean Square) of audio data
 */
export function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

/**
 * Detect audio peaks
 */
export function detectPeaks(data: Float32Array, threshold = 0.1, minDistance = 10): number[] {
  const peaks: number[] = [];
  
  for (let i = minDistance; i < data.length - minDistance; i++) {
    if (Math.abs(data[i]) > threshold) {
      let isPeak = true;
      
      // Check if this is a local maximum
      for (let j = i - minDistance; j < i + minDistance; j++) {
        if (j !== i && Math.abs(data[j]) >= Math.abs(data[i])) {
          isPeak = false;
          break;
        }
      }
      
      if (isPeak) {
        peaks.push(i);
      }
    }
  }
  
  return peaks;
}

/**
 * Calculate spectral centroid
 */
export function calculateSpectralCentroid(magnitudes: Float32Array, sampleRate: number): number {
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < magnitudes.length; i++) {
    const frequency = (i * sampleRate) / (2 * magnitudes.length);
    numerator += frequency * magnitudes[i];
    denominator += magnitudes[i];
  }
  
  return denominator > 0 ? numerator / denominator : 0;
}

/**
 * Calculate zero crossing rate
 */
export function calculateZeroCrossingRate(data: Float32Array): number {
  let crossings = 0;
  
  for (let i = 1; i < data.length; i++) {
    if ((data[i] >= 0) !== (data[i - 1] >= 0)) {
      crossings++;
    }
  }
  
  return crossings / (data.length - 1);
}

/**
 * Normalize audio data
 */
export function normalizeAudio(data: Float32Array): Float32Array {
  const max = Math.max(...Array.from(data).map(Math.abs));
  const result = new Float32Array(data.length);
  
  if (max === 0) return result;
  
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] / max;
  }
  
  return result;
}

/**
 * Convert audio buffer to WAV format
 */
export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);
  
  // PCM data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return arrayBuffer;
}

// Export all utilities
export * from './audio';

// src/lib/utils/validation.ts - Input validation utilities

/**
 * Validation utilities for forms and user input
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate observation form data
 */
export function validateObservationForm(data: {
  observation_type?: string;
  species_name?: string;
  location?: { latitude: number; longitude: number };
  images?: File[];
  audio?: File;
  description?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Observation type validation
  if (!data.observation_type) {
    errors.push('Observation type is required');
  }
  
  // Location validation
  if (!data.location) {
    errors.push('Location is required');
  } else {
    if (data.location.latitude < -90 || data.location.latitude > 90) {
      errors.push('Invalid latitude value');
    }
    if (data.location.longitude < -180 || data.location.longitude > 180) {
      errors.push('Invalid longitude value');
    }
  }
  
  // Media validation
  const hasImages = data.images && data.images.length > 0;
  const hasAudio = data.audio;
  
  if (!hasImages && !hasAudio) {
    errors.push('At least one image or audio recording is required');
  }
  
  // Image validation
  if (hasImages) {
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    data.images!.forEach((image, index) => {
      if (image.size > maxImageSize) {
        errors.push(`Image ${index + 1} is too large (max 10MB)`);
      }
      if (!allowedImageTypes.includes(image.type)) {
        errors.push(`Image ${index + 1} has unsupported format`);
      }
    });
  }
  
  // Audio validation
  if (hasAudio) {
    const maxAudioSize = 50 * 1024 * 1024; // 50MB
    const allowedAudioTypes = ['audio/webm', 'audio/mp4', 'audio/wav', 'audio/mpeg'];
    
    if (data.audio!.size > maxAudioSize) {
      errors.push('Audio file is too large (max 50MB)');
    }
    if (!allowedAudioTypes.includes(data.audio!.type)) {
      errors.push('Audio file has unsupported format');
    }
  }
  
  // Description validation
  if (data.description && data.description.length > 2000) {
    errors.push('Description is too long (max 2000 characters)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate user registration data
 */
export function validateUserRegistration(data: {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Username validation
  if (!data.username) {
    errors.push('Username is required');
  } else if (data.username.length < 3) {
    errors.push('Username must be at least 3 characters');
  } else if (data.username.length > 20) {
    errors.push('Username must be less than 20 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Password validation
  if (!data.password) {
    errors.push('Password is required');
  } else {
    if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/(?=.*[a-z])/.test(data.password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(data.password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain at least one number');
    }
  }
  
  // Confirm password validation
  if (!data.confirmPassword) {
    errors.push('Please confirm your password');
  } else if (data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validate and sanitize species name
 */
export function validateSpeciesName(name: string): ValidationResult {
  const errors: string[] = [];
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    errors.push('Species name is required');
  } else if (trimmedName.length < 2) {
    errors.push('Species name must be at least 2 characters');
  } else if (trimmedName.length > 100) {
    errors.push('Species name is too long (max 100 characters)');
  } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    errors.push('Species name can only contain letters, spaces, hyphens, and apostrophes');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}