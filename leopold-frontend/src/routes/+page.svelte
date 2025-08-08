<!-- src/routes/+page.svelte - COMPLETE FIXED VERSION -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { observationsStore, uiStore, authStore } from '$lib/stores';
  import { Plus, Map, List, Filter, Search, TrendingUp, Camera, Mic, MapPin, Calendar, Users } from 'lucide-svelte';
  
  // Import types (fixed import path)
  import type { Observation } from '$lib/types';
  
  // Type definitions for this component
  type ViewMode = 'map' | 'list' | 'grid';
  type ObservationType = 'visual' | 'audio' | 'multi-modal';
  
  interface ObservationFilters {
    observationType?: ObservationType | 'all';
    species?: string;
    dateRange?: { start: string; end: string };
  }
  
  // Page state
  let observations: Observation[] = [];
  let viewMode: ViewMode = 'map';
  let isLoading = true;
  let searchQuery = '';
  let showFilters = false;
  let selectedFilters: ObservationFilters = {};
  
  // Stats for dashboard
  let totalObservations = 0;
  let uniqueSpecies = 0;
  let thisWeekCount = 0;
  let myObservationsCount = 0;

  // Sample data - replace with actual API calls
  const sampleObservations: Observation[] = [
    {
      id: '1',
      user_id: 'user1',
      observation_type: 'visual',
      species_name: 'American Robin',
      scientific_name: 'Turdus migratorius',
      location: {
        latitude: 40.7829,
        longitude: -73.9654,
        region: 'Central Park, New York'
      },
      timestamp: new Date().toISOString(),
      image_urls: ['https://example.com/robin1.jpg'],
      notes: 'Spotted feeding on the ground near the Bethesda Fountain',
      count: 2,
      confidence: 4,
      weather_conditions: 'Partly cloudy, 18°C',
      habitat_description: 'Urban park with mixed trees',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: true
    },
    {
      id: '2',
      user_id: 'user2',
      observation_type: 'audio',
      species_name: 'Northern Cardinal',
      scientific_name: 'Cardinalis cardinalis',
      location: {
        latitude: 40.7505,
        longitude: -73.9934,
        region: 'Washington Square Park, New York'
      },
      timestamp: new Date().toISOString(),
      audio_url: 'https://example.com/cardinal.mp3',
      notes: 'Beautiful morning song from male cardinal',
      count: 1,
      confidence: 5,
      weather_conditions: 'Clear, 22°C',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      user_id: 'user1',
      observation_type: 'multi-modal',
      species_name: 'Red-eyed Tree Frog',
      scientific_name: 'Agalychnis callidryas',
      location: {
        latitude: 10.7560,
        longitude: -85.3756,
        region: 'Manuel Antonio, Costa Rica'
      },
      timestamp: new Date().toISOString(),
      image_urls: ['https://example.com/treefrog1.jpg', 'https://example.com/treefrog2.jpg'],
      audio_url: 'https://example.com/treefrog.mp3',
      notes: 'Found during night survey near stream. Very active and vocal.',
      count: 3,
      confidence: 4,
      weather_conditions: 'Humid, 26°C, light rain',
      habitat_description: 'Tropical rainforest canopy',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  onMount(async () => {
    await loadObservations();
    calculateStats();
  });

  async function loadObservations(): Promise<void> {
    isLoading = true;
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/observations');
      // observations = await response.json();
      
      // For now, use sample data
      observations = sampleObservations;
      observationsStore.set(observations);
    } catch (error) {
      console.error('Failed to load observations:', error);
      uiStore.showNotification('error', 'Failed to load observations');
    } finally {
      isLoading = false;
    }
  }

  function calculateStats(): void {
    totalObservations = observations.length;
    uniqueSpecies = new Set(observations.map(obs => obs.species_name)).size;
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    thisWeekCount = observations.filter(obs => 
      new Date(obs.created_at) > oneWeekAgo
    ).length;
    
    // TODO: Replace with actual user ID from auth store
    myObservationsCount = observations.filter(obs => obs.user_id === 'user1').length;
  }

  function handleViewModeChange(mode: ViewMode): void {
    viewMode = mode;
  }

  function handleNewObservation(): void {
    goto('/observations/new');
  }

  function toggleFilters(): void {
    showFilters = !showFilters;
  }

  function applyFilters(): void {
    // TODO: Implement filtering logic
    console.log('Applying filters:', selectedFilters);
  }

  function resetFilters(): void {
    selectedFilters = {};
    applyFilters();
  }

  // Reactive filtering based on search and filters
  $: filteredObservations = observations.filter(observation => {
    // Text search
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        observation.species_name.toLowerCase().includes(searchLower) ||
        observation.scientific_name?.toLowerCase().includes(searchLower) ||
        observation.location.region.toLowerCase().includes(searchLower) ||
        observation.notes?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    
    // Type filter
    if (selectedFilters.observationType && selectedFilters.observationType !== 'all') {
      if (observation.observation_type !== selectedFilters.observationType) return false;
    }
    
    return true;
  });
</script>

<!-- Hero Section -->
<section class="hero bg-gradient-to-br from-primary-forest to-primary-sky text-white py-16">
  <div class="container mx-auto px-4 text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-5xl md:text-6xl font-bold mb-6">Leopold Nature Observer</h1>
      <p class="text-xl md:text-2xl mb-8 text-green-100">
        Document wildlife through community science. Track biodiversity, share discoveries, and contribute to conservation through the power of observation.
      </p>
      
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <button 
          on:click={handleNewObservation}
          class="bg-white text-primary-forest px-8 py-4 rounded-lg font-semibold text-lg hover:bg-neutral-off-white transition-colors flex items-center justify-center gap-2"
        >
          <Plus class="w-5 h-5" />
          New Observation
        </button>
        <button 
          on:click={() => handleViewModeChange('map')}
          class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-forest transition-colors flex items-center justify-center gap-2"
        >
          <Map class="w-5 h-5" />
          Explore Map
        </button>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="stats py-12 bg-neutral-50">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-primary-forest mb-2">{totalObservations}</div>
        <div class="text-sm text-neutral-stone-gray flex items-center justify-center gap-1">
          <TrendingUp class="w-4 h-4" />
          Total Observations
        </div>
      </div>
      
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-primary-sky mb-2">{uniqueSpecies}</div>
        <div class="text-sm text-neutral-stone-gray flex items-center justify-center gap-1">
          <Search class="w-4 h-4" />
          Species Documented
        </div>
      </div>
      
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-success mb-2">{thisWeekCount}</div>
        <div class="text-sm text-neutral-stone-gray flex items-center justify-center gap-1">
          <Calendar class="w-4 h-4" />
          This Week
        </div>
      </div>
      
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-secondary-goldenrod mb-2">{myObservationsCount}</div>
        <div class="text-sm text-neutral-stone-gray flex items-center justify-center gap-1">
          <Users class="w-4 h-4" />
          My Contributions
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Main Content -->
<main class="main-content py-8">
  <div class="container mx-auto px-4">
    <!-- Controls Bar -->
    <div class="controls-bar flex flex-col md:flex-row gap-4 mb-8">
      <!-- Search -->
      <div class="search-section flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            id="global-search"
            type="text"
            bind:value={searchQuery}
            placeholder="Search species, locations, or notes..."
            class="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
          />
        </div>
      </div>

      <!-- View Mode Toggles -->
      <div class="view-modes flex bg-neutral-100 rounded-lg p-1">
        <button
          on:click={() => handleViewModeChange('map')}
          class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'map' 
            ? 'bg-white text-primary-forest shadow-sm' 
            : 'text-neutral-600 hover:text-primary-forest'}"
        >
          <Map class="w-4 h-4" />
          Map
        </button>
        <button
          on:click={() => handleViewModeChange('list')}
          class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'list' 
            ? 'bg-white text-primary-forest shadow-sm' 
            : 'text-neutral-600 hover:text-primary-forest'}"
        >
          <List class="w-4 h-4" />
          List
        </button>
      </div>

      <!-- Filter Button -->
      <button
        on:click={toggleFilters}
        class="flex items-center gap-2 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <Filter class="w-4 h-4" />
        Filters
        {#if Object.keys(selectedFilters).length > 0}
          <span class="bg-primary-forest text-white text-xs px-2 py-1 rounded-full">
            {Object.keys(selectedFilters).length}
          </span>
        {/if}
      </button>
    </div>

    <!-- Filters Panel -->
    {#if showFilters}
      <div class="filters-panel bg-white border border-neutral-200 rounded-lg p-6 mb-8 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-primary-forest">Filter Observations</h3>
          <button
            on:click={resetFilters}
            class="text-sm text-primary-sky hover:text-primary-forest"
          >
            Reset All
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <!-- FIXED: Added for/id attributes for accessibility -->
            <label for="observation-type-filter" class="block text-sm font-medium text-neutral-stone-gray mb-2">Observation Type</label>
            <select 
              id="observation-type-filter"
              bind:value={selectedFilters.observationType}
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
            >
              <option value="">All Types</option>
              <option value="visual">📷 Visual</option>
              <option value="audio">🎵 Audio</option>
              <option value="multi-modal">🎬 Multi-modal</option>
            </select>
          </div>
          <div>
            <!-- FIXED: Added for/id attributes for accessibility -->
            <label for="species-filter" class="block text-sm font-medium text-neutral-stone-gray mb-2">Species</label>
            <input
              id="species-filter"
              type="text"
              bind:value={selectedFilters.species}
              placeholder="Search species..."
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
            />
          </div>
          <div>
            <!-- FIXED: Added for/id attributes for accessibility -->
            <label for="date-range-filter" class="block text-sm font-medium text-neutral-stone-gray mb-2">Date Range</label>
            <input
              id="date-range-filter"
              type="date"
              class="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
            />
          </div>
        </div>
        
        <div class="flex gap-4 mt-6">
          <button
            on:click={applyFilters}
            class="btn btn-primary"
          >
            Apply Filters
          </button>
          <button
            on:click={toggleFilters}
            class="btn btn-outline"
          >
            Close
          </button>
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if isLoading}
      <div class="loading-state text-center py-12">
        <div class="spinner w-8 h-8 mx-auto mb-4"></div>
        <p class="text-neutral-stone-gray">Loading observations...</p>
      </div>
    {:else}
      <!-- Content Views -->
      {#if viewMode === 'map'}
        <div class="map-view bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="map-container h-96 bg-neutral-100 flex items-center justify-center">
            <div class="text-center">
              <MapPin class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <p class="text-neutral-600">Interactive map will load here</p>
              <p class="text-sm text-neutral-500 mt-2">
                Showing {filteredObservations.length} observations
              </p>
            </div>
          </div>
        </div>

      {:else if viewMode === 'list'}
        <div class="list-view">
          {#if filteredObservations.length === 0}
            <div class="empty-state text-center py-12">
              <Search class="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 class="text-lg font-semibold text-neutral-600 mb-2">No observations found</h3>
              <p class="text-neutral-500 mb-4">Try adjusting your search or filters</p>
              <button
                on:click={handleNewObservation}
                class="btn btn-primary"
              >
                <Plus class="w-4 h-4 mr-2" />
                Add First Observation
              </button>
            </div>
          {:else}
            <div class="observations-list space-y-4">
              {#each filteredObservations as observation}
                <div class="card card-body hover:shadow-nature-lg transition-shadow">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        {#if observation.observation_type === 'visual'}
                          <Camera class="w-5 h-5 text-secondary-goldenrod" />
                        {:else if observation.observation_type === 'audio'}
                          <Mic class="w-5 h-5 text-primary-sky" />
                        {:else}
                          <div class="flex">
                            <Camera class="w-4 h-4 text-secondary-goldenrod" />
                            <Mic class="w-4 h-4 text-primary-sky ml-1" />
                          </div>
                        {/if}
                        <h3 class="text-lg font-semibold text-primary-forest">
                          {observation.species_name}
                        </h3>
                        {#if observation.is_verified}
                          <span class="badge badge-success text-xs">✓ Verified</span>
                        {/if}
                      </div>
                      
                      {#if observation.scientific_name}
                        <p class="text-sm italic text-neutral-600 mb-2">
                          {observation.scientific_name}
                        </p>
                      {/if}
                      
                      <div class="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                        <span class="flex items-center gap-1">
                          <MapPin class="w-4 h-4" />
                          {observation.location.region}
                        </span>
                        <span class="flex items-center gap-1">
                          <Calendar class="w-4 h-4" />
                          {new Date(observation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {#if observation.notes}
                        <p class="text-neutral-700 text-sm line-clamp-2">
                          {observation.notes}
                        </p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</main>

<style>
  /* Custom styles that complement Tailwind */
  .spinner {
    border: 2px solid transparent;
    border-top: 2px solid var(--color-primary-forest);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2.5rem;
    }
    
    .hero p {
      font-size: 1.125rem;
    }
    
    .controls-bar {
      gap: 1rem;
    }
    
    .view-modes {
      justify-content: center;
    }
  }
</style>