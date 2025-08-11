<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Search, ChevronDown, ChevronUp, X, Sparkles, MapPin, Volume2, Camera, Info, ExternalLink } from 'lucide-svelte';
  import { uiStore } from '$lib/stores';
  import type {
    SpeciesSearchResult,
    Location,
    ObservationType
  } from '$lib/types';

  // Props
  export let selectedSpecies: SpeciesSearchResult | null = null;
  export let location: Location | null = null;
  export let observationType: ObservationType = 'visual';
  export let audioFeatures: number[] | undefined = undefined;
  export let required = true;

  // Component state
  let searchQuery = '';
  let searchResults: SpeciesSearchResult[] = [];
  let isSearching = false;
  let showDropdown = false;
  let isExpanded = false;
  let searchTimeout: NodeJS.Timeout;

  const dispatch = createEventDispatcher<{
    speciesSelected: SpeciesSearchResult;
    speciesCleared: void;
  }>();

  // Mock species data - in a real app, this would come from an API
  const mockSpecies: SpeciesSearchResult[] = [
    {
      id: 'turdus-migratorius',
      common_name: 'American Robin',
      scientific_name: 'Turdus migratorius',
      taxonomy: {
        kingdom: 'Animalia',
        phylum: 'Chordata',
        class: 'Aves',
        order: 'Passeriformes',
        family: 'Turdidae',
        genus: 'Turdus',
        species: 'migratorius'
      },
      conservation_status: 'Least Concern',
      habitat_types: ['urban', 'suburban', 'woodland', 'parks'],
      audio_characteristics: {
        frequency_range: [2000, 4000],
        call_patterns: ['melodic song', 'alarm call'],
        seasonal_activity: ['spring', 'summer', 'fall']
      },
      description: 'A large songbird with a round body, long legs, and fairly long tail.',
      image_url: 'https://example.com/robin.jpg'
    },
    {
      id: 'agalychnis-callidryas',
      common_name: 'Red-eyed Tree Frog',
      scientific_name: 'Agalychnis callidryas',
      taxonomy: {
        kingdom: 'Animalia',
        phylum: 'Chordata',
        class: 'Amphibia',
        order: 'Anura',
        family: 'Phyllomedusidae',
        genus: 'Agalychnis',
        species: 'callidryas'
      },
      conservation_status: 'Least Concern',
      habitat_types: ['rainforest', 'tropical', 'trees'],
      audio_characteristics: {
        frequency_range: [1500, 3000],
        call_patterns: ['chirp', 'trill'],
        seasonal_activity: ['wet season']
      },
      description: 'A vibrant green tree frog with distinctive red eyes.',
      image_url: 'https://example.com/tree-frog.jpg'
    },
    {
      id: 'cardinalis-cardinalis',
      common_name: 'Northern Cardinal',
      scientific_name: 'Cardinalis cardinalis',
      taxonomy: {
        kingdom: 'Animalia',
        phylum: 'Chordata',
        class: 'Aves',
        order: 'Passeriformes',
        family: 'Cardinalidae',
        genus: 'Cardinalis',
        species: 'cardinalis'
      },
      conservation_status: 'Least Concern',
      habitat_types: ['woodland', 'gardens', 'shrubland', 'swamps'],
      audio_characteristics: {
        frequency_range: [2500, 5000],
        call_patterns: ['whistle', 'chip call'],
        seasonal_activity: ['year-round']
      },
      description: 'A mid-sized songbird with a body length of 21–23 cm.',
      image_url: 'https://example.com/cardinal.jpg'
    }
  ];

  // Filter species based on location and observation type
  function getLocationFilteredSpecies(): SpeciesSearchResult[] {
    let filtered = [...mockSpecies];

    // Filter by habitat if location has habitat info
    if (location?.habitat) {
      filtered = filtered.filter(species => 
        species.habitat_types.some(habitat =>
          habitat.toLowerCase().includes(location.habitat?.toLowerCase() || '')
        )
      );
    }

    // Filter by observation type
    if (observationType === 'audio') {
      filtered = filtered.filter(species => species.audio_characteristics);
    }

    return filtered;
  }

  // Get AI-powered suggestions based on audio features
  function getAudioBasedSuggestions(): SpeciesSearchResult[] {
    if (!audioFeatures || observationType !== 'audio') {
      return getLocationFilteredSpecies();
    }

    let suggestions = getLocationFilteredSpecies();
    
    // Simple frequency-based matching
    if (audioFeatures.length > 0) {
      const avgFreq = audioFeatures.reduce((a, b) => a + b, 0) / audioFeatures.length;
      
      // Prioritize species with audio characteristics
      suggestions = suggestions.filter(s => s.audio_characteristics);
      
      // Sort by frequency similarity
      suggestions.sort((a, b) => {
        if (!a.audio_characteristics || !b.audio_characteristics) return 0;
        
        const aMatch = a.audio_characteristics.frequency_range ? 
          Math.abs(avgFreq - (a.audio_characteristics.frequency_range[0] + a.audio_characteristics.frequency_range[1]) / 2) :
          Infinity;
        
        const bMatch = b.audio_characteristics.frequency_range ? 
          Math.abs(avgFreq - (b.audio_characteristics.frequency_range[0] + b.audio_characteristics.frequency_range[1]) / 2) :
          Infinity;
        
        return aMatch - bMatch;
      });
    }

    return suggestions.slice(0, 10); // Limit to top 10 suggestions
  }

  // Search species
  function searchSpecies() {
    if (!searchQuery.trim()) {
      searchResults = getLocationFilteredSpecies().slice(0, 10);
      return;
    }

    isSearching = true;
    
    // Simulate API delay
    setTimeout(() => {
      const query = searchQuery.toLowerCase();
      let results = getLocationFilteredSpecies().filter(species => 
        species.common_name.toLowerCase().includes(query) ||
        species.scientific_name.toLowerCase().includes(query) ||
        species.taxonomy.family.toLowerCase().includes(query)
      );

      // If no results, show all species
      if (results.length === 0 && searchQuery.trim()) {
        results = getLocationFilteredSpecies();
      }

      searchResults = results.slice(0, 20);
      isSearching = false;
      showDropdown = true;
    }, 300);
  }

  // Handle search input with debouncing
  function handleSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchSpecies, 500);
  }

  // Select species
  function selectSpecies(species: SpeciesSearchResult) {
    selectedSpecies = species;
    searchQuery = species.common_name;
    showDropdown = false;
    dispatch('speciesSelected', species);
  }

  // Clear selection
  function clearSelection() {
    selectedSpecies = null;
    searchQuery = '';
    searchResults = [];
    showDropdown = false;
    dispatch('speciesCleared');
  }

  // Get species icon based on taxonomy class
  function getSpeciesIcon(species: SpeciesSearchResult): string {
    const className = species.taxonomy.class?.toLowerCase();
    switch (className) {
      case 'aves': return '🐦';
      case 'mammalia': return '🐾';
      case 'amphibia': return '🐸';
      case 'reptilia': return '🦎';
      case 'insecta': return '🦋';
      case 'arachnida': return '🕷️';
      case 'actinopterygii': return '🐟';
      default: return '🔍';
    }
  }

  // Format frequency range for display
  function formatFrequencyRange(range: [number, number]): string {
    return `${(range[0] / 1000).toFixed(1)}-${(range[1] / 1000).toFixed(1)} kHz`;
  }

  // Get conservation status color
  function getConservationColor(status: string | undefined): string {
    if (!status) return 'text-gray-500';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('extinct')) return 'text-red-800';
    if (statusLower.includes('endangered')) return 'text-red-600';
    if (statusLower.includes('vulnerable')) return 'text-orange-600';
    if (statusLower.includes('threatened')) return 'text-yellow-600';
    if (statusLower.includes('concern')) return 'text-green-600';
    return 'text-gray-600';
  }

  // Initialize with AI suggestions if audio features are available
  $: if (audioFeatures && observationType === 'audio') {
    searchResults = getAudioBasedSuggestions();
    showDropdown = true;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.species-selector')) {
      showDropdown = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="species-selector">
  <!-- Header -->
  <div class="header mb-4">
    <h3 class="text-lg font-semibold text-primary-forest mb-2 flex items-center gap-2">
      <Search class="w-5 h-5" />
      Species Identification {required ? '*' : ''}
    </h3>
    <p class="text-sm text-gray-600">
      Search for species or let AI help identify from your {observationType} observation
    </p>
  </div>

  <!-- AI Suggestions Banner -->
  {#if audioFeatures && observationType === 'audio'}
    <div class="ai-suggestions mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <div class="flex items-center gap-2 mb-2">
        <Sparkles class="w-4 h-4 text-purple-600" />
        <span class="font-medium text-purple-800">AI-Powered Suggestions</span>
      </div>
      <p class="text-sm text-purple-700">
        Based on your audio recording's frequency analysis, we've ranked species by likelihood.
      </p>
    </div>
  {/if}

  <!-- Selected Species Display -->
  {#if selectedSpecies}
    <div class="selected-species mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div class="species-icon text-2xl">
            {getSpeciesIcon(selectedSpecies)}
          </div>
          <div>
            <h4 class="font-semibold text-green-800">{selectedSpecies.common_name}</h4>
            <p class="text-sm italic text-green-700">{selectedSpecies.scientific_name}</p>
            
            <!-- Taxonomy Info -->
            <div class="taxonomy mt-1 text-xs text-green-600">
              <div class="taxonomy-line">
                <span class="font-medium">Class:</span> {selectedSpecies.taxonomy.class}
                <span class="ml-4 font-medium">Order:</span> {selectedSpecies.taxonomy.order}
              </div>
              <div class="taxonomy-line">
                <span class="font-medium">Family:</span> {selectedSpecies.taxonomy.family}
              </div>
            </div>

            <!-- Audio Characteristics for Audio Observations -->
            {#if selectedSpecies.audio_characteristics && (observationType === 'audio' || observationType === 'multi-modal')}
              <div class="audio-info mt-2 p-2 bg-white rounded border text-xs">
                <div class="flex items-center gap-1 mb-1">
                  <Volume2 class="w-3 h-3 text-blue-600" />
                  <span class="font-medium text-blue-800">Audio Profile</span>
                </div>
                <div class="space-y-1 text-gray-600">
                  <div>Frequency: {formatFrequencyRange(selectedSpecies.audio_characteristics.frequency_range)}</div>
                  <div>Patterns: {selectedSpecies.audio_characteristics.call_patterns.join(', ')}</div>
                </div>
              </div>
            {/if}
          </div>
        </div>
        
        <button
          on:click={clearSelection}
          class="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
          aria-label="Clear selection"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  {/if}

  <!-- Search Input -->
  <div class="search-input-container relative">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        on:input={handleSearchInput}
        on:focus={() => { showDropdown = true; if (!searchQuery) searchSpecies(); }}
        placeholder="Search by common name, scientific name, or family..."
        class="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
      />
      
      <!-- Clear search button -->
      {#if searchQuery}
        <button
          on:click={() => { searchQuery = ''; searchResults = []; }}
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X class="w-4 h-4 text-gray-400 hover:text-gray-600" />
        </button>
      {/if}
    </div>

    <!-- Dropdown Results -->
    {#if showDropdown && (searchResults.length > 0 || isSearching)}
      <div class="search-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        {#if isSearching}
          <div class="p-4 text-center">
            <div class="animate-spin w-5 h-5 border-2 border-primary-forest border-t-transparent rounded-full mx-auto mb-2"></div>
            <p class="text-sm text-gray-600">Searching species...</p>
          </div>
        {:else if searchResults.length === 0}
          <div class="p-4 text-center text-gray-500">
            <p>No species found. Try a different search term.</p>
          </div>
        {:else}
          {#each searchResults as species, index}
            <button
              type="button"
              on:click={() => selectSpecies(species)}
              class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
            >
              <div class="flex items-start gap-3">
                <div class="species-icon text-xl flex-shrink-0 mt-1">
                  {getSpeciesIcon(species)}
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-medium text-gray-900">{species.common_name}</h4>
                      <p class="text-sm italic text-gray-600">{species.scientific_name}</p>
                      
                      <!-- Taxonomy info -->
                      <div class="taxonomy-info">
                        {species.taxonomy.class} • {species.taxonomy.family}
                      </div>
                    </div>
                    
                    <!-- AI match indicator -->
                    {#if audioFeatures && observationType === 'audio' && index < 3}
                      <div class="ai-match flex items-center gap-1 text-purple-600">
                        <Sparkles class="w-3 h-3" />
                        <span class="text-xs">AI Match #{index + 1}</span>
                      </div>
                    {/if}
                  </div>

                  <!-- Audio characteristics for audio observations -->
                  {#if species.audio_characteristics && (observationType === 'audio' || observationType === 'multi-modal')}
                    <div class="audio-match flex items-center gap-1 text-blue-600">
                      <Volume2 class="w-3 h-3" />
                      {formatFrequencyRange(species.audio_characteristics.frequency_range)}
                    </div>
                  {/if}

                  <!-- Habitat info -->
                  <div class="habitat-info flex items-center gap-1 text-green-600 mt-1">
                    <MapPin class="w-3 h-3" />
                    <span class="text-xs">
                      {species.habitat_types.slice(0, 3).join(', ')}
                      {#if species.habitat_types.length > 3}
                        +{species.habitat_types.length - 3} more
                      {/if}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Additional metadata -->
              <div class="meta-info mt-2 text-xs text-gray-500">
                <span class="conservation-status {getConservationColor(species.conservation_status || 'unknown')}">
                  {species.conservation_status}
                </span>
              </div>
            </button>
          {/each}

          <!-- Show more toggle -->
          {#if searchResults.length >= 10}
            <button
              type="button"
              on:click={() => isExpanded = !isExpanded}
              class="w-full p-3 text-center text-sm text-primary-forest hover:bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2"
            >
              {#if isExpanded}
                <ChevronUp class="w-4 h-4" />
                Show Less
              {:else}
                <ChevronDown class="w-4 h-4" />
                Show More Results
              {/if}
            </button>
          {/if}
        {/if}
      </div>
    {/if}
  </div>

  <!-- Help Text -->
  <div class="help-text mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 class="font-medium text-blue-800 mb-2 flex items-center gap-2">
      <Info class="w-4 h-4" />
      Species Identification Tips
    </h4>
    <ul class="text-sm text-blue-700 space-y-1">
      <li>• Start typing the common name (e.g., "Robin", "Cardinal")</li>
      <li>• Use scientific names for more precise matches</li>
      <li>• Family names work too (e.g., "Turdidae" for thrushes)</li>
      {#if observationType === 'audio'}
        <li>• AI suggestions are based on your audio's frequency profile</li>
      {/if}
    </ul>
  </div>

  <!-- Validation Error -->
  {#if required && !selectedSpecies}
    <div class="validation-error mt-4 text-red-600 text-sm flex items-center gap-1">
      <Search class="w-4 h-4" />
      Species identification is required
    </div>
  {/if}
</div>

<style>
  .species-selector {
    position: relative;
    width: 100%;
  }

  .search-dropdown {
    max-height: 400px;
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f9fafb;
  }

  .search-dropdown::-webkit-scrollbar {
    width: 6px;
  }

  .search-dropdown::-webkit-scrollbar-track {
    background: #f9fafb;
  }

  .search-dropdown::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 3px;
  }

  .taxonomy-info {
    font-size: 0.75rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .taxonomy-line {
    margin-bottom: 0.125rem;
  }

  .audio-match,
  .habitat-info,
  .ai-match {
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  .conservation-status {
    font-weight: 500;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    background-color: rgba(255, 255, 255, 0.5);
  }

  /* Animation for AI suggestions */
  .ai-suggestions {
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Focus and hover states */
  button:focus {
    outline: 2px solid #065f46;
    outline-offset: 2px;
  }

  .search-dropdown button:hover {
    background-color: #f9fafb;
  }

  .search-dropdown button:focus {
    background-color: #f3f4f6;
    outline: none;
  }

  /* Selected species card styling */
  .selected-species {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .search-dropdown {
      max-height: 300px;
    }
    
    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
</style>
