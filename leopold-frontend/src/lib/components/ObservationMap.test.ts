import { describe, expect, test } from 'vitest';
import { filterObservations } from './ObservationMap.svelte';
import type { Observation } from '$lib/types';

describe('filterObservations', () => {
  const observations: Observation[] = [
    {
      id: '1',
      user_id: 'u1',
      observation_type: 'visual',
      location: { latitude: 0, longitude: 0 },
      created_at: '2024-01-10T00:00:00Z',
      species_name: 'Sparrow',
      is_verified: true
    },
    {
      id: '2',
      user_id: 'u2',
      observation_type: 'audio',
      location: { latitude: 0, longitude: 0 },
      created_at: '2024-02-10T00:00:00Z',
      species_name: 'Robin',
      is_verified: false
    },
    {
      id: '3',
      user_id: 'u3',
      observation_type: 'visual',
      location: { latitude: 0, longitude: 0 },
      created_at: '2024-01-20T00:00:00Z',
      species_name: 'Hawk',
      is_verified: true
    }
  ];

  const baseLayers = {
    visual: true,
    audio: true,
    'multi-modal': true,
    plant: true,
    verified: true
  } as const;

  test('filters by species name', () => {
    const result = filterObservations(observations, { species: ['Sparrow'] }, baseLayers);
    expect(result.map(o => o.id)).toEqual(['1']);
  });

  test('filters by date range', () => {
    const result = filterObservations(
      observations,
      {
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-15')
        }
      },
      baseLayers
    );
    expect(result.map(o => o.id)).toEqual(['1']);
  });

  test('excludes unverified observations when verified layer is off', () => {
    const layers = { ...baseLayers, verified: false };
    const result = filterObservations(observations, {}, layers);
    expect(result.map(o => o.id)).toEqual(['1', '3']);
  });

  test('filters unverified observations using filters.verified', () => {
    const result = filterObservations(observations, { verified: false }, baseLayers);
    expect(result.map(o => o.id)).toEqual(['2']);
  });

  test('respects observation type layers', () => {
    const layers = { ...baseLayers, audio: false };
    const result = filterObservations(observations, {}, layers);
    expect(result.map(o => o.id)).toEqual(['1', '3']);
  });
});

