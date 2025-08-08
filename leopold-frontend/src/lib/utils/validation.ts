// src/lib/utils/validation.ts - Fixed validation functions
import type { ValidationResult, ObservationFormData, Location } from '$lib/types';

export function validateObservationForm(data: Partial<ObservationFormData>): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // Required field validations
  if (!data.observation_type) {
    errors.observation_type = 'Observation type is required';
  }

  if (!data.species_name || data.species_name.trim().length === 0) {
    errors.species_name = 'Species name is required';
  }

  if (!data.location) {
    errors.location = 'Location is required';
  } else {
    // Validate location
    if (!data.location.latitude || !data.location.longitude) {
      errors.location = 'Valid coordinates are required';
    }
  }

  // Optional field validations
  if (data.description && data.description.length > 1000) {
    warnings.description = 'Description is quite long. Consider shortening it.';
  }

  if (data.notes && data.notes.length > 500) {
    warnings.notes = 'Notes are quite long. Consider shortening them.';
  }

  if (data.count && data.count < 1) {
    errors.count = 'Count must be at least 1';
  }

  if (data.confidence && (data.confidence < 1 || data.confidence > 5)) {
    errors.confidence = 'Confidence must be between 1 and 5';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

export function validateImageFile(file: File): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    errors.fileType = 'Only JPEG, PNG, and WebP images are allowed';
  }

  if (file.size > maxSize) {
    errors.fileSize = 'File size must be less than 10MB';
  }

  if (file.size > 5 * 1024 * 1024) {
    warnings.fileSize = 'Large files may take longer to upload';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

export function validateLocation(location: Partial<Location>): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (typeof location.latitude !== 'number' || isNaN(location.latitude)) {
    errors.latitude = 'Valid latitude is required';
  } else if (location.latitude < -90 || location.latitude > 90) {
    errors.latitude = 'Latitude must be between -90 and 90';
  }

  if (typeof location.longitude !== 'number' || isNaN(location.longitude)) {
    errors.longitude = 'Valid longitude is required';
  } else if (location.longitude < -180 || location.longitude > 180) {
    errors.longitude = 'Longitude must be between -180 and 180';
  }

  if (location.accuracy && location.accuracy < 0) {
    warnings.accuracy = 'Location accuracy seems unusually low';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }
  return null;
}