<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { MapPin, Navigation, Search, Target, AlertCircle, CheckCircle, X } from 'lucide-svelte';
  import { uiStore } from '$lib/stores';
  import type { Location } from '$lib/types';

  // Props
  export let location: Location | null = null;
  export let required = true;
  export let showMap = true;
  export let placeholder = 'Search for a location...';

  // Component state
  let searchQuery = '';
  let searchResults: any[] = [];
  let isSearching = false;
  let isGettingLocation = false;
  let mapContainer: HTMLDivElement;
  let map: any = null;
  let marker: any = null;
  let searchTimeout: NodeJS.Timeout;

  // Manual coordinates
  let manualLat = '';
  let manualLng = '';
  let showManualEntry = false;

  const dispatch = createEventDispatcher<{
    locationSelected: Location;
    locationCleared: void;
  }>();

  // Initialize map when component mounts
  onMount(async () => {
    if (browser && showMap) {
      await initializeMap();
    }
  });

  onDestroy(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (map) {
      map.remove();
    }
  });

  async function initializeMap() {
    try {
      // Load Leaflet dynamically
      const L = await import('leaflet');
      
      // Initialize map
      map = L.map(mapContainer).setView([39.8283, -98.5795], 4); // Center of US
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Handle map clicks
      map.on('click', (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        selectLocationFromMap(lat, lng);
      });

      // If location exists, show it on map
      if (location) {
        updateMapLocation(location);
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      uiStore.showNotification('error', 'Failed to load map. Please check your internet connection.');
    }
  }

  function selectLocationFromMap(lat: number, lng: number) {
    const newLocation: Location = {
      latitude: lat,
      longitude: lng,
      accuracy: undefined,
      region: 'Selected on map'
    };
    
    updateLocation(newLocation);
    updateMapLocation(newLocation);
  }

  function updateMapLocation(loc: Location) {
    if (!map) return;

    // Remove existing marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Add new marker
    const L = window.L;
    if (L) {
      marker = L.marker([loc.latitude, loc.longitude]).addTo(map);
      map.setView([loc.latitude, loc.longitude], 12);
    }
  }

  function updateLocation(newLocation: Location) {
    location = newLocation;
    dispatch('locationSelected', newLocation);
  }

  // Get current location
  async function getCurrentLocation() {
    if (!browser) return;

    isGettingLocation = true;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const newLocation: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        region: 'Current location'
      };

      updateLocation(newLocation);
      if (map) updateMapLocation(newLocation);
      
      uiStore.showNotification('success', 'Location retrieved successfully');
    } catch (error) {
      console.error('Geolocation error:', error);
      uiStore.showNotification('error', 'Could not get your location. Please search or click on the map.');
    } finally {
      isGettingLocation = false;
    }
  }

  // Search for locations
  async function searchLocations() {
    if (!searchQuery.trim()) {
      searchResults = [];
      return;
    }

    isSearching = true;
    try {
      // Using Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const results = await response.json();
      searchResults = results.map((result: any) => ({
        display_name: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type,
        importance: result.importance
      }));
    } catch (error) {
      console.error('Search error:', error);
      uiStore.showNotification('error', 'Search failed. Please try again.');
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function selectSearchResult(result: any) {
    const newLocation: Location = {
      latitude: result.latitude,
      longitude: result.longitude,
      accuracy: undefined,
      region: result.display_name
    };
    
    updateLocation(newLocation);
    if (map) updateMapLocation(newLocation);
    
    searchQuery = result.display_name;
    searchResults = [];
  }

  // Manual coordinate entry
  function applyManualCoordinates() {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    
    if (isNaN(lat) || isNaN(lng)) {
      uiStore.showNotification('error', 'Please enter valid latitude and longitude values');
      return;
    }
    
    if (lat < -90 || lat > 90) {
      uiStore.showNotification('error', 'Latitude must be between -90 and 90');
      return;
    }
    
    if (lng < -180 || lng > 180) {
      uiStore.showNotification('error', 'Longitude must be between -180 and 180');
      return;
    }

    const newLocation: Location = {
      latitude: lat,
      longitude: lng,
      accuracy: undefined,
      region: 'Manual entry'
    };
    
    updateLocation(newLocation);
    if (map) updateMapLocation(newLocation);
    
    showManualEntry = false;
    manualLat = '';
    manualLng = '';
  }

  function clearLocation() {
    location = null;
    searchQuery = '';
    searchResults = [];
    manualLat = '';
    manualLng = '';
    
    if (marker && map) {
      map.removeLayer(marker);
      marker = null;
    }
    
    dispatch('locationCleared');
  }

  // Debounced search
  function handleSearchInput() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchLocations, 500);
  }

  // Format coordinates for display
  function formatCoordinates(loc: Location): string {
    return `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
  }
</script>

<div class="location-picker">
  <div class="header mb-4">
    <h3 class="text-lg font-semibold text-primary-forest mb-2 flex items-center gap-2">
      <MapPin class="w-5 h-5" />
      Location {required ? '*' : ''}
    </h3>
    <p class="text-sm text-gray-600">
      Search for a location, use your current location, or click on the map
    </p>
  </div>

  <!-- Current location display -->
  {#if location}
    <div class="current-location mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CheckCircle class="w-4 h-4 text-green-600" />
          <div>
            <p class="font-medium text-green-800">{location.region || 'Selected Location'}</p>
            <p class="text-sm text-green-600">{formatCoordinates(location)}</p>
            {#if location.accuracy}
              <p class="text-xs text-green-500">Accuracy: ±{Math.round(location.accuracy)}m</p>
            {/if}
          </div>
        </div>
        <button
          type="button"
          on:click={clearLocation}
          class="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
          aria-label="Clear location"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  {/if}

  <!-- Search input -->
  <div class="search-section mb-4">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search class="w-4 h-4 text-gray-400" />
      </div>
      <input
        type="text"
        bind:value={searchQuery}
        on:input={handleSearchInput}
        placeholder={placeholder}
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-forest focus:border-primary-forest"
      />
    </div>

    <!-- Search results -->
    {#if searchResults.length > 0}
      <div class="search-results mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
        {#each searchResults as result}
          <button
            type="button"
            on:click={() => selectSearchResult(result)}
            class="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
          >
            <div class="flex items-center gap-2">
              <MapPin class="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span class="text-sm text-gray-900 line-clamp-2">{result.display_name}</span>
            </div>
          </button>
        {/each}
      </div>
    {/if}

    {#if isSearching}
      <div class="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <div class="animate-spin w-4 h-4 border-2 border-primary-forest border-t-transparent rounded-full"></div>
        Searching...
      </div>
    {/if}
  </div>

  <!-- Action buttons -->
  <div class="actions mb-4 flex flex-wrap gap-2">
    <button
      type="button"
      on:click={getCurrentLocation}
      disabled={isGettingLocation}
      class="flex items-center gap-2 px-3 py-2 text-sm bg-primary-forest text-white rounded-md hover:bg-primary-forest/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if isGettingLocation}
        <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
      {:else}
        <Navigation class="w-4 h-4" />
      {/if}
      Current Location
    </button>

    <button
      type="button"
      on:click={() => showManualEntry = !showManualEntry}
      class="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
    >
      <Target class="w-4 h-4" />
      Enter Coordinates
    </button>
  </div>

  <!-- Manual coordinate entry -->
  {#if showManualEntry}
    <div class="manual-entry mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Enter Coordinates</h4>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label for="lat" class="block text-xs text-gray-600 mb-1">Latitude</label>
          <input
            id="lat"
            type="number"
            bind:value={manualLat}
            step="any"
            min="-90"
            max="90"
            placeholder="e.g., 40.7128"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest focus:border-primary-forest"
          />
        </div>
        <div>
          <label for="lng" class="block text-xs text-gray-600 mb-1">Longitude</label>
          <input
            id="lng"
            type="number"
            bind:value={manualLng}
            step="any"
            min="-180"
            max="180"
            placeholder="e.g., -74.0060"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest focus:border-primary-forest"
          />
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <button
          type="button"
          on:click={applyManualCoordinates}
          class="px-3 py-1 text-xs bg-primary-forest text-white rounded hover:bg-primary-forest/90"
        >
          Apply
        </button>
        <button
          type="button"
          on:click={() => { showManualEntry = false; manualLat = ''; manualLng = ''; }}
          class="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  {/if}

  <!-- Map container -->
  {#if showMap}
    <div class="map-container mb-4">
      <div bind:this={mapContainer} class="w-full h-64 bg-gray-100 rounded-lg border border-gray-200"></div>
      <p class="text-xs text-gray-500 mt-1">Click on the map to select a location</p>
    </div>
  {/if}

  <!-- Validation error -->
  {#if required && !location}
    <div class="validation-error text-red-600 text-sm flex items-center gap-1">
      <AlertCircle class="w-4 h-4" />
      Location is required
    </div>
  {/if}
</div>

<style>
  .location-picker {
    width: 100%;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Firefox number input styling */
  input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  :global(.leaflet-container) {
    font-family: inherit !important;
  }

  :global(.leaflet-control-zoom a) {
    color: #374151 !important;
  }

  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px !important;
  }
</style>
