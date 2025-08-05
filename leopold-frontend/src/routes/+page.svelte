<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import ObservationMap from '$lib/components/ObservationMap.svelte';
  import { observationsStore, filtersStore, uiStore } from '$lib/stores';
  import { MapPin, Plus, Filter, List, Grid } from 'lucide-svelte';
  import type { Observation, ViewMode } from '$lib/types';

  let observations: Observation[] = [];
  let selectedObservation: Observation | null = null;
  let viewMode: ViewMode = 'map';
  let showFilters = false;
  let isLoading = true;

  const mockObservations: Observation[] = [
    {
      id: 'obs1',
      user_id: 'user1',
      species_name: 'Northern Leopard Frog',
      scientific_name: 'Lithobates pipiens',
      observation_type: 'wildlife',
      description: 'Heard calling near the creek edge at dusk.',
      image_urls: ['https://example.com/images/frog1.jpg'],
      audio_urls: ['https://example.com/audio/frog1.wav'],
      spectrogram_urls: ['https://example.com/spectrograms/frog1.png'],
      location: {
        latitude: 38.2,
        longitude: -84.5,
        region: 'Kentucky',
        habitat: 'Riparian',
        elevation: 260
      },
      observed_at: new Date().toISOString(),
      recording_duration: 15,
      confidence_level: 0.92,
      expert_verified: false,
      verification_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  $: filteredObservations = $observationsStore.length > 0
    ? $observationsStore
    : observations;

  onMount(() => {
    observations = mockObservations;
    observationsStore.set(observations);
    uiStore.showNotification('success', `Loaded ${observations.length} observations`);
    isLoading = false;
  });

  function handleObservationSelected(event: CustomEvent<Observation>) {
    selectedObservation = event.detail;
    uiStore.selectObservation(event.detail);
  }

  function handleNewObservation() {
    goto('/observations/new');
  }

  function toggleFilters() {
    showFilters = !showFilters;
  }

  function setViewMode(mode: ViewMode) {
    viewMode = mode;
    uiStore.setViewMode(mode);
  }
</script>

<svelte:head>
  <title>Leopold Nature Observer - Wildlife Observation Map</title>
  <meta name="description" content="Explore wildlife observations from around the world. Discover birds, mammals, amphibians, and more through community science." />
</svelte:head>

{#if isLoading}
  <div class="flex justify-center items-center h-screen text-xl">
    Loading observations...
  </div>
{:else}
  <div class="flex flex-col h-screen">
    <!-- Top bar -->
    <header class="flex items-center justify-between p-4 bg-green-100 border-b shadow">
      <h1 class="text-xl font-bold flex items-center gap-2">
        <MapPin class="w-5 h-5" /> Leopold Map View
      </h1>
      <div class="flex gap-2">
        <button on:click={toggleFilters} class="btn">
          <Filter class="w-4 h-4" />
        </button>
        <button on:click={() => setViewMode('map')} class="btn">
          <MapPin class="w-4 h-4" />
        </button>
        <button on:click={() => setViewMode('list')} class="btn">
          <List class="w-4 h-4" />
        </button>
        <button on:click={() => setViewMode('grid')} class="btn">
          <Grid class="w-4 h-4" />
        </button>
        <button on:click={handleNewObservation} class="btn bg-blue-500 text-white">
          <Plus class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Filters Panel -->
    {#if showFilters}
      <div class="p-4 bg-gray-100 border-b">
        <p>🔍 Filters UI goes here</p>
      </div>
    {/if}

    <!-- Main Content Area -->
    <main class="flex-1 overflow-hidden">
      {#if viewMode === 'map'}
        <ObservationMap
          observations={filteredObservations}
          selectedObservation={selectedObservation}
          on:observationSelected={handleObservationSelected}
        />
      {:else if viewMode === 'list'}
        <div class="p-4">📋 List view not yet implemented.</div>
      {:else if viewMode === 'grid'}
        <div class="p-4">🔲 Grid view not yet implemented.</div>
      {/if}
    </main>
  </div>
{/if}

<style>
  .btn {
    @apply px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 flex items-center gap-1 transition;
  }
</style>
