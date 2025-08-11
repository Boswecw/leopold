<script>
    import { onMount } from 'svelte';
    import ObservationMap from '$lib/components/ObservationMap.svelte';
    import { observationsStore } from '$lib/stores';
    
    // Add mock data for testing
    onMount(() => {
      const mockObservations = [
        {
          id: '1',
          species_name: 'American Robin',
          scientific_name: 'Turdus migratorius',
          observation_type: 'visual',
          location: { latitude: 40.7128, longitude: -74.0060 },
          created_at: new Date().toISOString(),
          description: 'Robin spotted in Central Park',
          user_id: 'mock-user',
          is_verified: false,
          images: [],
          tags: ['urban', 'common']
        },
        {
          id: '2',
          species_name: 'Blue Jay',
          scientific_name: 'Cyanocitta cristata', 
          observation_type: 'audio',
          location: { latitude: 40.7589, longitude: -73.9851 },
          created_at: new Date().toISOString(),
          description: 'Blue jay territorial call',
          user_id: 'mock-user',
          is_verified: true,
          audio_recording: { url: 'mock.wav', duration: 15 },
          tags: ['call', 'territorial']
        },
        {
          id: '3',
          species_name: 'Cardinal',
          scientific_name: 'Cardinalis cardinalis',
          observation_type: 'multi-modal',
          location: { latitude: 40.7505, longitude: -73.9934 },
          created_at: new Date().toISOString(),
          description: 'Male cardinal with distinctive call',
          user_id: 'mock-user', 
          is_verified: false,
          images: ['mock.jpg'],
          audio_recording: { url: 'mock2.wav', duration: 8 },
          tags: ['red', 'male', 'song']
        }
      ];
      
      // Add mock data to store
      observationsStore.addMany(mockObservations);
    });
  </script>
  
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Leopold Observation Map</h1>
    
    <div class="mb-4 p-2 bg-blue-100 rounded">
      <p>Observations loaded: {$observationsStore.length}</p>
      <p>Map should show: {$observationsStore.length} markers</p>
    </div>
  
    <ObservationMap
      observations={$observationsStore}
      centerLocation={{ latitude: 40.7128, longitude: -74.0060 }}
      enableClustering={true}
      enableAudioPlayback={true}
      height="70vh"
    />
  </div>
