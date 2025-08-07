<script lang="ts">
  import { onMount } from 'svelte';
  import { observationsStore } from '$lib/stores';
  import { goto } from '$app/navigation';
  import { Plus } from 'lucide-svelte';
  import type { Observation } from '$lib/types';

  let observations: Observation[] = [];

  // Subscribe to the store on load
  onMount(() => {
    const unsubscribe = observationsStore.subscribe((obs) => {
      observations = obs;
    });

    return () => unsubscribe();
  });

  function createNewObservation() {
    goto('/observations/new');
  }
</script>

<svelte:head>
  <title>Observations - Leopold Nature Observer</title>
  <meta name="description" content="Browse your recorded wildlife observations and add new entries to contribute to community science." />
</svelte:head>

<div class="max-w-6xl mx-auto p-6">
  <!-- Page Header -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-primary-forest">Your Observations</h1>
    <button
      on:click={createNewObservation}
      class="flex items-center gap-2 px-4 py-2 bg-primary-forest text-white rounded hover:bg-primary-forest/90 transition-colors"
    >
      <Plus class="w-4 h-4" />
      New Observation
    </button>
  </div>

  <!-- Observation List -->
  {#if observations.length > 0}
    <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each observations as obs (obs.id)}
        <li class="border rounded-lg p-4 shadow hover:shadow-md transition">
          <h2 class="text-lg font-semibold text-primary-forest">{obs.species_name || 'Unknown Species'}</h2>
          <p class="text-sm text-gray-600">{new Date(obs.observed_at).toLocaleString()}</p>
          <p class="mt-2 text-sm text-gray-700 line-clamp-3">{obs.description}</p>
        </li>
      {/each}
    </ul>
  {:else}
    <div class="text-center text-gray-600 mt-12">
      <p>No observations recorded yet.</p>
      <p>Click the "New Observation" button above to get started!</p>
    </div>
  {/if}
</div>

<style>
  /* Optional: limit long descriptions */
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
