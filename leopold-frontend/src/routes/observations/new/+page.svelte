<!-- src/routes/observations/new/+page.svelte - Fixed version -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { observationsStore, uiStore, authStore } from '$lib/stores';
  import { ArrowLeft, Info, MapPin, Camera, Mic } from 'lucide-svelte';
  import ObservationForm from '$lib/components/ObservationForm.svelte';

  // Remove TypeScript annotations to fix parsing errors
  let isSubmitting = false;
  let formData = null;
  let currentUser = null;
  let isAuthenticated = false;

  // Get current auth state - fixed to properly access user from AuthState
  $: currentUser = $authStore?.user || null;
  $: isAuthenticated = !!currentUser;

  // Check authentication on mount
  onMount(() => {
    if (!isAuthenticated) {
      const redirectUrl = encodeURIComponent('/observations/new');
      goto(`/auth/signin?redirect=${redirectUrl}`);
    }
  });

  // Handle form submission - fixed all the TypeScript errors
  async function handleFormSubmit(event) {
    if (!currentUser) {
      uiStore.showNotification('error', 'You must be logged in to create observations');
      goto('/auth/signin?redirect=/observations/new');
      return;
    }

    isSubmitting = true;
    uiStore.setLoading('loading');

    try {
      const submittedData = event.detail;
      
      // Create new observation object - fixed AuthState vs User type issues
      const newObservation = {
        id: crypto.randomUUID(),
        user_id: currentUser.id || 'unknown-user',
        user: currentUser,
        species_name: submittedData.species_name || 'Unknown Species',
        scientific_name: submittedData.scientific_name || undefined,
        description: submittedData.description || undefined,
        notes: submittedData.notes || undefined,
        observation_type: submittedData.observation_type,
        location: submittedData.location,
        count: submittedData.count || 1,
        confidence: submittedData.confidence || 3,
        weather_conditions: submittedData.weather_conditions || undefined,
        habitat_type: submittedData.habitat_type || undefined,
        habitat_description: submittedData.habitat_description || undefined,
        behavior_notes: submittedData.behavior_notes || undefined,
        tags: submittedData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        observed_at: new Date().toISOString(),
        is_verified: false,
        verification_status: 'pending'
      };

      // Handle images if present
      if (submittedData.images && submittedData.images.length > 0) {
        // In a real app, you'd upload images to a server first
        // For now, create placeholder URLs
        newObservation.image_urls = submittedData.images.map((file, index) => 
          `placeholder-image-${index + 1}.jpg`
        );
        newObservation.images = submittedData.images.map(file => file.name);
      }

      // Handle audio recording if present
      if (submittedData.audio_recording) {
        // In a real app, you'd upload audio to a server first
        newObservation.audio_url = 'placeholder-audio.mp3';
        
        // Create audio features with all required properties - fixed missing pattern_type
        newObservation.audio_features = {
          frequency_peak: Math.random() * 8000 + 1000,
          amplitude: Math.random() * 0.8 + 0.2,
          duration: submittedData.audio_recording.duration || 0,
          pattern_type: ['single', 'repetitive', 'complex'][Math.floor(Math.random() * 3)],
          noise_ratio: Math.random() * 0.5,
          dominant_frequency: Math.random() * 6000 + 2000,
          spectral_centroid: Math.random() * 4000 + 1000,
          zero_crossing_rate: Math.random() * 0.1
        };
      }

      // Mock AI predictions - fixed missing confidence property
      if (newObservation.species_name !== 'Unknown Species') {
        newObservation.ai_predictions = {
          species: [{
            name: newObservation.species_name,
            scientific_name: newObservation.scientific_name || '',
            confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
          }],
          confidence: Math.random() * 3 + 7, // 7-10
          identification_method: submittedData.observation_type === 'multi-modal' ? 'multi-modal' : submittedData.observation_type,
          processing_time: Math.random() * 2 + 0.5,
          model_version: '1.0.0'
        };
      }

      // TODO: Replace with actual API call
      // const response = await fetch('/api/observations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newObservation)
      // });

      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add to store - now works with corrected store implementation
      observationsStore.update(observations => [...observations, newObservation]);

      // Show success message
      uiStore.showNotification('success', 'Observation created successfully!');

      // Navigate to the new observation or back to list
      goto('/observations');

    } catch (error) {
      console.error('Error creating observation:', error);
      uiStore.showNotification('error', 'Failed to create observation. Please try again.');
    } finally {
      isSubmitting = false;
      uiStore.setLoading('idle');
    }
  }

  function handleFormCancel() {
    // Navigate back to observations list
    goto('/observations');
  }

  function handleStepChanged(event) {
    // Handle step validation changes if needed
    console.log('Step changed:', event.detail);
  }

  // Get any initial data from URL params or store
  let initialFormData = {};
  
  // Parse URL params for pre-filled data
  onMount(() => {
    const urlParams = new URLSearchParams($page.url.search);
    
    if (urlParams.has('lat') && urlParams.has('lng')) {
      initialFormData.location = {
        latitude: parseFloat(urlParams.get('lat')),
        longitude: parseFloat(urlParams.get('lng'))
      };
    }
    
    if (urlParams.has('species')) {
      initialFormData.species_name = urlParams.get('species');
    }
    
    if (urlParams.has('type')) {
      const type = urlParams.get('type');
      if (['visual', 'audio', 'multi-modal'].includes(type)) {
        initialFormData.observation_type = type;
      }
    }
  });
</script>

<svelte:head>
  <title>New Observation - Leopold</title>
  <meta name="description" content="Create a new wildlife observation" />
</svelte:head>

<!-- Only show form if user is authenticated -->
{#if isAuthenticated}
  <div class="new-observation-page min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              on:click={() => goto('/observations')}
              class="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
              aria-label="Go back to observations"
            >
              <ArrowLeft class="w-5 h-5" />
              Back to Observations
            </button>
          </div>
          
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <Info class="w-4 h-4" />
            All fields marked with * are required
          </div>
        </div>
        
        <div class="mt-4">
          <h1 class="text-2xl font-bold text-gray-800">Record New Observation</h1>
          <p class="text-gray-600 mt-1">
            Document wildlife with photos, audio recordings, and detailed notes
          </p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- Help Tips -->
        <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 class="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Info class="w-5 h-5" />
            Tips for Better Observations
          </h2>
          <ul class="text-sm text-blue-700 space-y-1 ml-7">
            <li>• Include clear photos or high-quality audio recordings</li>
            <li>• Note the exact location and time of observation</li>
            <li>• Describe behavior, habitat, and weather conditions</li>
            <li>• Be as specific as possible with species identification</li>
          </ul>
        </div>

        <!-- Observation Form -->
        <div class="observation-form-container bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ObservationForm
            initialData={initialFormData}
            on:submit={handleFormSubmit}
            on:cancel={handleFormCancel}
            on:stepChanged={handleStepChanged}
          />
        </div>

        <!-- Quick Action Buttons -->
        <div class="mt-8 flex flex-wrap gap-4 justify-center">
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Camera class="w-8 h-8 text-blue-600" />
            </div>
            <p class="text-sm font-medium text-gray-700">Visual Observation</p>
            <p class="text-xs text-gray-500">Photos & sightings</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Mic class="w-8 h-8 text-green-600" />
            </div>
            <p class="text-sm font-medium text-gray-700">Audio Observation</p>
            <p class="text-xs text-gray-500">Sounds & calls</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
              <MapPin class="w-8 h-8 text-purple-600" />
            </div>
            <p class="text-sm font-medium text-gray-700">Location Data</p>
            <p class="text-xs text-gray-500">GPS & habitat info</p>
          </div>
        </div>
      </div>
    </main>
  </div>

<!-- Authentication Required -->
{:else}
  <div class="auth-required min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
        <ArrowLeft class="w-8 h-8 text-green-600" />
      </div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
      <p class="text-gray-600 mb-4">You need to sign in to create observations.</p>
      <button
        on:click={() => goto('/auth/signin?redirect=/observations/new')}
        class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        Sign In to Continue
      </button>
    </div>
  </div>
{/if}

<!-- Loading Overlay -->
{#if isSubmitting}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p class="text-gray-700 font-medium">Creating your observation...</p>
      <p class="text-sm text-gray-500 mt-1">This may take a moment</p>
    </div>
  </div>
{/if}

<style>
  .observation-form-container {
    min-height: 600px;
  }

  @media (max-width: 768px) {
    .container {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* Custom animations */
  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Form styling improvements */
  .observation-form-container {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  /* Button hover effects */
  button {
    transition: all 0.2s ease-in-out;
  }

  button:hover {
    transform: translateY(-1px);
  }

  /* Responsive improvements */
  @media (max-width: 640px) {
    .quick-actions {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .quick-actions .text-center:last-child {
      grid-column: span 2;
    }
  }
</style>
