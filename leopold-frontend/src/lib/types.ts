// Fix for src/lib/types.ts - Add missing types that were causing errors

export type ObservationType = 'visual' | 'audio' | 'multi-modal' | 'plant';

export interface AudioFeatures {
  frequency_peak: number;
  amplitude: number;
  duration: number;
  pattern_type?: string; // Add this missing property
  noise_ratio: number;
}

export interface AIPredictions {
  species: Array<{
    name: string;
    scientific_name: string;
    confidence: number;
  }>;
  confidence?: number; // Add this missing property
  identification_method: string;
}

// Fix for AuthState - make sure it has the required properties
export interface AuthState {
  id: string; // Add this missing property
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  // ... other properties
}

// Fix for observationsStore - add the missing 'add' method
import { writable, type Writable } from 'svelte/store';
import type { Observation } from './types';

interface ObservationStore extends Writable<Observation[]> {
  add: (observation: Observation) => void;
}

function createObservationsStore(): ObservationStore {
  const { subscribe, set, update } = writable<Observation[]>([]);

  return {
    subscribe,
    set,
    update,
    add: (observation: Observation) => update(observations => [...observations, observation])
  };
}

export const observationsStore = createObservationsStore();