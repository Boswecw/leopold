<!-- src/routes/+page.svelte - Clean JavaScript version -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { observationsStore, uiStore, authStore } from '$lib/stores';
  import { Plus, Map, List, Filter, Search, TrendingUp, Camera, Mic, MapPin, Calendar, Users } from 'lucide-svelte';

  // Page state - no TypeScript annotations
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

  // Sample data
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
    }
  ];

  onMount(async () => {
    try {
      await loadObservations();
      calculateStats();
    } catch (error) {
      console.error('Error loading observations:', error);
      uiStore.showNotification('error', 'Failed to load observations');
    } finally {
      isLoading = false;
    }
  });

  async function loadObservations() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    observations = sampleObservations;
    observationsStore.set(observations);
  }

  function calculateStats() {
    totalObservations = observations.length;
    const speciesSet = new Set(observations.map(obs => obs.species_name));
    uniqueSpecies = speciesSet.size;
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    thisWeekCount = observations.filter(obs => 
      new Date(obs.created_at) > weekAgo
    ).length;
    
    myObservationsCount = observations.filter(obs => obs.user_id === 'user1').length;
  }

  function handleNewObservation() {
    goto('/observations/new');
  }

  function handleViewModeChange(mode) {
    viewMode = mode;
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      const filtered = sampleObservations.filter(obs => 
        obs.species_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.scientific_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.location.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obs.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      observations = filtered;
    } else {
      observations = sampleObservations;
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  function getObservationTypeIcon(type) {
    switch (type) {
      case 'visual': return Camera;
      case 'audio': return Mic;
      case 'multi-modal': return Camera;
      default: return Camera;
    }
  }

  function getObservationTypeColor(type) {
    switch (type) {
      case 'visual': return 'text-blue-600';
      case 'audio': return 'text-green-600';
      case 'multi-modal': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  }

  // Reactive search
  $: if (searchQuery !== undefined) {
    handleSearch();
  }
</script>

<svelte:head>
  <title>Leopold Nature Observer - Wildlife Observation Platform</title>
  <meta name="description" content="Discover and document wildlife through visual and audio observations." />
</svelte:head>

<div class="home-page">
  <!-- Hero Section -->
  <section class="hero bg-gradient-to-br from-primary-forest to-primary-forest/80 text-white py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          Discover Wildlife
          <span class="block text-green-300">Around You</span>
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-green-100">
          Document, identify, and share your wildlife observations using advanced AI-powered tools
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            on:click={handleNewObservation}
            class="flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-forest font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus class="w-5 h-5" />
            New Observation
          </button>
          <button
            on:click={() => viewMode = 'map'}
            class="flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-forest transition-colors"
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
          <div class="text-3xl font-bold text-primary-forest mb-2">{totalObservations}</div>
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
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
            />
          </div>
        </div>

        <!-- View Mode Toggle -->
        <div class="view-controls flex gap-2">
          <button
            on:click={() => handleViewModeChange('map')}
            class={`p-2 rounded-lg transition-colors ${
              viewMode === 'map' 
                ? 'bg-primary-forest text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Map class="w-5 h-5" />
          </button>
          <button
            on:click={() => handleViewModeChange('list')}
            class={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-primary-forest text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List class="w-5 h-5" />
          </button>
          <button
            on:click={() => handleViewModeChange('grid')}
            class={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-primary-forest text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Loading State -->
      {#if isLoading}
        <div class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-forest mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading observations...</p>
        </div>
      {:else}
        <!-- Observations Content -->
        <div class="observations-content">
          {#if observations.length === 0}
            <div class="text-center py-12">
              <Camera class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 class="text-xl font-semibold text-gray-900 mb-2">No observations found</h3>
              <p class="text-gray-600 mb-4">Start documenting wildlife in your area!</p>
              <button
                on:click={handleNewObservation}
                class="bg-primary-forest text-white px-6 py-2 rounded-lg hover:bg-primary-forest/90 transition-colors"
              >
                Create First Observation
              </button>
            </div>
          {:else}
            <!-- Observation Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each observations as observation}
                <div class="observation-card bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div class="flex items-start justify-between mb-4">
                    <div>
                      <h3 class="font-semibold text-lg text-gray-900">{observation.species_name}</h3>
                      {#if observation.scientific_name}
                        <p class="text-sm text-gray-600 italic">{observation.scientific_name}</p>
                      {/if}
                    </div>
                    <div class="flex items-center gap-2">
                      <div class={`p-1 rounded ${getObservationTypeColor(observation.observation_type)}`}>
                        <svelte:component this={getObservationTypeIcon(observation.observation_type)} class="w-4 h-4" />
                      </div>
                      {#if observation.is_verified}
                        <div class="text-green-600">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        </div>
                      {/if}
                    </div>
                  </div>
                  
                  <div class="space-y-2 text-sm text-gray-600">
                    {#if observation.location.region}
                      <div class="flex items-center gap-1">
                        <MapPin class="w-4 h-4" />
                        {observation.location.region}
                      </div>
                    {/if}
                    
                    {#if observation.notes}
                      <p class="text-gray-700 line-clamp-2">{observation.notes}</p>
                    {/if}
                    
                    <div class="flex items-center justify-between pt-2 border-t">
                      <span>{formatDate(observation.created_at)}</span>
                      {#if observation.count && observation.count > 1}
                        <span class="bg-gray-100 px-2 py-1 rounded text-xs">
                          {observation.count} observed
                        </span>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </main>
</div>