<!-- src/routes/+page.svelte - COMPLETE FIXED VERSION -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { observationsStore } from '$lib/stores';
  import { Plus, Map, List, Search, TrendingUp, Camera, Mic, MapPin, Calendar, Users } from 'lucide-svelte';
  
  // Import types
  import type { Observation, User, ViewMode, ObservationType } from '$lib/types';
  
  // Type definitions for this component
  interface ObservationFilters {
    observationType?: ObservationType | 'all';
    species?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  }
  
  // Page state
  let viewMode: ViewMode = 'map';
  let searchQuery = '';
  let selectedFilters: ObservationFilters = {
    observationType: 'all'
  };
  
  // Mock user data
  const mockUser1: User = {
    id: 'user1',
    email: 'naturalist@example.com',
    username: 'naturalist1',
    display_name: 'Nature Observer',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
    observation_count: 15,
    species_count: 12
  };

  const mockUser2: User = {
    id: 'user2', 
    email: 'birder@example.com',
    username: 'birdwatcher',
    display_name: 'City Birder',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
    updated_at: new Date().toISOString(),
    observation_count: 28,
    species_count: 24
  };

  // Sample observations with all required fields
  const sampleObservations: Observation[] = [
    {
      id: '1',
      user_id: 'user1',
      user: mockUser1,
      observation_type: 'visual',
      species_name: 'American Robin',
      scientific_name: 'Turdus migratorius',
      location: {
        latitude: 40.7829,
        longitude: -73.9654,
        accuracy: 10,
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
      user: mockUser2,
      observation_type: 'audio',
      species_name: 'Northern Cardinal',
      scientific_name: 'Cardinalis cardinalis',
      location: {
        latitude: 40.7505,
        longitude: -73.9934,
        accuracy: 10,
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
      user: mockUser1,
      observation_type: 'multi-modal',
      species_name: 'Red-eyed Tree Frog',
      scientific_name: 'Agalychnis callidryas',
      location: {
        latitude: 10.7560,
        longitude: -85.3756,
        accuracy: 10,
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

  // Initialize with sample data
  let observations = sampleObservations;
  
  // Stats derived from observations
  $: totalObservations = observations.length;
  $: uniqueSpecies = new Set(observations.map(obs => obs.species_name).filter(Boolean)).size;
  $: thisWeekCount = observations.filter(obs => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(obs.created_at) > weekAgo;
  }).length;
  $: myObservationsCount = observations.filter(obs => obs.user_id === 'user1').length;

  // Reactive filtering based on search and filters with proper null checks
  $: filteredObservations = observations.filter(observation => {
    // Text search with null safety
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const speciesName = observation.species_name || '';
      const scientificName = observation.scientific_name || '';
      const region = observation.location?.region || '';
      const notes = observation.notes || '';
      
      const matchesSearch = 
        speciesName.toLowerCase().includes(searchLower) ||
        scientificName.toLowerCase().includes(searchLower) ||
        region.toLowerCase().includes(searchLower) ||
        notes.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (selectedFilters.observationType && selectedFilters.observationType !== 'all') {
      if (observation.observation_type !== selectedFilters.observationType) return false;
    }

    return true;
  });

  // View mode handlers
  function handleViewModeChange(mode: ViewMode) {
    viewMode = mode;
  }

  // Filter handlers
  function handleFilterChange(filterType: keyof ObservationFilters, value: any) {
    selectedFilters = { ...selectedFilters, [filterType]: value };
  }

  function handleObservationTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      handleFilterChange('observationType', target.value);
    }
  }

  function clearFilters() {
    selectedFilters = { observationType: 'all' };
    searchQuery = '';
  }

  // Navigation handlers
  function goToObservations() {
    goto('/observations');
  }

  function goToNewObservation() {
    goto('/observations/new');
  }

  function goToObservationDetail(id: string) {
    goto(`/observations/${id}`);
  }

  // Initialize data on mount
  onMount(() => {
    // Load observations into store
    observationsStore.set(sampleObservations);
  });

  // Format date for display
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Get observation type icon
  function getObservationIcon(type: ObservationType): typeof Camera {
    switch (type) {
      case 'visual': return Camera;
      case 'audio': return Mic;
      case 'multi-modal': return MapPin;
      default: return Camera;
    }
  }

  // Get observation type color
  function getObservationColor(type: ObservationType): string {
    switch (type) {
      case 'visual': return 'text-blue-600';
      case 'audio': return 'text-green-600';
      case 'multi-modal': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  }
</script>

<svelte:head>
  <title>Leopold Nature Observer</title>
  <meta name="description" content="Track and discover wildlife through community science" />
</svelte:head>

<!-- Hero Section -->
<section class="hero bg-gradient-to-br from-primary-forest to-primary-sky text-white py-16">
  <div class="container mx-auto px-4 text-center">
    <h1 class="text-5xl font-bold mb-6">Leopold Nature Observer</h1>
    <p class="text-xl mb-8 max-w-2xl mx-auto">
      Document wildlife through community science. Track biodiversity, share discoveries, 
      and contribute to conservation through the power of observation.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        on:click={goToNewObservation}
        class="btn btn-secondary flex items-center gap-2 px-8 py-4 text-lg"
      >
        <Plus class="w-6 h-6" />
        New Observation
      </button>
      <button 
        on:click={goToObservations}
        class="btn btn-outline flex items-center gap-2 px-8 py-4 text-lg text-white border-white hover:bg-white hover:text-primary-forest"
      >
        <Search class="w-6 h-6" />
        Explore Observations
      </button>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="stats py-12 bg-gray-50">
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
        <div class="text-3xl font-bold text-green-600 mb-2">{thisWeekCount}</div>
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
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="global-search"
            type="text"
            bind:value={searchQuery}
            placeholder="Search species, locations, or notes..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
          />
        </div>
      </div>

      <!-- View Mode Toggles -->
      <div class="view-modes flex bg-gray-100 rounded-lg p-1">
        <button
          on:click={() => handleViewModeChange('map')}
          class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'map' 
            ? 'bg-white text-primary-forest shadow-sm' 
            : 'text-gray-600 hover:text-primary-forest'}"
        >
          <Map class="w-4 h-4" />
          Map
        </button>
        <button
          on:click={() => handleViewModeChange('list')}
          class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'list' 
            ? 'bg-white text-primary-forest shadow-sm' 
            : 'text-gray-600 hover:text-primary-forest'}"
        >
          <List class="w-4 h-4" />
          List
        </button>
      </div>

      <!-- Filter Toggle -->
      <div class="filter-section">
        <select
          bind:value={selectedFilters.observationType}
          on:change={handleObservationTypeChange}
          class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
        >
          <option value="all">All Types</option>
          <option value="visual">Visual</option>
          <option value="audio">Audio</option>
          <option value="multi-modal">Multi-modal</option>
        </select>
      </div>

      <button
        on:click={clearFilters}
        class="btn btn-outline px-4 py-2 text-sm border-gray-300 text-gray-600 hover:bg-gray-50"
      >
        Clear Filters
      </button>
    </div>

    <!-- Content Based on View Mode -->
    {#if viewMode === 'map'}
      <!-- Map View Placeholder -->
      <div class="map-container bg-gray-100 rounded-lg p-8 text-center min-h-96">
        <MapPin class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Interactive Map</h3>
        <p class="text-gray-500">
          Map view coming soon! This will show all observations on an interactive map with clustering and filtering.
        </p>
        <div class="mt-6">
          <button 
            on:click={() => handleViewModeChange('list')}
            class="btn btn-primary"
          >
            View as List
          </button>
        </div>
      </div>
    {/if}

    {#if viewMode === 'list'}
      <!-- List View -->
      <div class="observations-list">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-primary-forest">
            Recent Observations ({filteredObservations.length})
          </h2>
          <button 
            on:click={goToNewObservation}
            class="btn btn-primary flex items-center gap-2"
          >
            <Plus class="w-4 h-4" />
            Add Observation
          </button>
        </div>

        {#if filteredObservations.length === 0}
          <div class="empty-state text-center py-12">
            <Search class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 class="text-xl font-semibold text-gray-600 mb-2">No observations found</h3>
            <p class="text-gray-500 mb-6">
              {searchQuery ? 'Try adjusting your search terms or filters.' : 'Be the first to add an observation!'}
            </p>
            <button 
              on:click={goToNewObservation}
              class="btn btn-primary"
            >
              Add First Observation
            </button>
          </div>
        {:else}
          <div class="grid gap-6">
            {#each filteredObservations as observation (observation.id)}
              <div class="observation-card card p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="observation-type-icon p-2 bg-gray-100 rounded-full {getObservationColor(observation.observation_type)}">
                      <svelte:component this={getObservationIcon(observation.observation_type)} class="w-5 h-5" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-lg text-primary-forest">
                        {observation.species_name || 'Unknown Species'}
                      </h3>
                      {#if observation.scientific_name}
                        <p class="text-sm text-gray-600 italic">{observation.scientific_name}</p>
                      {/if}
                    </div>
                  </div>
                  <div class="text-right text-sm text-gray-500">
                    <p>{formatDate(observation.created_at)}</p>
                    <p class="flex items-center gap-1 mt-1">
                      <MapPin class="w-3 h-3" />
                      {observation.location.region || 'Unknown location'}
                    </p>
                  </div>
                </div>

                {#if observation.notes}
                  <p class="text-gray-700 mb-4 line-clamp-2">{observation.notes}</p>
                {/if}

                <div class="observation-meta flex items-center justify-between">
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    {#if observation.count && observation.count > 1}
                      <span>Count: {observation.count}</span>
                    {/if}
                    {#if observation.confidence}
                      <span>Confidence: {observation.confidence}/5</span>
                    {/if}
                    {#if observation.weather_conditions}
                      <span>{observation.weather_conditions}</span>
                    {/if}
                  </div>
                  
                  <button 
                    on:click={() => goToObservationDetail(observation.id)}
                    class="btn btn-outline btn-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  /* Custom styling for the homepage */
  .hero {
    background: linear-gradient(135deg, var(--color-primary-forest) 0%, var(--color-primary-sky) 100%);
  }

  .stat-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-nature-lg);
  }

  .observation-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .observation-card:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-nature-lg);
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .observation-type-icon {
    transition: background-color 0.2s ease;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .hero h1 {
      font-size: 2.5rem;
    }
    
    .hero p {
      font-size: 1rem;
    }
    
    .controls-bar {
      flex-direction: column;
      gap: 1rem;
    }
    
    .view-modes {
      width: 100%;
    }
  }
</style>