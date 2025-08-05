<!-- src/lib/components/SpeciesSelector.svelte -->
<script lang="ts">
    import { createEventDispatcher, tick } from 'svelte';
    import { Search, ChevronDown, ChevronUp, X, Sparkles, MapPin, Volume2, Camera, Info, ExternalLink } from 'lucide-svelte';
    import { uiStore } from '$stores';
    import type { 
      SpeciesSearchResult, 
      ObservationType, 
      Location 
    } from '$lib/types';
  
    const dispatch = createEventDispatcher<{
      speciesSelected: SpeciesSearchResult;
      speciesCleared: void;
      searchRequested: { query: string; filters: any };
    }>();
  
    // Props
    export let observationType: ObservationType = 'visual';
    export let location: Location | null = null;
    export let audioFeatures: number[] | undefined = undefined;
    export let selectedSpecies: SpeciesSearchResult | null = null;
    export let enableAISuggestions = true;
    export let enableLocationFilter = true;
    export let showTaxonomy = true;
    export let maxSuggestions = 8;
  
    // State
    let searchQuery = '';
    let searchResults: SpeciesSearchResult[] = [];
    let aiSuggestions: SpeciesSearchResult[] = [];
    let isSearching = false;
    let isLoadingSuggestions = false;
    let showDropdown = false;
    let searchTimeout: number;
    let searchInput: HTMLInputElement;
  
    // UI state
    let activeTab: 'search' | 'suggestions' | 'recent' = 'suggestions';
    let showAdvanced = false;
    let recentSpecies: SpeciesSearchResult[] = [];
  
    // Advanced filters
    let filters = {
      taxonomy: {
        kingdom: '',
        class: '',
        order: '',
        family: ''
      },
      habitat: '',
      activity: '',
      size: '',
      conservation_status: ''
    };
  
    // Mock data for development (replace with API calls)
    const mockSpeciesData: SpeciesSearchResult[] = [
      {
        id: '1',
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
        habitat_types: ['suburban', 'parks', 'forests'],
        audio_characteristics: {
          frequency_range: [2000, 8000],
          call_patterns: ['melodic song', 'alarm call'],
          seasonal_activity: ['spring', 'summer', 'fall']
        },
        image_url: 'https://example.com/robin.jpg',
        conservation_status: 'Least Concern'
      },
      {
        id: '2',
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
        habitat_types: ['rainforest', 'wetland'],
        audio_characteristics: {
          frequency_range: [1000, 3000],
          call_patterns: ['chirp', 'trill'],
          seasonal_activity: ['wet season']
        },
        conservation_status: 'Least Concern'
      },
      {
        id: '3',
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
        habitat_types: ['woodland', 'suburban', 'parks'],
        audio_characteristics: {
          frequency_range: [1500, 6000],
          call_patterns: ['whistle', 'chip call'],
          seasonal_activity: ['year-round']
        },
        conservation_status: 'Least Concern'
      }
    ];
  
    // Reactive statements
    $: if (searchQuery.length > 2) {
      handleSearch();
    } else if (searchQuery.length === 0) {
      searchResults = [];
    }
  
    $: if (location && enableAISuggestions && !isLoadingSuggestions) {
      loadAISuggestions();
    }
  
    $: filteredSuggestions = aiSuggestions.filter(species => {
      if (!enableLocationFilter || !location) return true;
      
      // Simple habitat-based filtering (in real app, this would be more sophisticated)
      if (location.habitat) {
        return species.habitat_types.some(habitat => 
          habitat.toLowerCase().includes(location.habitat.toLowerCase())
        );
      }
      
      return true;
    });
  
    async function handleSearch() {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
  
      searchTimeout = window.setTimeout(async () => {
        if (!searchQuery.trim()) return;
  
        isSearching = true;
        showDropdown = true;
        activeTab = 'search';
  
        try {
          // Simulate API call with mock data
          await new Promise(resolve => setTimeout(resolve, 300));
          
          searchResults = mockSpeciesData.filter(species =>
            species.common_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            species.scientific_name.toLowerCase().includes(searchQuery.toLowerCase())
          );
  
          dispatch('searchRequested', { 
            query: searchQuery, 
            filters: { 
              location, 
              observationType,
              ...filters
            }
          });
  
        } catch (error) {
          console.error('Species search failed:', error);
          uiStore.showNotification('error', 'Species search failed. Please try again.');
          searchResults = [];
        } finally {
          isSearching = false;
        }
      }, 300);
    }
  
    async function loadAISuggestions() {
      if (!enableAISuggestions) return;
  
      isLoadingSuggestions = true;
  
      try {
        // Simulate AI-powered suggestions based on location and observation type
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock AI suggestions based on observation type
        let suggestions = [...mockSpeciesData];
        
        if (observationType === 'audio') {
          // Prioritize species with audio characteristics
          suggestions = suggestions.filter(s => s.audio_characteristics);
          
          // If we have audio features, try to match frequency ranges
          if (audioFeatures && audioFeatures.length > 0) {
            suggestions = suggestions.sort((a, b) => {
              const avgFreq = audioFeatures.reduce((sum, f) => sum + f, 0) / audioFeatures.length;
              
              const aMatch = a.audio_characteristics?.frequency_range ? 
                Math.abs(avgFreq - (a.audio_characteristics.frequency_range[0] + a.audio_characteristics.frequency_range[1]) / 2) : 
                Infinity;
              
              const bMatch = b.audio_characteristics?.frequency_range ? 
                Math.abs(avgFreq - (b.audio_characteristics.frequency_range[0] + b.audio_characteristics.frequency_range[1]) / 2) : 
                Infinity;
              
              return aMatch - bMatch;
            });
          }
        }
  
        // Limit to maxSuggestions
        aiSuggestions = suggestions.slice(0, maxSuggestions);
  
      } catch (error) {
        console.error('Failed to load AI suggestions:', error);
        aiSuggestions = [];
      } finally {
        isLoadingSuggestions = false;
      }
    }
  
    function selectSpecies(species: SpeciesSearchResult) {
      selectedSpecies = species;
      searchQuery = species.common_name;
      showDropdown = false;
      
      // Add to recent species
      recentSpecies = [species, ...recentSpecies.filter(s => s.id !== species.id)].slice(0, 5);
      
      dispatch('speciesSelected', species);
      uiStore.showNotification('success', `Selected: ${species.common_name}`);
    }
  
    function clearSelection() {
      selectedSpecies = null;
      searchQuery = '';
      searchResults = [];
      showDropdown = false;
      
      dispatch('speciesCleared');
    }
  
    function handleInputFocus() {
      showDropdown = true;
      if (aiSuggestions.length > 0) {
        activeTab = 'suggestions';
      } else if (recentSpecies.length > 0) {
        activeTab = 'recent';
      }
    }
  
    function handleInputBlur() {
      // Delay hiding dropdown to allow for clicks
      setTimeout(() => {
        showDropdown = false;
      }, 200);
    }
  
    function switchTab(tab: typeof activeTab) {
      activeTab = tab;
      if (tab === 'suggestions' && aiSuggestions.length === 0) {
        loadAISuggestions();
      }
    }
  
    function getSpeciesIcon(species: SpeciesSearchResult): string {
      const className = species.taxonomy.class?.toLowerCase();
      switch (className) {
        case 'aves': return '🐦';
        case 'mammalia': return '🐾';
        case 'amphibia': return '🐸';
        case 'reptilia': return '🦎';
        case 'insecta': return '🦋';
        case 'arachnida': return '🕷️';
        default: return '🌿';
      }
    }
  
    function getConservationColor(status: string): string {
      switch (status.toLowerCase()) {
        case 'least concern': return 'text-green-600';
        case 'near threatened': return 'text-yellow-600';
        case 'vulnerable': return 'text-orange-600';
        case 'endangered': return 'text-red-600';
        case 'critically endangered': return 'text-red-800';
        default: return 'text-gray-600';
      }
    }
  
    function formatFrequencyRange(range: [number, number]): string {
      return `${range[0]}-${range[1]} Hz`;
    }
  </script>
  
  <!-- Species Selector Component -->
  <div class="species-selector relative">
    <!-- Main Search Input -->
    <div class="search-container relative">
      <div class="input-wrapper relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          bind:this={searchInput}
          type="text"
          bind:value={searchQuery}
          on:focus={handleInputFocus}
          on:blur={handleInputBlur}
          placeholder="Search for species (e.g., American Robin, oak tree)..."
          class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm {selectedSpecies ? 'bg-green-50 border-green-300' : ''}"
        />
        
        {#if selectedSpecies}
          <button
            type="button"
            on:click={clearSelection}
            class="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Clear selection"
          >
            <X class="w-4 h-4" />
          </button>
        {:else if isSearching || isLoadingSuggestions}
          <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div class="spinner w-5 h-5 border-2 border-gray-300 border-t-primary-forest rounded-full animate-spin"></div>
          </div>
        {/if}
      </div>
  
      <!-- Current Selection Display -->
      {#if selectedSpecies}
        <div class="selection-display mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-start gap-3">
            <div class="species-icon text-2xl">
              {getSpeciesIcon(selectedSpecies)}
            </div>
            
            <div class="species-info flex-1">
              <h4 class="font-semibold text-primary-forest">
                {selectedSpecies.common_name}
              </h4>
              <p class="text-sm italic text-gray-600 mb-2">
                {selectedSpecies.scientific_name}
              </p>
              
              {#if showTaxonomy}
                <div class="taxonomy text-xs text-gray-500 space-y-1">
                  <div class="taxonomy-line">
                    <span class="font-medium">Class:</span> {selectedSpecies.taxonomy.class}
                    <span class="ml-4 font-medium">Order:</span> {selectedSpecies.taxonomy.order}
                  </div>
                  <div class="taxonomy-line">
                    <span class="font-medium">Family:</span> {selectedSpecies.taxonomy.family}
                  </div>
                </div>
              {/if}
  
              {#if selectedSpecies.conservation_status}
                <div class="conservation-status mt-2">
                  <span class="text-xs font-medium {getConservationColor(selectedSpecies.conservation_status)}">
                    Conservation: {selectedSpecies.conservation_status}
                  </span>
                </div>
              {/if}
  
              {#if selectedSpecies.audio_characteristics && (observationType === 'audio' || observationType === 'multi-modal')}
                <div class="audio-info mt-2 p-2 bg-white rounded border text-xs">
                  <div class="flex items-center gap-1 mb-1">
                    <Volume2 class="w-3 h-3" />
                    <span class="font-medium">Audio Characteristics:</span>
                  </div>
                  <div class="space-y-1 text-gray-600">
                    <div>Frequency: {formatFrequencyRange(selectedSpecies.audio_characteristics.frequency_range)}</div>
                    <div>Patterns: {selectedSpecies.audio_characteristics.call_patterns.join(', ')}</div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  
    <!-- Dropdown Results -->
    {#if showDropdown && !selectedSpecies}
      <div class="dropdown absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
        <!-- Tab Navigation -->
        <div class="tabs flex border-b border-gray-200">
          <button
            type="button"
            on:click={() => switchTab('suggestions')}
            class="tab-btn flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'suggestions' ? 'border-primary-forest text-primary-forest bg-primary-forest/5' : 'border-transparent text-gray-600 hover:text-primary-forest'}"
          >
            <div class="flex items-center justify-center gap-2">
              <Sparkles class="w-4 h-4" />
              AI Suggestions
              {#if isLoadingSuggestions}
                <div class="spinner w-3 h-3 border border-gray-300 border-t-primary-forest rounded-full animate-spin"></div>
              {/if}
            </div>
          </button>
          
          <button
            type="button"
            on:click={() => switchTab('search')}
            class="tab-btn flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'search' ? 'border-primary-forest text-primary-forest bg-primary-forest/5' : 'border-transparent text-gray-600 hover:text-primary-forest'}"
          >
            <div class="flex items-center justify-center gap-2">
              <Search class="w-4 h-4" />
              Search Results
            </div>
          </button>
          
          {#if recentSpecies.length > 0}
            <button
              type="button"
              on:click={() => switchTab('recent')}
              class="tab-btn flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'recent' ? 'border-primary-forest text-primary-forest bg-primary-forest/5' : 'border-transparent text-gray-600 hover:text-primary-forest'}"
            >
              Recent
            </button>
          {/if}
        </div>
  
        <!-- Results Content -->
        <div class="results-content overflow-y-auto max-h-72">
          {#if activeTab === 'suggestions'}
            <div class="suggestions-tab">
              {#if isLoadingSuggestions}
                <div class="loading-state p-6 text-center">
                  <div class="spinner w-8 h-8 border-4 border-gray-300 border-t-primary-forest rounded-full animate-spin mx-auto mb-3"></div>
                  <p class="text-sm text-gray-600">Loading AI suggestions...</p>
                  <p class="text-xs text-gray-500 mt-1">
                    Based on {observationType} observation
                    {#if location}and location{/if}
                  </p>
                </div>
              {:else if filteredSuggestions.length > 0}
                <div class="suggestions-header p-3 bg-primary-forest/5 border-b border-gray-100">
                  <div class="flex items-center gap-2 text-sm">
                    <Sparkles class="w-4 h-4 text-primary-forest" />
                    <span class="font-medium text-primary-forest">
                      AI-powered suggestions for {observationType} observations
                    </span>
                    {#if location}
                      <MapPin class="w-3 h-3 text-gray-500" />
                    {/if}
                  </div>
                </div>
                
                {#each filteredSuggestions as species (species.id)}
                  <button
                    type="button"
                    on:click={() => selectSpecies(species)}
                    class="species-result w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div class="flex items-start gap-3">
                      <div class="species-icon text-xl">
                        {getSpeciesIcon(species)}
                      </div>
                      
                      <div class="species-details flex-1">
                        <div class="names">
                          <h5 class="font-medium text-gray-900">{species.common_name}</h5>
                          <p class="text-sm italic text-gray-600">{species.scientific_name}</p>
                        </div>
                        
                        <div class="meta-info mt-2 text-xs text-gray-500 space-y-1">
                          <div class="taxonomy-info">
                            {species.taxonomy.class} • {species.taxonomy.family}
                          </div>
                          
                          {#if species.habitat_types.length > 0}
                            <div class="habitat-info">
                              Habitats: {species.habitat_types.slice(0, 3).join(', ')}
                            </div>
                          {/if}
                          
                          {#if species.audio_characteristics && (observationType === 'audio' || observationType === 'multi-modal')}
                            <div class="audio-match flex items-center gap-1 text-blue-600">
                              <Volume2 class="w-3 h-3" />
                              {formatFrequencyRange(species.audio_characteristics.frequency_range)}
                            </div>
                          {/if}
                        </div>
                      </div>
                      
                      <div class="confidence-indicator">
                        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </button>
                {/each}
              {:else}
                <div class="empty-state p-6 text-center text-gray-500">
                  <Sparkles class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p class="text-sm">No AI suggestions available.</p>
                  <p class="text-xs mt-1">Try providing location information or search manually.</p>
                </div>
              {/if}
            </div>
          
          {:else if activeTab === 'search'}
            <div class="search-tab">
              {#if isSearching}
                <div class="loading-state p-6 text-center">
                  <div class="spinner w-8 h-8 border-4 border-gray-300 border-t-primary-forest rounded-full animate-spin mx-auto mb-3"></div>
                  <p class="text-sm text-gray-600">Searching species...</p>
                </div>
              {:else if searchResults.length > 0}
                {#each searchResults as species (species.id)}
                  <button
                    type="button"
                    on:click={() => selectSpecies(species)}
                    class="species-result w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div class="flex items-start gap-3">
                      <div class="species-icon text-xl">
                        {getSpeciesIcon(species)}
                      </div>
                      
                      <div class="species-details flex-1">
                        <div class="names">
                          <h5 class="font-medium text-gray-900">{species.common_name}</h5>
                          <p class="text-sm italic text-gray-600">{species.scientific_name}</p>
                        </div>
                        
                        <div class="meta-info mt-2 text-xs text-gray-500">
                          <span class="conservation-status {getConservationColor(species.conservation_status)}">
                            {species.conservation_status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                {/each}
              {:else if searchQuery.length > 0}
                <div class="empty-state p-6 text-center text-gray-500">
                  <Search class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p class="text-sm">No species found for "{searchQuery}"</p>
                  <p class="text-xs mt-1">Try different search terms or check spelling.</p>
                </div>
              {:else}
                <div class="search-prompt p-6 text-center text-gray-500">
                  <Search class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p class="text-sm">Start typing to search for species</p>
                  <p class="text-xs mt-1">Common names or scientific names work</p>
                </div>
              {/if}
            </div>
          
          {:else if activeTab === 'recent' && recentSpecies.length > 0}
            <div class="recent-tab">
              {#each recentSpecies as species (species.id)}
                <button
                  type="button"
                  on:click={() => selectSpecies(species)}
                  class="species-result w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <div class="species-icon text-lg">
                      {getSpeciesIcon(species)}
                    </div>
                    <div class="species-details flex-1">
                      <h5 class="font-medium text-gray-900">{species.common_name}</h5>
                      <p class="text-sm italic text-gray-600">{species.scientific_name}</p>
                    </div>
                  </div>
                </button>
              {/each}
            </div>
          {/if}
        </div>
  
        <!-- Advanced Filters Toggle -->
        <div class="dropdown-footer border-t border-gray-100 p-3">
          <button
            type="button"
            on:click={() => showAdvanced = !showAdvanced}
            class="advanced-toggle flex items-center gap-2 text-sm text-gray-600 hover:text-primary-forest transition-colors"
          >
            <Info class="w-4 h-4" />
            Advanced Filters
            {#if showAdvanced}
              <ChevronUp class="w-4 h-4" />
            {:else}
              <ChevronDown class="w-4 h-4" />
            {/if}
          </button>
        </div>
      </div>
    {/if}
  
    <!-- Advanced Filters Panel -->
    {#if showAdvanced && showDropdown}
      <div class="advanced-filters absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
        <h4 class="font-medium text-primary-forest mb-3">Advanced Search Filters</h4>
        
        <div class="filters-grid grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-gray-600 mb-1">Habitat Type</label>
            <select bind:value={filters.habitat} class="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest">
              <option value="">Any habitat</option>
              <option value="forest">Forest</option>
              <option value="wetland">Wetland</option>
              <option value="grassland">Grassland</option>
              <option value="urban">Urban</option>
              <option value="coastal">Coastal</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Taxonomic Class</label>
            <select bind:value={filters.taxonomy.class} class="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest">
              <option value="">Any class</option>
              <option value="Aves">Birds (Aves)</option>
              <option value="Mammalia">Mammals</option>
              <option value="Amphibia">Amphibians</option>
              <option value="Reptilia">Reptiles</option>
              <option value="Insecta">Insects</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Conservation Status</label>
            <select bind:value={filters.conservation_status} class="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest">
              <option value="">Any status</option>
              <option value="Least Concern">Least Concern</option>
              <option value="Near Threatened">Near Threatened</option>
              <option value="Vulnerable">Vulnerable</option>
              <option value="Endangered">Endangered</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm text-gray-600 mb-1">Activity</label>
            <select bind:value={filters.activity} class="w-full text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest">
              <option value="">Any time</option>
              <option value="diurnal">Daytime (Diurnal)</option>
              <option value="nocturnal">Nighttime (Nocturnal)</option>
              <option value="crepuscular">Dawn/Dusk (Crepuscular)</option>
            </select>
          </div>
        </div>
      </div>
    {/if}
  
    <!-- Help Text -->
    {#if !selectedSpecies && !showDropdown}
      <div class="help-text mt-3 text-xs text-gray-500">
        {#if enableAISuggestions}
          <p class="flex items-center gap-1">
            <Sparkles class="w-3 h-3" />
            AI suggestions will appear based on your observation type and location
          </p>
        {/if}
        <p class="mt-1">
          You can search by common name (e.g., "Robin") or scientific name (e.g., "Turdus migratorius")
        </p>
      </div>
    {/if}
  </div>
  
  <style>
    /* Custom dropdown styling */
    .dropdown {
      backdrop-filter: blur(4px);
    }
  
    .tab-btn:focus {
      outline: 2px solid #2F5D50;
      outline-offset: -2px;
    }
  
    .species-result:focus {
      outline: 2px solid #2F5D50;
      outline-offset: -2px;
      background-color: #f9fafb;
    }
  
    /* Search input enhancements */
    .input-wrapper:focus-within {
      box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1);
    }
  
    /* Confidence indicator animation */
    .confidence-indicator .bg-green-500 {
      animation: pulse 2s infinite;
    }
  
    /* Responsive adjustments */
    @media (max-width: 640px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .tabs {
        flex-wrap: wrap;
      }
      
      .tab-btn {
        min-width: 0;
        flex: 1 1 auto;
      }
    }
  
    /* High contrast support */
    @media (prefers-contrast: high) {
      .dropdown,
      .advanced-filters,
      .selection-display {
        border-width: 2px;
      }
      
      .species-result:hover,
      .species-result:focus {
        background-color: #000;
        color: #fff;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .tab-btn,
      .species-result,
      .confidence-indicator .bg-green-500 {
        transition: none;
        animation: none;
      }
    }
  </style>