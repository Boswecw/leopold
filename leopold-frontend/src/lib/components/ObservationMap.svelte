<script context="module" lang="ts">
  import type {
    Observation,
    ObservationFilters,
    ObservationType
  } from '$lib/types';

  export function filterObservations(
    obs: Observation[],
    filters: ObservationFilters = {},
    layers: Record<ObservationType | 'verified', boolean>
  ): Observation[] {
    return obs.filter(observation => {
      // Observation type layers
      if (!layers[observation.observation_type]) {
        return false;
      }

      // Unverified observations layer
      if (!observation.is_verified && !layers.verified) {
        return false;
      }

      // Species filter
      if (filters.species && filters.species.length > 0) {
        const names = [
          observation.species_name,
          observation.scientific_name,
          ...(observation.common_names || [])
        ]
          .filter(Boolean)
          .map(n => (n as string).toLowerCase());
        const hasSpecies = filters.species
          .map(s => s.toLowerCase())
          .some(s => names.includes(s));
        if (!hasSpecies) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const obsDate = new Date(observation.created_at);
        if (
          filters.dateRange.start &&
          obsDate < new Date(filters.dateRange.start)
        ) {
          return false;
        }
        if (
          filters.dateRange.end &&
          obsDate > new Date(filters.dateRange.end)
        ) {
          return false;
        }
      }

      // Observation type filter
      if (
        filters.observationType &&
        filters.observationType !== 'all' &&
        observation.observation_type !== filters.observationType
      ) {
        return false;
      }

      // User filter
      if (filters.user && observation.user_id !== filters.user) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const obsTags = observation.tags || [];
        const hasAllTags = filters.tags.every(tag => obsTags.includes(tag));
        if (!hasAllTags) {
          return false;
        }
      }

      // Verified filter from filters
      if (
        filters.verified !== undefined &&
        (observation.is_verified ?? false) !== filters.verified
      ) {
        return false;
      }

      // Location filter (simple haversine)
      if (filters.location && observation.location) {
        const { latitude: lat1, longitude: lon1 } = observation.location;
        const { latitude: lat2, longitude: lon2 } = filters.location.center;
        const R = 6371; // km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        if (distance > filters.location.radius_km) {
          return false;
        }
      }

      return true;
    });
  }
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { observationsStore, filtersStore, uiStore } from '$lib/stores';
  import { Play, Pause, Volume2, Camera, Mic, MapPin, Filter, Layers } from 'lucide-svelte';
  import type {
    Observation,
    Location,
    MapBounds,
    ObservationType,
    ClusterInfo
  } from '$lib/types';

  // Map library imports
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

  // State
  let mapContainer: HTMLDivElement;
  let map: any;
  let markerCluster: any;
  let markers = new Map<string, any>();
  let audioPlayer: HTMLAudioElement | null = null;
  let currentlyPlaying: string | null = null;
  let isInitialized = false;

  // Filter state
  let activeFilters = $filtersStore;
  let showFilterPanel = false;
  
  let layerControls: Record<ObservationType | 'verified', boolean> = {
    visual: true,
    audio: true,
    'multi-modal': true,
    plant: true,
    verified: false
  };

  // Reactive filtering
  let filteredObservations: Observation[] = [];
  
  $: {
    filteredObservations = filterObservations(observations, activeFilters, layerControls);
  }

  $: if (map && isInitialized && filteredObservations) {
    updateMarkers(filteredObservations);
  }

  $: if (map && selectedObservation && isInitialized) {
    focusOnObservation(selectedObservation);
  }

  onMount(async () => {
    if (!browser) return;

    try {
      const leafletModule = await import('leaflet');
      L = leafletModule.default;

      try {
        await import('leaflet.markercluster');
        markerClusterGroup = (L as any).markerClusterGroup;
      } catch (importError) {
        console.warn('leaflet.markercluster import failed:', importError);
        enableClustering = false;
      }
      
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      await initializeMap();
    } catch (error) {
      console.error('Failed to initialize map:', error);
      uiStore?.showNotification?.('error', 'Failed to load map. Please refresh the page.');
    }
  });

  onDestroy(() => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = '';
      audioPlayer = null;
    }
    if (map) {
      map.remove();
      map = null;
    }
    markers.clear();
  });

  async function initializeMap() {
    if (!L || !mapContainer) return;

    try {
      const defaultCenter: [number, number] = centerLocation 
        ? [centerLocation.latitude, centerLocation.longitude]
        : [40.7128, -74.0060];

      map = L.map(mapContainer, {
        center: defaultCenter,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      if (enableClustering && markerClusterGroup) {
        markerCluster = markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 50,
          iconCreateFunction: createClusterIcon
        });
        map.addLayer(markerCluster);
      }

      map.on('moveend', handleMapMove);
      map.on('zoomend', handleMapMove);

      isInitialized = true;
      
      if (filteredObservations.length > 0) {
        updateMarkers(filteredObservations);
      }

    } catch (error) {
      console.error('Map initialization failed:', error);
      throw error;
    }
  }

  function updateMarkers(observations: Observation[]) {
    if (!map || !isInitialized) return;

    try {
      if (markerCluster) {
        markerCluster.clearLayers();
      } else {
        markers.forEach(marker => map.removeLayer(marker));
      }
      markers.clear();

      observations.forEach(observation => {
        const marker = createMarker(observation);
        if (marker) {
          markers.set(observation.id, marker);
          
          if (markerCluster) {
            markerCluster.addLayer(marker);
          } else {
            marker.addTo(map);
          }
        }
      });

    } catch (error) {
      console.error('Failed to update markers:', error);
    }
  }

  function focusOnObservation(observation: Observation) {
    if (!map || !observation.location) return;

    map.setView([observation.location.latitude, observation.location.longitude], 15);
    
    const marker = markers.get(observation.id);
    if (marker) {
      marker.openPopup();
    }
  }

  function createMarker(observation: Observation) {
    if (!L || !observation.location) return null;

    const icon = getObservationIcon(observation.observation_type);
    const marker = L.marker([observation.location.latitude, observation.location.longitude], { icon });

    const popupContent = createPopupContent(observation);
    marker.bindPopup(popupContent);

    marker.on('click', () => {
      dispatch('observationSelected', observation);
      dispatch('markerClicked', { observation, marker });
    });

    return marker;
  }

  function createPopupContent(observation: Observation): string {
    return `
      <div class="observation-popup">
        <h3>${observation.species_name || 'Unknown Species'}</h3>
        <p><strong>Type:</strong> ${observation.observation_type}</p>
        <p><strong>Date:</strong> ${new Date(observation.created_at).toLocaleDateString()}</p>
        ${observation.description ? `<p>${observation.description}</p>` : ''}
      </div>
    `;
  }

  function getObservationIcon(type: ObservationType) {
    const iconMap: Record<ObservationType, string> = {
      visual: '📸',
      audio: '🔊',
      'multi-modal': '🎬',
      plant: '🌿'
    };

    return L.divIcon({
      html: `<div class="observation-marker ${type}">${iconMap[type] || '📍'}</div>`,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  }

  function createClusterIcon(cluster: any): any {
    const count = cluster.getChildCount();
    let size = 'small';
    
    if (count >= 100) size = 'large';
    else if (count >= 10) size = 'medium';

    return L.divIcon({
      html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
      className: 'marker-cluster',
      iconSize: [40, 40]
    });
  }

  function handleMapMove() {
    if (!map) return;

    const bounds = map.getBounds();
    const mapBounds: MapBounds = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      zoom: map.getZoom()
    };

    dispatch('boundsChanged', mapBounds);
  }
</script>

<div class="observation-map-container" style="height: {height};">
  <div bind:this={mapContainer} class="map-container w-full h-full rounded-lg"></div>
</div>