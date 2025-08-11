import { describe, expect, test } from 'vitest';
import { validateObservationForm, validateLocation } from './validation';

// Tests for handling 0 values in validation utilities

describe('validateObservationForm', () => {
  test('accepts 0 coordinates', () => {
    const result = validateObservationForm({
      observation_type: 'visual',
      species_name: 'Test',
      location: { latitude: 0, longitude: 0 }
    });

    expect(result.errors.location).toBeUndefined();
    expect(result.isValid).toBe(true);
  });

  test('errors when count is 0', () => {
    const result = validateObservationForm({
      observation_type: 'visual',
      species_name: 'Test',
      location: { latitude: 10, longitude: 10 },
      count: 0
    });

    expect(result.errors.count).toBe('Count must be at least 1');
  });

  test('errors when confidence is 0', () => {
    const result = validateObservationForm({
      observation_type: 'visual',
      species_name: 'Test',
      location: { latitude: 10, longitude: 10 },
      confidence: 0
    });

    expect(result.errors.confidence).toBe(
      'Confidence must be between 1 and 5'
    );
  });
});

describe('validateLocation', () => {
  test('accepts coordinates at 0', () => {
    const result = validateLocation({ latitude: 0, longitude: 0 });

    expect(result.errors.latitude).toBeUndefined();
    expect(result.errors.longitude).toBeUndefined();
    expect(result.isValid).toBe(true);
  });
});

