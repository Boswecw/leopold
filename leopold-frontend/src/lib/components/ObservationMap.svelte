<!-- src/lib/components/ObservationMap.svelte -->
<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    import { observationsStore, filtersStore, uiStore } from '$stores';
    import { Play, Pause, Volume2, Camera, Mic, MapPin, Filter, Layers } from 'lucide-svelte';
    import type { 
      Observation, 
      Location, 
      MapBounds, 
      ObservationType,
      ClusterInfo 
    } from '$lib/types';
  
    // Map library imports (dynamic to avoid SSR issues)
    let L: any;
    let markerClusterGroup: any;
  
    const dispatch = createEventDispatcher<{
      observationSelected: Observation;
      boundsChanged: MapBounds;
      markerClicked: { observation: Observation; marker: any };
    }>();
  
    // Props
    export let observations: Observation[] = [];
    export let selectedObservation: Observation | null = null;
    export let centerLocation: Location | null = null;
    export let zoom = 10;
    export let height = '500px';
    export let enableClustering = true;
    export let enableAudioPlayback = true;
    export let showFilters = true;
  
    // Map state
    let mapContainer: HTMLDivElement;
    let map: any;
    let markerCluster: any;
    let markers = new Map<string, any>();
    let audioPlayer: HTMLAudioElement;
    let currentlyPlaying: string | null = null;
    let isInitialized = false;
  
    // Filter state
    let activeFilters = $filtersStore;
    let showFilterPanel = false;
    let layerControls = {
      visual: true,
      audio: true,
      'multi-modal': true,
      verified: false
    };
  
    // Reactive statements
    $: filteredObservations = filterObservations(observations, activeFilters, layerControls);
    $: if (map && isInitialized) {
      updateMarkers(filteredObservations);
    }
    $: if (map && selectedObservation) {
      focusOnObservation(selectedObservation);
    }
  
    onMount(async () => {
      if (!browser) return;
  
      try {
        // Dynamic import of Leaflet to avoid SSR issues
        const leafletModule = await import('leaflet');
        L = leafletModule.default;
  
        // Import marker cluster plugin
        await import('leaflet.markercluster');
        
        // Fix for default markers in Webpack/Vite
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
  
        await initializeMap();
      } catch (error) {
        console.error('Failed to initialize map:', error);
        uiStore.showNotification('error', 'Failed to load map. Please refresh the page.');
      }
    });
  
    onDestroy(() => {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
      }
      if (map) {
        map.remove();
      }
    });
  
    async function initializeMap() {
      if (!L || !mapContainer) return;
  
      // Initialize map
      map = L.map(mapContainer, {
        center: centerLocation ? [centerLocation.latitude, centerLocation.longitude] : [39.8283, -98.5795], // Center of US
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });
  
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);
  
      // Initialize marker cluster group
      if (enableClustering) {
        markerCluster = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: false,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 50,
          iconCreateFunction: createClusterIcon
        });
        map.addLayer(markerCluster);
      }
  
      // Map event listeners
      map.on('moveend', handleMapMove);
      map.on('zoomend', handleMapMove);
  
      isInitialized = true;
      updateMarkers(filteredObservations);
    }
  
    function handleMapMove() {
      if (!map) return;
      
      const bounds = map.getBounds();
      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };
      
      dispatch('boundsChanged', mapBounds);
    }
  
    function filterObservations(
      obs: Observation[], 
      filters: typeof activeFilters, 
      layers: typeof layerControls
    ): Observation[] {
      return obs.filter(observation => {
        // Layer visibility filter
        if (!layers[observation.observation_type]) {
          return false;
        }
  
        // Verified only filter
        if (layers.verified && !observation.expert_verified) {
          return false;
        }
  
        // Species filter
        if (filters.species.length > 0 && !filters.species.includes(observation.species_name)) {
          return false;
        }
  
        // Date range filter
        if (filters.date_range) {
          const obsDate = new Date(observation.observed_at);
          const startDate = new Date(filters.date_range.start);
          const endDate = new Date(filters.date_range.end);
          if (obsDate < startDate || obsDate > endDate) {
            return false;
          }
        }
  
        // Audio frequency filter
        if (filters.audio_features && observation.audio_features) {
          const freq = observation.audio_features.dominant_frequency;
          if (freq < filters.audio_features.min_frequency || 
              freq > filters.audio_features.max_frequency) {
            return false;
          }
        }
  
        return true;
      });
    }
  
    function updateMarkers(observations: Observation[]) {
      if (!map || !isInitialized) return;
  
      // Clear existing markers
      if (enableClustering && markerCluster) {
        markerCluster.clearLayers();
      }
      
      markers.clear();
  
      // Add new markers
      observations.forEach(observation => {
        const marker = createObservationMarker(observation);
        markers.set(observation.id, marker);
        
        if (enableClustering && markerCluster) {
          markerCluster.addLayer(marker);
        } else {
          marker.addTo(map);
        }
      });
    }
  
    function createObservationMarker(observation: Observation) {
      const marker = L.marker(
        [observation.location.latitude, observation.location.longitude],
        {
          icon: getObservationIcon(observation),
          observationType: observation.observation_type,
          observationId: observation.id
        }
      );
  
      // Create popup content
      const popupContent = createPopupContent(observation);
      marker.bindPopup(popupContent, {
        maxWidth: 400,
        className: 'observation-popup'
      });
  
      // Marker events
      marker.on('click', () => {
        dispatch('markerClicked', { observation, marker });
        dispatch('observationSelected', observation);
      });
  
      return marker;
    }
  
    function getObservationIcon(observation: Observation) {
      const confidence = observation.confidence_level;
      const verified = observation.expert_verified;
      
      // Color based on confidence and verification
      let color = '#94a3b8'; // Default gray
      if (verified) {
        color = '#059669'; // Green for verified
      } else if (confidence >= 4) {
        color = '#0ea5e9'; // Blue for high confidence
      } else if (confidence >= 2) {
        color = '#f59e0b'; // Yellow for medium confidence
      } else {
        color = '#ef4444'; // Red for low confidence
      }
  
      // Icon based on observation type
      let iconHtml = '';
      switch (observation.observation_type) {
        case 'visual':
          iconHtml = `<div class="marker-icon visual-marker" style="background-color: ${color}">📷</div>`;
          break;
        case 'audio':
          iconHtml = `<div class="marker-icon audio-marker" style="background-color: ${color}">🎵</div>`;
          break;
        case 'multi-modal':
          iconHtml = `<div class="marker-icon multi-marker" style="background-color: ${color}">🎭</div>`;
          break;
        default:
          iconHtml = `<div class="marker-icon default-marker" style="background-color: ${color}">📍</div>`;
      }
  
      return L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    }
  
    function createClusterIcon(cluster: any): any {
      const markers = cluster.getAllChildMarkers();
      const info = analyzeCluster(markers);
      
      return L.divIcon({
        html: `
          <div class="cluster-icon" style="background-color: rgba(47, 93, 80, 0.8)">
            <span class="cluster-count">${info.count}</span>
            <div class="cluster-breakdown">
              ${info.audio_count > 0 ? `<span class="audio-count">🎵${info.audio_count}</span>` : ''}
              ${info.visual_count > 0 ? `<span class="visual-count">📷${info.visual_count}</span>` : ''}
              ${info.multi_modal_count > 0 ? `<span class="multi-count">🎭${info.multi_modal_count}</span>` : ''}
            </div>
          </div>
        `,
        className: 'custom-cluster-icon',
        iconSize: [50, 50]
      });
    }
  
    function analyzeCluster(markers: any[]): ClusterInfo {
      const info: ClusterInfo = {
        count: markers.length,
        audio_count: 0,
        visual_count: 0,
        multi_modal_count: 0,
        average_confidence: 0
      };
  
      markers.forEach(marker => {
        const type = marker.options.observationType;
        switch (type) {
          case 'audio':
            info.audio_count++;
            break;
          case 'visual':
            info.visual_count++;
            break;
          case 'multi-modal':
            info.multi_modal_count++;
            break;
        }
      });
  
      return info;
    }
  
    function createPopupContent(observation: Observation): string {
      const hasAudio = observation.audio_urls && observation.audio_urls.length > 0;
      const hasImage = observation.image_urls && observation.image_urls.length > 0;
      const hasSpectrogram = observation.spectrogram_urls && observation.spectrogram_urls.length > 0;
  
      return `
        <div class="observation-popup-content">
          <div class="popup-header">
            <h3 class="species-name">${observation.species_name}</h3>
            <div class="observation-badges">
              <span class="observation-type ${observation.observation_type}">${observation.observation_type}</span>
              ${observation.expert_verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
            </div>
          </div>
  
          <div class="popup-media">
            ${hasImage ? `
              <div class="image-section">
                <img src="${observation.image_urls[0]}" alt="${observation.species_name}" 
                     class="observation-image" loading="lazy" />
              </div>
            ` : ''}
  
            ${hasAudio ? `
              <div class="audio-section">
                <div class="audio-controls">
                  <button onclick="playAudio('${observation.audio_urls[0]}', '${observation.id}')" 
                          class="play-button">
                    🎵 Play Recording
                    ${observation.recording_duration ? `(${observation.recording_duration.toFixed(1)}s)` : ''}
                  </button>
                </div>
                <div id="waveform-${observation.id}" class="waveform-container"></div>
              </div>
            ` : ''}
  
            ${hasSpectrogram ? `
              <div class="spectrogram-section">
                <img src="${observation.spectrogram_urls[0]}" alt="Spectrogram" 
                     class="spectrogram-image" />
                <p class="spectrogram-label">Frequency Analysis</p>
              </div>
            ` : ''}
          </div>
  
          <div class="popup-details">
            ${observation.ai_predictions ? `
              <div class="ai-analysis">
                <h4>AI Analysis</h4>
                <div class="confidence-bar">
                  <span>Confidence: ${observation.ai_predictions.confidence}/10</span>
                  <div class="bar">
                    <div class="fill" style="width: ${observation.ai_predictions.confidence * 10}%"></div>
                  </div>
                </div>
              </div>
            ` : ''}
  
            ${observation.audio_features ? `
              <div class="audio-features">
                <h4>Audio Features</h4>
                <div class="feature-grid">
                  <div class="feature">
                    <span class="label">Frequency:</span>
                    <span class="value">${observation.audio_features.dominant_frequency?.toFixed(0)} Hz</span>
                  </div>
                  ${observation.call_type ? `
                    <div class="feature">
                      <span class="label">Call Type:</span>
                      <span class="value">${observation.call_type}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}
  
            <div class="observation-meta">
              <div class="meta-item">
                <span class="label">Observer:</span>
                <span class="value">${observation.user?.username || 'Anonymous'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Date:</span>
                <span class="value">${new Date(observation.observed_at).toLocaleDateString()}</span>
              </div>
              <div class="meta-item">
                <span class="label">Location:</span>
                <span class="value">${observation.location.latitude.toFixed(4)}, ${observation.location.longitude.toFixed(4)}</span>
              </div>
            </div>
          </div>
  
          <div class="popup-actions">
            <button onclick="viewObservation('${observation.id}')" class="view-btn">
              View Details
            </button>
          </div>
        </div>
      `;
    }
  
    function focusOnObservation(observation: Observation) {
      if (!map) return;
      
      map.setView(
        [observation.location.latitude, observation.location.longitude], 
        Math.max(map.getZoom(), 15)
      );
      
      const marker = markers.get(observation.id);
      if (marker) {
        marker.openPopup();
      }
    }
  
    function toggleLayer(type: keyof typeof layerControls) {
      layerControls[type] = !layerControls[type];
      layerControls = { ...layerControls }; // Trigger reactivity
    }
  
    function toggleFilterPanel() {
      showFilterPanel = !showFilterPanel;
    }
  
    // Global functions for popup interactions (needed for onclick handlers in HTML strings)
    if (browser) {
      (window as any).playAudio = async (audioUrl: string, observationId: string) => {
        if (!enableAudioPlayback) return;
  
        // Stop current audio if playing
        if (audioPlayer && currentlyPlaying) {
          audioPlayer.pause();
          audioPlayer.currentTime = 0;
        }
  
        // Play new audio
        if (currentlyPlaying !== observationId) {
          audioPlayer = new Audio(audioUrl);
          audioPlayer.play().catch(console.error);
          currentlyPlaying = observationId;
          
          audioPlayer.onended = () => {
            currentlyPlaying = null;
          };
        } else {
          currentlyPlaying = null;
        }
      };
  
      (window as any).viewObservation = (observationId: string) => {
        const observation = observations.find(obs => obs.id === observationId);
        if (observation) {
          dispatch('observationSelected', observation);
          uiStore.selectObservation(observation);
        }
      };
    }
  </script>
  
  <!-- Interactive Map Component -->
  <div class="observation-map relative bg-white rounded-lg shadow-nature border border-primary-forest/10" style="height: {height}">
    <!-- Map Controls -->
    {#if showFilters}
      <div class="map-controls absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <!-- Layer Toggle -->
        <div class="control-panel bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-primary-forest/20 p-3">
          <h4 class="text-sm font-medium text-primary-forest mb-2 flex items-center gap-1">
            <Layers class="w-4 h-4" />
            Layers
          </h4>
          <div class="layer-toggles space-y-2">
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={layerControls.visual}
                on:change={() => toggleLayer('visual')}
                class="rounded border-gray-300 text-primary-forest focus:ring-primary-forest"
              />
              <Camera class="w-4 h-4 text-primary-forest" />
              <span>Visual ({observations.filter(o => o.observation_type === 'visual').length})</span>
            </label>
            
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={layerControls.audio}
                on:change={() => toggleLayer('audio')}
                class="rounded border-gray-300 text-primary-forest focus:ring-primary-forest"
              />
              <Mic class="w-4 h-4 text-primary-forest" />
              <span>Audio ({observations.filter(o => o.observation_type === 'audio').length})</span>
            </label>
            
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={layerControls['multi-modal']}
                on:change={() => toggleLayer('multi-modal')}
                class="rounded border-gray-300 text-primary-forest focus:ring-primary-forest"
              />
              <span class="text-lg">🎭</span>
              <span>Multi-Modal ({observations.filter(o => o.observation_type === 'multi-modal').length})</span>
            </label>
            
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                bind:checked={layerControls.verified}
                on:change={() => toggleLayer('verified')}
                class="rounded border-gray-300 text-primary-forest focus:ring-primary-forest"
              />
              <span class="text-green-600">✓</span>
              <span>Verified Only</span>
            </label>
          </div>
        </div>
  
        <!-- Filter Toggle -->
        <button
          on:click={toggleFilterPanel}
          class="filter-toggle bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-primary-forest/20 p-3 hover:bg-white transition-colors"
          aria-label="Toggle filters"
        >
          <Filter class="w-5 h-5 text-primary-forest" />
        </button>
      </div>
    {/if}
  
    <!-- Filter Panel -->
    {#if showFilterPanel}
      <div class="filter-panel absolute top-4 left-4 ml-20 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-primary-forest/20 p-4 w-80 max-h-96 overflow-y-auto">
        <h3 class="font-medium text-primary-forest mb-3 flex items-center gap-2">
          <Filter class="w-4 h-4" />
          Advanced Filters
        </h3>
        
        <!-- Date Range Filter -->
        <div class="filter-group mb-4">
          <label class="block text-sm font-medium text-neutral-stone-gray mb-2">Date Range</label>
          <div class="flex gap-2">
            <input
              type="date"
              bind:value={activeFilters.date_range?.start}
              class="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest"
            />
            <input
              type="date"
              bind:value={activeFilters.date_range?.end}
              class="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest"
            />
          </div>
        </div>
  
        <!-- Audio Frequency Filter -->
        <div class="filter-group mb-4">
          <label class="block text-sm font-medium text-neutral-stone-gray mb-2">
            Audio Frequency Range (Hz)
          </label>
          <div class="flex gap-2 items-center">
            <input
              type="number"
              bind:value={activeFilters.audio_features.min_frequency}
              min="0"
              max="20000"
              class="w-20 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest"
            />
            <span class="text-xs text-neutral-stone-gray">to</span>
            <input
              type="number"
              bind:value={activeFilters.audio_features.max_frequency}
              min="0"
              max="20000"
              class="w-20 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-forest"
            />
          </div>
        </div>
  
        <!-- Confidence Filter -->
        <div class="filter-group mb-4">
          <label class="block text-sm font-medium text-neutral-stone-gray mb-2">
            Minimum Confidence: {activeFilters.confidence_min}/5
          </label>
          <input
            type="range"
            min="0"
            max="5"
            bind:value={activeFilters.confidence_min}
            class="w-full"
          />
        </div>
  
        <button
          on:click={() => {
            activeFilters = $filtersStore;
            showFilterPanel = false;
          }}
          class="w-full px-3 py-2 bg-primary-forest text-white rounded-lg hover:bg-primary-forest/80 transition-colors text-sm"
        >
          Apply Filters
        </button>
      </div>
    {/if}
  
    <!-- Map Legend -->
    <div class="map-legend absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-primary-forest/20 p-3">
      <h4 class="text-sm font-medium text-primary-forest mb-2">Legend</h4>
      <div class="legend-items space-y-1 text-xs">
        <div class="flex items-center gap-2">
          <div class="marker-icon w-4 h-4 rounded bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
          <span>Verified</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="marker-icon w-4 h-4 rounded bg-blue-500 text-white flex items-center justify-center text-xs">H</div>
          <span>High Confidence</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="marker-icon w-4 h-4 rounded bg-yellow-500 text-white flex items-center justify-center text-xs">M</div>
          <span>Medium Confidence</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="marker-icon w-4 h-4 rounded bg-red-500 text-white flex items-center justify-center text-xs">L</div>
          <span>Low Confidence</span>
        </div>
      </div>
    </div>
  
    <!-- Map Container -->
    <div bind:this={mapContainer} class="w-full h-full rounded-lg"></div>
  
    <!-- Loading State -->
    {#if !isInitialized}
      <div class="absolute inset-0 flex items-center justify-center bg-neutral-off-white rounded-lg">
        <div class="text-center">
          <div class="spinner w-8 h-8 border-4 border-primary-forest/20 border-t-primary-forest rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-neutral-stone-gray">Loading map...</p>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    /* Custom marker styles */
    :global(.custom-marker) {
      background: transparent !important;
      border: none !important;
    }
  
    :global(.marker-icon) {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      border: 3px solid white;
    }
  
    /* Cluster icon styles */
    :global(.custom-cluster-icon) {
      background: transparent !important;
      border: none !important;
    }
  
    :global(.cluster-icon) {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border: 3px solid white;
    }
  
    :global(.cluster-count) {
      font-size: 16px;
      font-weight: bold;
    }
  
    :global(.cluster-breakdown) {
      font-size: 8px;
      display: flex;
      gap: 2px;
    }
  
    /* Popup styles */
    :global(.observation-popup .leaflet-popup-content) {
      margin: 0;
      padding: 0;
    }
  
    :global(.observation-popup-content) {
      min-width: 300px;
      max-width: 400px;
    }
  
    :global(.popup-header) {
      background: linear-gradient(135deg, #2F5D50, #76B4BD);
      color: white;
      padding: 12px 16px;
      border-radius: 8px 8px 0 0;
    }
  
    :global(.species-name) {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
  
    :global(.observation-badges) {
      display: flex;
      gap: 8px;
    }
  
    :global(.observation-type) {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      text-transform: capitalize;
    }
  
    :global(.verified-badge) {
      background: #059669;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }
  
    :global(.popup-media) {
      padding: 16px;
    }
  
    :global(.observation-image) {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 12px;
    }
  
    :global(.play-button) {
      background: #2F5D50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background-color 0.2s;
    }
  
    :global(.play-button:hover) {
      background: #1e3a2e;
    }
  
    :global(.spectrogram-image) {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      margin-top: 8px;
    }
  
    :global(.popup-details) {
      padding: 0 16px 16px;
    }
  
    :global(.ai-analysis h4),
    :global(.audio-features h4) {
      font-size: 14px;
      font-weight: 600;
      color: #2F5D50;
      margin: 0 0 8px 0;
    }
  
    :global(.confidence-bar) {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }
  
    :global(.confidence-bar .bar) {
      flex: 1;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
    }
  
    :global(.confidence-bar .fill) {
      height: 100%;
      background: #059669;
      transition: width 0.3s ease;
    }
  
    :global(.feature-grid) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 12px;
    }
  
    :global(.feature .label) {
      color: #64748b;
    }
  
    :global(.feature .value) {
      font-weight: 500;
    }
  
    :global(.observation-meta) {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
    }
  
    :global(.meta-item) {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
    }
  
    :global(.meta-item .label) {
      color: #64748b;
    }
  
    :global(.meta-item .value) {
      font-weight: 500;
    }
  
    :global(.popup-actions) {
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 0 0 8px 8px;
    }
  
    :global(.view-btn) {
      width: 100%;
      background: #DAA520;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
  
    :global(.view-btn:hover) {
      background: #b8941b;
    }
  
    /* Responsive design */
    @media (max-width: 768px) {
      .map-controls {
        position: relative;
        top: 0;
        left: 0;
        margin-bottom: 8px;
        flex-direction: row;
        justify-content: space-between;
      }
  
      .filter-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        width: 90vw;
        max-width: 350px;
      }
  
      .map-legend {
        position: relative;
        bottom: 0;
        right: 0;
        margin-top: 8px;
      }
    }
  
    /* High contrast support */
    @media (prefers-contrast: high) {
      .control-panel,
      .filter-panel,
      .map-legend {
        border-width: 2px;
        background: white;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      :global(.confidence-bar .fill) {
        transition: none;
      }
    }
  </style>