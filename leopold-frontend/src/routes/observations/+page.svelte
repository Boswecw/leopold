<!-- src/routes/observations/+page.svelte - Proper full-featured page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { Plus, Map, List, Filter, Search, TrendingUp, Camera, Mic, MapPin, Calendar, Users, Grid } from 'lucide-svelte';
  
  // Import types - fixed import path
  import type { Observation, ViewMode, ObservationType } from '$types';
  import { observationsStore, uiStore } from '$lib/stores';

  // Page state
  let observations: Observation[] = [];
  let isLoading: boolean = true;
  let searchQuery: string = '';
  let viewMode: ViewMode = 'list';
  let showFilters: boolean = false;

  // Filter state
  let selectedObservationType: ObservationType | 'all' = 'all';
  let selectedSpecies: string = '';
  let dateRange: { start: string; end: string } = { start: '', end: '' };

  // Stats for dashboard
  let totalObservations: number = 0;
  let uniqueSpecies: number = 0;
  let thisWeekCount: number = 0;
  let myObservationsCount: number = 0;

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
      
      // Mock data for development - you can replace this with real data
      observations = [
        {
          id: '1',
          user_id: 'user1',
          observation_type: 'visual',
          species_name: 'American Robin',
          scientific_name: 'Turdus migratorius',
          location: {
            latitude: 40.7829,
            longitude: -73.9654,
            region: 'Central Park, NYC'
          },
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          updated_at: new Date().toISOString(),
          description: 'Spotted feeding on the ground near the Bethesda Fountain',
          image_urls: ['placeholder-robin.jpg'],
          count: 2,
          confidence: 4,
          weather_conditions: 'Partly cloudy, 18°C',
          habitat_description: 'Urban park with mixed trees',
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
            region: 'Washington Square Park, NYC'
          },
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          updated_at: new Date().toISOString(),
          description: 'Beautiful morning song from male cardinal',
          audio_url: 'placeholder-cardinal.mp3',
          count: 1,
          confidence: 5,
          weather_conditions: 'Clear, 22°C'
        },
        {
          id: '3',
          user_id: 'user1',
          observation_type: 'multi-modal',
          species_name: 'Red-winged Blackbird',
          scientific_name: 'Agelaius phoeniceus',
          location: {
            latitude: 40.7691,
            longitude: -73.9789,
            region: 'Prospect Park, Brooklyn'
          },
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          updated_at: new Date().toISOString(),
          description: 'Male displaying territorial behavior near marsh area',
          image_urls: ['placeholder-blackbird.jpg'],
          audio_url: 'placeholder-blackbird.mp3',
          count: 1,
          confidence: 5,
          weather_conditions: 'Overcast, 16°C',
          tags: ['territorial', 'breeding', 'marsh']
        }
      ];
    } catch (error) {
      console.error('Error loading observations:', error);
      uiStore.showNotification('error', 'Failed to load observations');
    } finally {
      isLoading = false;
    }
  }

  function calculateStats(): void {
    totalObservations = observations.length;
    uniqueSpecies = new Set(observations.map(obs => obs.species_name).filter(Boolean)).size;
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    thisWeekCount = observations.filter(obs => new Date(obs.created_at) > oneWeekAgo).length;
    
    // Mock user count - in real app, filter by current user
    myObservationsCount = observations.filter(obs => obs.user_id === 'user1').length;
  }

  function handleViewModeChange(mode: ViewMode): void {
    viewMode = mode;
  }

  function handleNewObservation(): void {
    window.location.href = '/observations/new';
  }

  function clearFilters(): void {
    selectedObservationType = 'all';
    selectedSpecies = '';
    dateRange = { start: '', end: '' };
    searchQuery = '';
  }

  // Filter observations based on all criteria
  $: filteredObservations = observations.filter((obs: Observation) => {
    // Text search
    const searchMatch = !searchQuery || 
      obs.species_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.location?.region?.toLowerCase().includes(searchQuery.toLowerCase());

    // Observation type filter
    const typeMatch = selectedObservationType === 'all' || obs.observation_type === selectedObservationType;

    // Species filter
    const speciesMatch = !selectedSpecies || obs.species_name?.toLowerCase().includes(selectedSpecies.toLowerCase());

    // Date range filter
    let dateMatch = true;
    if (dateRange.start || dateRange.end) {
      const obsDate = new Date(obs.created_at);
      if (dateRange.start) dateMatch = dateMatch && obsDate >= new Date(dateRange.start);
      if (dateRange.end) dateMatch = dateMatch && obsDate <= new Date(dateRange.end);
    }

    return searchMatch && typeMatch && speciesMatch && dateMatch;
  });

  $: activeFiltersCount = [
    selectedObservationType !== 'all',
    selectedSpecies !== '',
    dateRange.start !== '',
    dateRange.end !== '',
    searchQuery !== ''
  ].filter(Boolean).length;
</script>

<svelte:head>
  <title>Observations | Leopold Nature Observer</title>
</svelte:head>

<!-- Hero Section -->
<section class="hero bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-4xl font-bold mb-4">Wildlife Observations</h1>
    <p class="text-xl mb-8 max-w-2xl mx-auto">
      Discover and document the incredible biodiversity in your area. Every observation counts for conservation!
    </p>
    <button
      on:click={handleNewObservation}
      class="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2 mx-auto"
    >
      <Plus class="w-5 h-5" />
      Add New Observation
    </button>
  </div>
</section>

<!-- Stats Section -->
<section class="stats py-12 bg-gray-50">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-green-600 mb-2">{totalObservations}</div>
        <div class="text-sm text-gray-600 flex items-center justify-center gap-1">
          <TrendingUp class="w-4 h-4" />
          Total Observations
        </div>
      </div>
      
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-blue-600 mb-2">{uniqueSpecies}</div>
        <div class="text-sm text-gray-600 flex items-center justify-center gap-1">
          <Search class="w-4 h-4" />
          Species Documented
        </div>
      </div>
      
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-green-500 mb-2">{thisWeekCount}</div>
        <div class="text-sm text-gray-600 flex items-center justify-center gap-1">
          <Calendar class="w-4 h-4" />
          This Week
        </div>
      </div>
      
      <div class="stat-card text-center p-6 bg-white rounded-lg shadow-sm">
        <div class="text-3xl font-bold text-purple-600 mb-2">{myObservationsCount}</div>
        <div class="text-sm text-gray-600 flex items-center justify-center gap-1">
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
    <div class="controls-bar flex flex-col gap-4 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="search-section flex-1">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search species, locations, or notes..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <!-- View Mode Toggles -->
        <div class="view-modes flex bg-gray-100 rounded-lg p-1">
          <button
            on:click={() => handleViewModeChange('map')}
            class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'map' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'}"
          >
            <Map class="w-4 h-4" />
            Map
          </button>
          <button
            on:click={() => handleViewModeChange('list')}
            class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'list' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'}"
          >
            <List class="w-4 h-4" />
            List
          </button>
          <button
            on:click={() => handleViewModeChange('grid')}
            class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'grid' 
              ? 'bg-white text-green-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-800'}"
          >
            <Grid class="w-4 h-4" />
            Grid
          </button>
        </div>

        <!-- Filters Toggle -->
        <button
          on:click={() => showFilters = !showFilters}
          class="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 relative"
        >
          <Filter class="w-4 h-4" />
          Filters
          {#if activeFiltersCount > 0}
            <span class="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          {/if}
        </button>
      </div>

      <!-- Filters Panel -->
      {#if showFilters}
        <div class="filters-panel bg-white border border-gray-200 rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Observation Type Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                bind:value={selectedObservationType}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="visual">Visual</option>
                <option value="audio">Audio</option>
                <option value="multi-modal">Multi-modal</option>
                <option value="plant">Plant</option>
              </select>
            </div>

            <!-- Species Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <input
                type="text"
                bind:value={selectedSpecies}
                placeholder="Filter by species"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <!-- Date Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                bind:value={dateRange.start}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                bind:value={dateRange.end}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <span class="text-sm text-gray-600">
              {filteredObservations.length} of {observations.length} observations
            </span>
            <button
              on:click={clearFilters}
              class="text-sm text-green-600 hover:text-green-700 font-medium"
              disabled={activeFiltersCount === 0}
            >
              Clear Filters
            </button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Loading State -->
    {#if isLoading}
      <div class="loading-state flex flex-col items-center justify-center py-16">
        <div class="animate-spin w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full mb-4"></div>
        <p class="text-gray-600">Loading observations...</p>
      </div>
    
    <!-- No Results -->
    {:else if filteredObservations.length === 0}
      <div class="no-results flex flex-col items-center justify-center py-16">
        <Search class="w-16 h-16 text-gray-400 mb-4" />
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          {activeFiltersCount > 0 ? 'No observations match your filters' : 'No observations found'}
        </h3>
        <p class="text-gray-600 mb-6">
          {activeFiltersCount > 0 
            ? 'Try adjusting your search terms or filters' 
            : 'Be the first to document wildlife in your area!'}
        </p>
        {#if activeFiltersCount > 0}
          <button
            on:click={clearFilters}
            class="text-green-600 hover:text-green-700 font-medium mb-4"
          >
            Clear all filters
          </button>
        {/if}
        <button
          on:click={handleNewObservation}
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Camera class="w-5 h-5" />
          Create First Observation
        </button>
      </div>

    <!-- Observations Content -->
    {:else}
      <!-- Map View -->
      {#if viewMode === 'map'}
        <div class="map-view bg-gray-100 rounded-lg p-8 text-center">
          <Map class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Interactive Map Coming Soon</h3>
          <p class="text-gray-600">The map view will show observation locations with clustering and filtering capabilities.</p>
        </div>

      <!-- List View -->
      {:else if viewMode === 'list'}
        <div class="list-view space-y-4">
          {#each filteredObservations as observation (observation.id)}
            <div class="observation-item bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  {#if observation.image_urls && observation.image_urls.length > 0}
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Camera class="w-6 h-6 text-blue-600" />
                    </div>
                  {:else if observation.audio_url}
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Mic class="w-6 h-6 text-green-600" />
                    </div>
                  {:else}
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Search class="w-6 h-6 text-gray-400" />
                    </div>
                  {/if}
                </div>
                
                <div class="flex-grow">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900">{observation.species_name || 'Unknown Species'}</h3>
                      {#if observation.scientific_name}
                        <p class="text-sm text-gray-600 italic">{observation.scientific_name}</p>
                      {/if}
                    </div>
                    <span class="px-2 py-1 bg-{observation.observation_type === 'visual' ? 'blue' : observation.observation_type === 'audio' ? 'green' : 'purple'}-100 text-{observation.observation_type === 'visual' ? 'blue' : observation.observation_type === 'audio' ? 'green' : 'purple'}-800 text-xs rounded-full">
                      {observation.observation_type}
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div class="flex items-center gap-1">
                      <MapPin class="w-4 h-4" />
                      {observation.location?.region || 'Location unknown'}
                    </div>
                    <div class="flex items-center gap-1">
                      <Calendar class="w-4 h-4" />
                      {new Date(observation.created_at).toLocaleDateString()}
                    </div>
                    {#if observation.count && observation.count > 1}
                      <div class="flex items-center gap-1">
                        <Users class="w-4 h-4" />
                        {observation.count} individuals
                      </div>
                    {/if}
                  </div>
                  
                  {#if observation.description}
                    <p class="text-gray-700 mb-3">{observation.description}</p>
                  {/if}

                  {#if observation.tags && observation.tags.length > 0}
                    <div class="flex flex-wrap gap-2">
                      {#each observation.tags as tag}
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>

      <!-- Grid View -->
      {:else}
        <div class="grid-view grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {#each filteredObservations as observation (observation.id)}
            <div class="observation-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div class="card-header h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {#if observation.image_urls && observation.image_urls.length > 0}
                  <Camera class="w-12 h-12 text-gray-500" />
                  <span class="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Photo
                  </span>
                {:else if observation.audio_url}
                  <Mic class="w-12 h-12 text-green-600" />
                  <span class="absolute top-2 right-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    Audio
                  </span>
                {:else}
                  <Search class="w-12 h-12 text-gray-400" />
                {/if}
              </div>
              
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 mb-1">{observation.species_name || 'Unknown Species'}</h3>
                {#if observation.scientific_name}
                  <p class="text-sm text-gray-600 italic mb-2">{observation.scientific_name}</p>
                {/if}
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin class="w-4 h-4" />
                  {observation.location?.region || 'Location unknown'}
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Calendar class="w-4 h-4" />
                  {new Date(observation.created_at).toLocaleDateString()}
                </div>
                {#if observation.description}
                  <p class="text-sm text-gray-700 line-clamp-2">{observation.description}</p>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</main>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>