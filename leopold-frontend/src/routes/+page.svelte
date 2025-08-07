<!-- src/routes/+page.svelte - Fixed version -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { observationsStore, uiStore, authStore } from '$lib/stores';
  import { Plus, Map, List, Filter, Search, TrendingUp, Camera, Mic, MapPin, Calendar, Users } from 'lucide-svelte';

  // Page state - removed TypeScript annotations to fix parsing error
  let observations = [];
  let viewMode = 'map';
  let isLoading = true;
  let searchQuery = '';
  let showFilters = false;
  let selectedFilters = {};
  
  // Stats for dashboard
  let totalObservations = 0;
  let uniqueSpecies = 0;
  let thisWeekCount = 0;
  let myObservationsCount = 0;

  // Get current auth state - fixed auth store usage
  let currentUser = null;
  $: currentUser = $authStore?.user || null;
  $: isAuthenticated = $authStore?.isAuthenticated || false;

  // Sample data for development - you can replace with real API data
  const sampleObservations = [
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
        latitude: 39.9042,
        longitude: -75.1642,
        region: 'Philadelphia, PA'
      },
      timestamp: new Date().toISOString(),
      audio_url: 'https://example.com/cardinal-call.mp3',
      notes: 'Clear territorial call heard from oak tree',
      count: 1,
      confidence: 5,
      weather_conditions: 'Clear, 22°C',
      habitat_description: 'Suburban backyard',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false
    }
  ];

  onMount(async () => {
    await loadObservations();
    calculateStats();
  });

  async function loadObservations() {
    isLoading = true;
    try {
      // TODO: Replace with actual API call
      // For now, use sample data
      observations = sampleObservations;
      
      // Update the store - fixed to work with corrected store implementation
      observationsStore.set(observations);
    } catch (error) {
      console.error('Error loading observations:', error);
      uiStore.showNotification('error', 'Failed to load observations');
    } finally {
      isLoading = false;
    }
  }

  function calculateStats() {
    totalObservations = observations.length;
    uniqueSpecies = new Set(observations.map(obs => obs.species_name)).size;
    
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    thisWeekCount = observations.filter(obs => 
      new Date(obs.created_at) > oneWeekAgo
    ).length;
    
    myObservationsCount = currentUser ? 
      observations.filter(obs => obs.user_id === currentUser.id).length : 0;
  }

  function handleViewModeChange(newMode) {
    viewMode = newMode;
  }

  function toggleFilters() {
    showFilters = !showFilters;
  }

  function handleNewObservation() {
    if (isAuthenticated) {
      goto('/observations/new');
    } else {
      goto('/auth/signin?redirect=/observations/new');
    }
  }

  // Filter observations based on search and filters
  $: filteredObservations = observations.filter(observation => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        observation.species_name?.toLowerCase().includes(query) ||
        observation.scientific_name?.toLowerCase().includes(query) ||
        observation.notes?.toLowerCase().includes(query) ||
        observation.location?.region?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Reactive stats updates
  $: {
    calculateStats();
  }
</script>

<svelte:head>
  <title>Leopold - Nature Observer</title>
  <meta name="description" content="Document and share wildlife observations with the Leopold community" />
</svelte:head>

<!-- Hero Section -->
<section class="hero bg-gradient-to-br from-green-600 to-green-800 text-white py-16 md:py-24">
  <div class="container mx-auto px-4 text-center">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-6xl font-bold mb-6">
        Discover Nature.<br />
        <span class="text-green-200">Document Wildlife.</span>
      </h1>
      <p class="text-lg md:text-xl text-green-100 mb-8 max-w-2xl mx-auto">
        Join thousands of nature enthusiasts documenting wildlife observations 
        with photos, audio recordings, and detailed field notes.
      </p>
      
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <button 
          on:click={handleNewObservation}
          class="bg-white text-green-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus class="w-5 h-5" />
          New Observation
        </button>
        <button 
          on:click={() => handleViewModeChange('map')}
          class="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Map class="w-5 h-5" />
          Explore Map
        </button>
      </div>
    </div>
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
        <div class="text-3xl font-bold text-green-600 mb-2">{thisWeekCount}</div>
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
    <div class="controls-bar flex flex-col md:flex-row gap-4 mb-8">
      <!-- Search -->
      <div class="search-section flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search species, locations, or notes..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- View Mode Toggles -->
      <div class="view-modes flex bg-gray-100 rounded-lg p-1">
        <button
          on:click={() => handleViewModeChange('map')}
          class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'map' 
            ? 'bg-white text-green-600 shadow-sm' 
            : 'text-gray-600 hover:text-green-600'}"
        >
          <Map class="w-4 h-4" />
          Map
        </button>
        <button
          on:click={() => handleViewModeChange('list')}
          class="flex items-center gap-2 px-4 py-2 rounded-md transition-colors {viewMode === 'list' 
            ? 'bg-white text-green-600 shadow-sm' 
            : 'text-gray-600 hover:text-green-600'}"
        >
          <List class="w-4 h-4" />
          List
        </button>
      </div>

      <!-- Filters Toggle -->
      <button
        on:click={toggleFilters}
        class="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Filter class="w-4 h-4" />
        Filters
      </button>
    </div>

    <!-- Filters Panel -->
    {#if showFilters}
      <div class="filters-panel mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Observation Type</label>
            <select class="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">All Types</option>
              <option value="visual">Visual</option>
              <option value="audio">Audio</option>
              <option value="multi-modal">Multi-modal</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Species</label>
            <input
              type="text"
              placeholder="Filter by species..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <input
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>
    {/if}

    <!-- Loading State -->
    {#if isLoading}
      <div class="loading-state text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading observations...</p>
      </div>
    
    <!-- Empty State -->
    {:else if filteredObservations.length === 0}
      <div class="empty-state text-center py-12">
        <Search class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-600 mb-2">No observations found</h3>
        <p class="text-gray-500 mb-6">
          {searchQuery ? 'Try adjusting your search terms' : 'Be the first to add an observation!'}
        </p>
        <button 
          on:click={handleNewObservation}
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add First Observation
        </button>
      </div>

    <!-- Map View -->
    {:else if viewMode === 'map'}
      <div class="map-view">
        <!-- Placeholder for map component -->
        <div class="map-container h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
          <div class="text-center">
            <MapPin class="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p class="text-gray-600">Interactive map will load here</p>
            <p class="text-sm text-gray-500">Showing {filteredObservations.length} observations</p>
          </div>
        </div>
        
        <!-- Map overlay with recent observations -->
        <div class="recent-observations">
          <h3 class="text-lg font-semibold mb-4">Recent Observations</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each filteredObservations.slice(0, 6) as observation}
              <div class="observation-card p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between mb-2">
                  <h4 class="font-semibold text-gray-800">{observation.species_name}</h4>
                  <span class="text-xs text-gray-500">
                    {new Date(observation.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-3">{observation.scientific_name}</p>
                
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <div class="flex items-center gap-1">
                    <MapPin class="w-3 h-3" />
                    {observation.location.region}
                  </div>
                  {#if observation.image_urls && observation.image_urls.length > 0}
                    <div class="flex items-center gap-1 text-blue-600">
                      <Camera class="w-3 h-3" />
                      {observation.image_urls.length} photo{observation.image_urls.length !== 1 ? 's' : ''}
                    </div>
                  {/if}
                  {#if observation.audio_url}
                    <div class="flex items-center gap-1 text-green-600">
                      <Mic class="w-3 h-3" />
                      Audio
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

    <!-- List View -->
    {:else if viewMode === 'list'}
      <div class="list-view">
        <div class="observations-list space-y-4">
          {#each filteredObservations as observation}
            <div class="observation-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div class="flex flex-col lg:flex-row lg:items-start gap-4">
                <!-- Main Content -->
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h3 class="text-lg font-semibold text-gray-800">{observation.species_name}</h3>
                      <p class="text-sm text-gray-600 italic">{observation.scientific_name}</p>
                    </div>
                    <span class="text-sm text-gray-500">
                      {new Date(observation.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {#if observation.notes}
                    <p class="text-gray-700 mb-3">{observation.notes}</p>
                  {/if}

                  <!-- Metadata -->
                  <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div class="flex items-center gap-1">
                      <MapPin class="w-4 h-4" />
                      {observation.location.region}
                    </div>
                    {#if observation.count > 1}
                      <div class="flex items-center gap-1">
                        <Users class="w-4 h-4" />
                        {observation.count} individual{observation.count !== 1 ? 's' : ''}
                      </div>
                    {/if}
                    {#if observation.image_urls && observation.image_urls.length > 0}
                      <div class="flex items-center gap-1 text-blue-600">
                        <Camera class="w-4 h-4" />
                        {observation.image_urls.length} photo{observation.image_urls.length !== 1 ? 's' : ''}
                      </div>
                    {/if}
                    {#if observation.audio_url}
                      <div class="flex items-center gap-1 text-green-600">
                        <Mic class="w-4 h-4" />
                        Audio recording
                      </div>
                    {/if}
                    {#if observation.weather_conditions}
                      <div class="text-gray-500">
                        {observation.weather_conditions}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Verification Badge -->
                {#if observation.is_verified}
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</main>

<style>
  .hero {
    background-image: 
      linear-gradient(rgba(22, 101, 52, 0.8), rgba(21, 128, 61, 0.8)),
      url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="forest" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23forest)"/></svg>');
  }
  
  .stat-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .observation-card:hover {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .controls-bar {
      gap: 1rem;
    }
    
    .view-modes {
      order: -1;
      width: 100%;
      justify-content: center;
    }
  }
</style>