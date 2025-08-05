<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import ObservationMap from '$lib/components/ObservationMap.svelte';
    import { observationsStore, filtersStore, uiStore } from '$lib/stores';
    import { MapPin, Plus, Filter, List, Grid } from 'lucide-svelte';
    import type { Observation, ViewMode } from '$lib/types';
  
    let observations: Observation[] = [];
    let selectedObservation: Observation | null = null;
    let viewMode: ViewMode = 'map';
    let showFilters = false;
    let isLoading = true;
  
    const mockObservations: Observation[] = [/* your mock data here */];
  
    $: filteredObservations = $observationsStore.length > 0 ? $observationsStore : observations;
  
    onMount(() => {
      observations = mockObservations;
      observationsStore.set(observations);
      uiStore.showNotification('success', `Loaded ${observations.length} observations`);
      isLoading = false;
    });
  
    function handleObservationSelected(event: CustomEvent<Observation>) {
      selectedObservation = event.detail;
      uiStore.selectObservation(event.detail);
    }
  
    function handleNewObservation() {
      goto('/observations/new');
    }
  
    function toggleFilters() {
      showFilters = !showFilters;
    }
  
    function setViewMode(mode: ViewMode) {
      viewMode = mode;
      uiStore.setViewMode(mode);
    }
  </script>
  
  <svelte:head>
    <title>Leopold Nature Observer - Wildlife Observation Map</title>
    <meta name="description" content="Explore wildlife observations from around the world. Discover birds, mammals, amphibians, and more through community science." />
  </svelte:head>
  
  <!-- Now paste your dashboard layout here (view toggles, ObservationMap, etc.) -->
  <!-- I’ve left it out here for brevity, but it stays exactly how you wrote it -->
  