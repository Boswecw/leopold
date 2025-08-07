import type { 
  ObservationFormData, 
  Location, 
  ObservationType,
  ValidationResult
} from '$lib/types';

export function validateObservationForm(data: Partial<ObservationFormData>): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Observation type validation
  const validTypes: ObservationType[] = ['visual', 'audio', 'multi-modal'];
  if (!data.observation_type || !validTypes.includes(data.observation_type)) {
    errors.observationType = 'Please select a valid observation type';
  }

  // Species validation
  if (!data.species_name || data.species_name.trim().length === 0) {
    errors.species = 'Species name is required';
  }

  // Location validation
  if (!data.location) {
    errors.location = 'Location is required';
  } else {
    const locationValidation = isValidLocation(data.location);
    if (!locationValidation) {
      errors.location = 'Invalid location coordinates';
    }
  }

  // Media validation
  if (data.observation_type === 'visual' && (!data.images || data.images.length === 0)) {
    errors.images = 'Visual observations require at least one image';
  }

  if (data.observation_type === 'audio' && !data.audio_recording) {
    errors.audio = 'Audio observations require an audio recording';
  }

  if (data.observation_type === 'multi-modal') {
    if ((!data.images || data.images.length === 0) && !data.audio_recording) {
      errors.media = 'Multi-modal observations require either images or audio';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    sanitizedData: data
  };
}

export function validateImageFile(file: File): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.fileType = 'Only JPEG, PNG, WebP, and GIF images are allowed';
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.fileSize = 'Image must be smaller than 10MB';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

export function isValidLocation(location: Location): boolean {
  return location.latitude >= -90 && 
         location.latitude <= 90 &&
         location.longitude >= -180 && 
         location.longitude <= 180;
}
