<!-- src/lib/components/LocationPicker.svelte -->
<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    import { MapPin, Navigation, Search, Target, AlertCircle, CheckCircle } from 'lucide-svelte';
    import { uiStore } from '$stores';
    import type { Location } from '$lib/types';
  
    const dispatch = createEventDispatcher<{
      locationSelected: Location;
      locationChanged: Location;
      error: { message: string; code?: string };
    }>();
  
    // Props
    export let initialLocation: Location | null = null;
    export let enableGPS = true;
    export let enableSearch = true;
    export let showMap = true;
    export let allowManualInput = true;
    export let requireAccuracy = false;
    export let maxAccuracy = 100; // meters
    export let autoDetect = false;
  
    // Map library (dynamic import to avoid SSR issues)
    let L: any;
  
    // State
    let currentLocation: Location | null = initialLocation;
    let map: any;
    let mapContainer: HTMLDivElement;
    let locationMarker: any;
    let isDetecting = false;
    let hasPermission = false;
    let permissionStatus = 'prompt'; // 'granted', 'denied', 'prompt'
    let accuracy: number | null = null;
    let locationSource: 'gps' | 'search' | 'manual' | 'map' | null = null;
  
    // Search
    let searchQuery = '';
    let searchResults: any[] = [];
    let isSearching = false;
    
    // Manual input
    let manualLat = '';
    let manualLng = '';
  
    // Reactive statements
    $: if (currentLocation && map) {
      updateMapLocation(currentLocation);
    }
  
    $: locationAccuracy = accuracy ? getAccuracyDescription(accuracy) : null;
  
    $: isLocationValid = currentLocation && 
      (!requireAccuracy || !accuracy || accuracy <= maxAccuracy);
  
    onMount(async () => {
      if (!browser) return;
  
      // Initialize map if enabled
      if (showMap) {
        await initializeMap();
      }
  
      // Check geolocation permission status
      if (enableGPS && 'navigator' in window && 'geolocation' in navigator) {
        checkGeolocationPermission();
      }
  
      // Auto-detect location if requested
      if (autoDetect && enableGPS) {
        detectCurrentLocation();
      }
    });
  
    onDestroy(() => {
      if (map) {
        map.remove();
      }
    });
  
    async function initializeMap() {
      try {
        // Dynamic import of Leaflet
        const leafletModule = await import('leaflet');
        L = leafletModule.default;
  
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
  
        // Initialize map
        const initialCenter = currentLocation ? 
          [currentLocation.latitude, currentLocation.longitude] : 
          [39.8283, -98.5795]; // Center of US
  
        map = L.map(mapContainer, {
          center: initialCenter,
          zoom: currentLocation ? 15 : 4,
          zoomControl: true
        });
  
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(map);
  
        // Add click handler for map selection
        map.on('click', handleMapClick);
  
        // Add initial marker if location exists
        if (currentLocation) {
          updateMapLocation(currentLocation);
        }
  
      } catch (error) {
        console.error('Failed to initialize map:', error);
        dispatch('error', {
          message: 'Failed to load map. Please try refreshing the page.',
          code: 'MAP_INIT_FAILED'
        });
      }
    }
  
    function handleMapClick(e: any) {
      const { lat, lng } = e.latlng;
      
      const newLocation: Location = {
        latitude: lat,
        longitude: lng,
        accuracy: null,
        region: 'Selected on map'
      };
  
      setLocation(newLocation, 'map');
    }
  
    function updateMapLocation(location: Location) {
      if (!map || !L) return;
  
      // Remove existing marker
      if (locationMarker) {
        map.removeLayer(locationMarker);
      }
  
      // Add new marker
      locationMarker = L.marker([location.latitude, location.longitude], {
        draggable: true
      }).addTo(map);
  
      // Handle marker drag
      locationMarker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        const updatedLocation: Location = {
          ...location,
          latitude: lat,
          longitude: lng
        };
        setLocation(updatedLocation, 'map');
      });
  
      // Center map on location
      map.setView([location.latitude, location.longitude], Math.max(map.getZoom(), 15));
  
      // Add accuracy circle if available
      if (location.accuracy && location.accuracy > 0) {
        L.circle([location.latitude, location.longitude], {
          radius: location.accuracy,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.1,
          weight: 2
        }).addTo(map);
      }
    }
  
    async function checkGeolocationPermission() {
      if (!('permissions' in navigator)) return;
  
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        permissionStatus = permission.state;
        hasPermission = permission.state === 'granted';
  
        permission.addEventListener('change', () => {
          permissionStatus = permission.state;
          hasPermission = permission.state === 'granted';
        });
      } catch (error) {
        console.warn('Permission API not available');
      }
    }
  
    async function detectCurrentLocation() {
      if (!enableGPS || !navigator.geolocation) {
        dispatch('error', {
          message: 'Geolocation is not supported by this browser',
          code: 'GEOLOCATION_NOT_SUPPORTED'
        });
        return;
      }
  
      isDetecting = true;
  
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      };
  
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
  
        const detectedLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          region: 'Current location'
        };
  
        accuracy = position.coords.accuracy;
        
        // Check accuracy requirement
        if (requireAccuracy && accuracy > maxAccuracy) {
          dispatch('error', {
            message: `Location accuracy (${accuracy.toFixed(0)}m) exceeds maximum allowed (${maxAccuracy}m). Please try again in a location with better GPS signal.`,
            code: 'ACCURACY_TOO_LOW'
          });
        } else {
          setLocation(detectedLocation, 'gps');
          uiStore.showNotification('success', 'Current location detected');
        }
  
      } catch (error: any) {
        handleGeolocationError(error);
      } finally {
        isDetecting = false;
      }
    }
  
    function handleGeolocationError(error: GeolocationPositionError) {
      let message = 'Failed to detect location';
      let code = 'GEOLOCATION_FAILED';
  
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied. Please enable location services and try again.';
          code = 'PERMISSION_DENIED';
          permissionStatus = 'denied';
          hasPermission = false;
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information unavailable. Please try again or enter location manually.';
          code = 'POSITION_UNAVAILABLE';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out. Please try again or enter location manually.';
          code = 'TIMEOUT';
          break;
      }
  
      dispatch('error', { message, code });
      uiStore.showNotification('error', message);
    }
  
    async function searchLocation() {
      if (!searchQuery.trim() || !enableSearch) return;
  
      isSearching = true;
      searchResults = [];
  
      try {
        // Using Nominatim API for geocoding (free OpenStreetMap service)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&extratags=1`
        );
  
        if (!response.ok) {
          throw new Error('Search service unavailable');
        }
  
        const results = await response.json();
        
        searchResults = results.map((result: any) => ({
          id: result.place_id,
          display_name: result.display_name,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          type: result.type,
          importance: result.importance || 0
        }));
  
        if (searchResults.length === 0) {
          uiStore.showNotification('info', 'No locations found. Try a different search term.');
        }
  
      } catch (error) {
        console.error('Location search failed:', error);
        dispatch('error', {
          message: 'Location search failed. Please try again or enter coordinates manually.',
          code: 'SEARCH_FAILED'
        });
      } finally {
        isSearching = false;
      }
    }
  
    function selectSearchResult(result: any) {
      const searchLocation: Location = {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: null,
        region: result.display_name
      };
  
      setLocation(searchLocation, 'search');
      searchQuery = result.display_name;
      searchResults = [];
      uiStore.showNotification('success', 'Location selected from search');
    }
  
    function setManualLocation() {
      const lat = parseFloat(manualLat);
      const lng = parseFloat(manualLng);
  
      if (isNaN(lat) || isNaN(lng)) {
        dispatch('error', {
          message: 'Please enter valid latitude and longitude coordinates',
          code: 'INVALID_COORDINATES'
        });
        return;
      }
  
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        dispatch('error', {
          message: 'Coordinates out of range. Latitude: -90 to 90, Longitude: -180 to 180',
          code: 'COORDINATES_OUT_OF_RANGE'
        });
        return;
      }
  
      const manualLocation: Location = {
        latitude: lat,
        longitude: lng,
        accuracy: null,
        region: 'Manual entry'
      };
  
      setLocation(manualLocation, 'manual');
      uiStore.showNotification('success', 'Location set manually');
    }
  
    function setLocation(location: Location, source: typeof locationSource) {
      currentLocation = location;
      locationSource = source;
      
      dispatch('locationSelected', location);
      dispatch('locationChanged', location);
    }
  
    function clearLocation() {
      currentLocation = null;
      locationSource = null;
      accuracy = null;
      searchQuery = '';
      searchResults = [];
      manualLat = '';
      manualLng = '';
  
      if (locationMarker && map) {
        map.removeLayer(locationMarker);
        locationMarker = null;
      }
  
      dispatch('locationSelected', null as any);
    }
  
    function getAccuracyDescription(acc: number): string {
      if (acc <= 5) return 'Excellent';
      if (acc <= 10) return 'Very Good';
      if (acc <= 25) return 'Good';
      if (acc <= 100) return 'Fair';
      return 'Poor';
    }
  
    function formatCoordinate(coord: number, type: 'lat' | 'lng'): string {
      const direction = type === 'lat' 
        ? (coord >= 0 ? 'N' : 'S')
        : (coord >= 0 ? 'E' : 'W');
      return `${Math.abs(coord).toFixed(6)}°${direction}`;
    }
  </script>
  
  <!-- Location Picker Component -->
  <div class="location-picker">
    <!-- Current Location Display -->
    {#if currentLocation}
      <div class="current-location bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-3">
            <div class="location-icon">
              {#if locationSource === 'gps'}
                <Navigation class="w-5 h-5 text-green-600" />
              {:else if locationSource === 'search'}
                <Search class="w-5 h-5 text-blue-600" />
              {:else if locationSource === 'manual'}
                <Target class="w-5 h-5 text-purple-600" />
              {:else}
                <MapPin class="w-5 h-5 text-gray-600" />
              {/if}
            </div>
            
            <div class="location-details">
              <div class="coordinates text-sm font-mono text-gray-700">
                {formatCoordinate(currentLocation.latitude, 'lat')}, {formatCoordinate(currentLocation.longitude, 'lng')}
              </div>
              
              {#if currentLocation.region}
                <div class="region text-sm text-gray-600 mt-1">
                  {currentLocation.region}
                </div>
              {/if}
              
              <div class="location-meta flex gap-4 mt-2 text-xs text-gray-500">
                <span class="source capitalize">
                  Source: {locationSource || 'Unknown'}
                </span>
                
                {#if accuracy}
                  <span class="accuracy">
                    Accuracy: {accuracy.toFixed(0)}m ({locationAccuracy})
                  </span>
                {/if}
              </div>
            </div>
          </div>
          
          <button
            type="button"
            on:click={clearLocation}
            class="clear-btn text-red-600 hover:text-red-700 p-1"
            aria-label="Clear location"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
  
        <!-- Accuracy Warning -->
        {#if requireAccuracy && accuracy && accuracy > maxAccuracy}
          <div class="accuracy-warning flex items-center gap-2 mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            <AlertCircle class="w-4 h-4" />
            <span>Location accuracy ({accuracy.toFixed(0)}m) exceeds requirement ({maxAccuracy}m)</span>
          </div>
        {/if}
      </div>
    {/if}
  
    <div class="location-methods space-y-4">
      <!-- GPS Detection -->
      {#if enableGPS}
        <div class="gps-section">
          <div class="method-header flex items-center justify-between mb-3">
            <h4 class="font-medium text-primary-forest flex items-center gap-2">
              <Navigation class="w-5 h-5" />
              Current Location
            </h4>
            
            <button
              type="button"
              on:click={detectCurrentLocation}
              disabled={isDetecting}
              class="gps-btn bg-primary-forest hover:bg-primary-forest/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
            >
              {#if isDetecting}
                <div class="spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Detecting...
              {:else}
                <Target class="w-4 h-4" />
                Use Current Location
              {/if}
            </button>
          </div>
  
          {#if permissionStatus === 'denied'}
            <div class="permission-denied bg-red-50 border border-red-200 rounded-lg p-3">
              <div class="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle class="w-4 h-4" />
                <span>Location access denied. Please enable location services in your browser settings.</span>
              </div>
            </div>
          {/if}
        </div>
      {/if}
  
      <!-- Location Search -->
      {#if enableSearch}
        <div class="search-section">
          <h4 class="font-medium text-primary-forest mb-3 flex items-center gap-2">
            <Search class="w-5 h-5" />
            Search Location
          </h4>
          
          <div class="search-input-group">
            <div class="relative">
              <input
                type="text"
                bind:value={searchQuery}
                on:keydown={(e) => e.key === 'Enter' && searchLocation()}
                placeholder="Enter city, address, or landmark..."
                class="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
              />
              <button
                type="button"
                on:click={searchLocation}
                disabled={!searchQuery.trim() || isSearching}
                class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-forest disabled:opacity-50"
              >
                {#if isSearching}
                  <div class="spinner w-4 h-4 border-2 border-gray-300 border-t-primary-forest rounded-full animate-spin"></div>
                {:else}
                  <Search class="w-4 h-4" />
                {/if}
              </button>
            </div>
  
            <!-- Search Results -->
            {#if searchResults.length > 0}
              <div class="search-results mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {#each searchResults as result (result.id)}
                  <button
                    type="button"
                    on:click={() => selectSearchResult(result)}
                    class="search-result w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="result-name font-medium text-gray-900 text-sm truncate">
                      {result.display_name.split(',')[0]}
                    </div>
                    <div class="result-address text-xs text-gray-600 mt-1 truncate">
                      {result.display_name}
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {/if}
  
      <!-- Manual Coordinate Entry -->
      {#if allowManualInput}
        <div class="manual-section">
          <h4 class="font-medium text-primary-forest mb-3 flex items-center gap-2">
            <Target class="w-5 h-5" />
            Manual Coordinates
          </h4>
          
          <div class="coordinate-inputs grid grid-cols-2 gap-3">
            <div>
              <label for="latitude" class="block text-sm text-gray-600 mb-1">Latitude</label>
              <input
                id="latitude"
                type="number"
                bind:value={manualLat}
                step="any"
                min="-90"
                max="90"
                placeholder="e.g., 40.7128"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
              />
            </div>
            
            <div>
              <label for="longitude" class="block text-sm text-gray-600 mb-1">Longitude</label>
              <input
                id="longitude"
                type="number"
                bind:value={manualLng}
                step="any"
                min="-180"
                max="180"
                placeholder="e.g., -74.0060"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent text-sm"
              />
            </div>
          </div>
          
          <button
            type="button"
            on:click={setManualLocation}
            disabled={!manualLat || !manualLng}
            class="manual-btn mt-3 bg-secondary-goldenrod hover:bg-secondary-goldenrod/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <CheckCircle class="w-4 h-4" />
            Set Location
          </button>
        </div>
      {/if}
    </div>
  
    <!-- Interactive Map -->
    {#if showMap}
      <div class="map-section mt-6">
        <h4 class="font-medium text-primary-forest mb-3 flex items-center gap-2">
          <MapPin class="w-5 h-5" />
          Interactive Map
          <span class="text-sm font-normal text-gray-600">(Click to select location)</span>
        </h4>
        
        <div class="map-container border border-gray-300 rounded-lg overflow-hidden">
          <div bind:this={mapContainer} class="w-full h-64"></div>
        </div>
      </div>
    {/if}
  
    <!-- Location Tips -->
    {#if !currentLocation}
      <div class="location-tips mt-6 bg-primary-sky/10 border border-primary-sky/20 rounded-lg p-4">
        <h4 class="font-medium text-primary-forest mb-2 flex items-center gap-2">
          📍 Location Tips
        </h4>
        <ul class="text-sm text-neutral-stone-gray space-y-1">
          <li>• GPS provides the most accurate location data</li>
          <li>• Search works best with specific addresses or landmarks</li>
          <li>• Manual coordinates use decimal degrees format</li>
          <li>• Click on the map to quickly select a location</li>
          {#if requireAccuracy}
            <li>• Location accuracy must be within {maxAccuracy}m for this observation</li>
          {/if}
        </ul>
      </div>
    {/if}
  </div>
  
  <style>
    /* Custom input styling */
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  
    input[type="number"] {
      -moz-appearance: textfield;
    }
  
    /* Search result hover effects */
    .search-result:hover {
      background-color: #f9fafb;
    }
  
    .search-result:focus {
      outline: 2px solid #2F5D50;
      outline-offset: -2px;
    }
  
    /* Method sections spacing */
    .method-header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
  
    /* Map container */
    .map-container {
      position: relative;
    }
  
    /* Responsive design */
    @media (max-width: 640px) {
      .coordinate-inputs {
        grid-template-columns: 1fr;
      }
      
      .method-header {
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
      }
    }
  
    /* High contrast support */
    @media (prefers-contrast: high) {
      .current-location,
      .permission-denied,
      .accuracy-warning,
      .location-tips {
        border-width: 2px;
      }
      
      .gps-btn,
      .manual-btn {
        border: 2px solid currentColor;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .gps-btn,
      .manual-btn,
      .search-result {
        transition: none;
      }
    }
  </style>