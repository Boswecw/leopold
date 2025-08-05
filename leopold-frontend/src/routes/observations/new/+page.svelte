<!-- src/routes/observations/new/+page.svelte -->
<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import ObservationForm from '$lib/components/ObservationForm.svelte';
    import { authStore, observationsStore, uiStore } from '$lib/stores';
    import { ArrowLeft, Info, MapPin, Camera, Mic } from 'lucide-svelte';
    import type { ObservationFormData, Observation } from '$lib/types';
  
    // Check authentication
    $: currentUser = $authStore;
    $: if (!currentUser) {
      goto('/auth/signin?redirect=/observations/new');
    }
  
    // Page state
    let isSubmitting = false;
    let showGuide = false;
  
    onMount(() => {
      // Show guide for first-time users
      const hasSeenGuide = localStorage.getItem('leopold_observation_guide_seen');
      if (!hasSeenGuide) {
        showGuide = true;
      }
    });
  
    async function handleObservationSubmit(event: CustomEvent<ObservationFormData>) {
      if (!currentUser) return;
  
      const formData = event.detail;
      isSubmitting = true;
  
      try {
        // Create observation object
        const newObservation: Observation = {
          id: crypto.randomUUID(),
          user_id: currentUser.id,
          user: currentUser,
          species_name: formData.species_name || 'Unknown Species',
          scientific_name: undefined,
          observation_type: formData.observation_type,
          description: formData.description,
          image_urls: [], // Will be populated after upload
          audio_urls: [], // Will be populated after upload  
          spectrogram_urls: [],
          location: formData.location,
          observed_at: new Date().toISOString(),
          recording_duration: formData.audio_recording?.duration,
          confidence_level: formData.confidence || 3,
          weather_conditions: formData.weather_conditions,
          habitat_type: formData.habitat_type,
          call_type: formData.call_type,
          expert_verified: false,
          community_consensus: undefined,
          verification_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
  
        // Simulate API call to create observation
        await simulateObservationCreation(newObservation, formData);
  
        // Add to store
        observationsStore.add(newObservation);
  
        // Show success and redirect
        uiStore.showNotification('success', 'Observation submitted successfully! 🎉');
        
        // Redirect to observation detail or back to map
        goto(`/?highlight=${newObservation.id}`);
  
      } catch (error) {
        console.error('Failed to submit observation:', error);
        uiStore.showNotification('error', 'Failed to submit observation. Please try again.');
      } finally {
        isSubmitting = false;
      }
    }
  
    async function simulateObservationCreation(observation: Observation, formData: ObservationFormData) {
      // Simulate API processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
  
      // Simulate file uploads
      if (formData.images && formData.images.length > 0) {
        observation.image_urls = formData.images.map((_, index) => 
          `https://example.com/uploads/${observation.id}_image_${index}.jpg`
        );
      }
  
      if (formData.audio_recording) {
        observation.audio_urls = [`https://example.com/uploads/${observation.id}_audio.webm`];
        observation.spectrogram_urls = [`https://example.com/uploads/${observation.id}_spectrogram.jpg`];
        
        // Simulate AI audio analysis
        observation.audio_features = {
          dominant_frequency: Math.random() * 8000 + 1000, // 1000-9000 Hz
          frequency_range: [1000, 8000],
          spectral_centroid: Math.random() * 4000 + 2000,
          spectral_rolloff: Math.random() * 6000 + 3000,
          zero_crossing_rate: Math.random() * 0.3,
          mfccs: Array.from({ length: 13 }, () => Math.random() * 20 - 10),
          tempo: Math.random() * 200 + 60,
          duration: formData.audio_recording.duration,
          pattern_type: ['single', 'repetitive', 'complex'][Math.floor(Math.random() * 3)] as any,
          noise_ratio: Math.random() * 0.5,
          confidence: Math.random() * 0.4 + 0.6 // 0.6-1.0
        };
      }
  
      // Simulate AI species identification
      if (formData.species_name || formData.images?.length || formData.audio_recording) {
        observation.ai_predictions = {
          visual_predictions: formData.images?.length ? [{
            species_name: observation.species_name,
            scientific_name: 'Genus species',
            confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
            common_names: [observation.species_name],
            taxonomy: {
              kingdom: 'Animalia',
              phylum: 'Chordata',
              class: 'Aves',
              order: 'Passeriformes',
              family: 'Turdidae',
              genus: 'Turdus',
              species: 'species'
            }
          }] : undefined,
          audio_predictions: formData.audio_recording ? [{
            species_name: observation.species_name,
            scientific_name: 'Genus species',
            confidence: Math.random() * 0.3 + 0.7,
            common_names: [observation.species_name],
            taxonomy: {
              kingdom: 'Animalia',
              phylum: 'Chordata',
              class: 'Aves',
              order: 'Passeriformes',
              family: 'Turdidae',
              genus: 'Turdus',
              species: 'species'
            }
          }] : undefined,
          confidence: Math.random() * 3 + 7, // 7-10
          identification_method: observation.observation_type === 'multi-modal' ? 'multi-modal' : observation.observation_type,
          processing_time: Math.random() * 2000 + 500, // 0.5-2.5 seconds
          model_versions: {
            visual: observation.observation_type !== 'audio' ? 'vision-v2.1' : undefined,
            audio: observation.observation_type !== 'visual' ? 'audio-v1.8' : undefined,
            fusion: observation.observation_type === 'multi-modal' ? 'fusion-v1.3' : undefined
          }
        };
      }
    }
  
    function handleCancel() {
      goto('/');
    }
  
    function dismissGuide() {
      showGuide = false;
      localStorage.setItem('leopold_observation_guide_seen', 'true');
    }
  </script>
  
  <!-- New Observation Page -->
  <svelte:head>
    <title>New Observation - Leopold Nature Observer</title>
    <meta name="description" content="Record a new wildlife observation with photos, audio, and detailed information to contribute to community science." />
  </svelte:head>
  
  <div class="new-observation-page">
    <!-- Page Header -->
    <div class="page-header bg-gradient-to-r from-primary-forest to-primary-sky text-white rounded-lg p-6 mb-6">
      <div class="flex items-center gap-4 mb-4">
        <button
          type="button"
          on:click={() => goto('/')}
          class="back-btn p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          aria-label="Back to map"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        
        <div>
          <h1 class="text-2xl font-bold mb-1">Record New Observation</h1>
          <p class="text-primary-sky/80">Contribute to wildlife research and conservation</p>
        </div>
      </div>
  
      <!-- Quick Stats -->
      <div class="stats-bar flex items-center gap-6 text-sm">
        <div class="stat flex items-center gap-2">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <MapPin class="w-4 h-4" />
          </div>
          <span>Location Required</span>
        </div>
        <div class="stat flex items-center gap-2">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Camera class="w-4 h-4" />
          </div>
          <span>Photos or</span>
        </div>
        <div class="stat flex items-center gap-2">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Mic class="w-4 h-4" />
          </div>
          <span>Audio Recording</span>
        </div>
      </div>
    </div>
  
    <!-- Getting Started Guide -->
    {#if showGuide}
      <div class="guide-modal fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div class="guide-content bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div class="guide-header bg-gradient-to-r from-secondary-goldenrod to-secondary-moss text-white p-6">
            <h2 class="text-xl font-bold mb-2">🌿 Welcome to Leopold!</h2>
            <p>Your guide to recording meaningful wildlife observations</p>
          </div>
  
          <div class="guide-body p-6 space-y-6">
            <div class="guide-section">
              <h3 class="font-semibold text-primary-forest mb-3 flex items-center gap-2">
                <Camera class="w-5 h-5" />
                Visual Observations
              </h3>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>• Take clear, well-lit photos showing identifying features</li>
                <li>• Include multiple angles when possible</li>
                <li>• Capture the animal's habitat and behavior context</li>
                <li>• Avoid using flash as it may disturb wildlife</li>
              </ul>
            </div>
  
            <div class="guide-section">
              <h3 class="font-semibold text-primary-forest mb-3 flex items-center gap-2">
                <Mic class="w-5 h-5" />
                Audio Observations
              </h3>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>• Record in quiet environments when possible</li>
                <li>• Hold device steady and point toward sound source</li>
                <li>• Bird songs are best recorded at dawn and dusk</li>
                <li>• Include ambient sounds for context</li>
              </ul>
            </div>
  
            <div class="guide-section">
              <h3 class="font-semibold text-primary-forest mb-3 flex items-center gap-2">
                <MapPin class="w-5 h-5" />
                Location & Context
              </h3>
              <ul class="text-sm text-gray-600 space-y-2">
                <li>• Precise location helps with species verification</li>
                <li>• Note the habitat type (forest, wetland, urban, etc.)</li>
                <li>• Weather conditions can affect animal behavior</li>
                <li>• Time of day is important for activity patterns</li>
              </ul>
            </div>
  
            <div class="privacy-note bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-medium text-blue-800 mb-2">🔒 Privacy & Safety</h4>
              <p class="text-sm text-blue-700">
                Your observations help scientists track biodiversity and conservation efforts. 
                Location data is used for research purposes and can be made private if needed.
              </p>
            </div>
          </div>
  
          <div class="guide-footer bg-gray-50 px-6 py-4 flex justify-between items-center">
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" class="rounded border-gray-300 text-primary-forest" />
              Don't show this guide again
            </label>
            
            <button
              type="button"
              on:click={dismissGuide}
              class="px-6 py-2 bg-primary-forest text-white rounded-lg hover:bg-primary-forest/80 transition-colors"
            >
              Got it, let's start!
            </button>
          </div>
        </div>
      </div>
    {/if}
  
    <!-- Observation Form -->
    <div class="form-container">
      <ObservationForm
        on:submit={handleObservationSubmit}
        on:cancel={handleCancel}
        on:typeChanged={(e) => {
          // Could track form progress or provide dynamic tips
          console.log('Observation type changed to:', e.detail);
        }}
      />
    </div>
  
    <!-- Helpful Tips Sidebar -->
    <div class="tips-sidebar mt-8">
      <div class="bg-primary-sky/10 border border-primary-sky/20 rounded-lg p-6">
        <h3 class="font-semibold text-primary-forest mb-4 flex items-center gap-2">
          <Info class="w-5 h-5" />
          Observation Tips
        </h3>
        
        <div class="tips-content space-y-4">
          <div class="tip">
            <h4 class="font-medium text-primary-forest mb-2">🎯 Species Identification</h4>
            <p class="text-sm text-gray-600">
              Don't worry if you're not sure about the species name. Our AI will help identify 
              the animal or plant based on your photos and audio recordings. You can also 
              leave it as "Unknown" and the community will help!
            </p>
          </div>
  
          <div class="tip">
            <h4 class="font-medium text-primary-forest mb-2">📍 Location Accuracy</h4>
            <p class="text-sm text-gray-600">
              Precise location data helps researchers understand species distribution and 
              habitat preferences. If you're concerned about privacy, you can reduce the 
              precision in your profile settings.
            </p>
          </div>
  
          <div class="tip">
            <h4 class="font-medium text-primary-forest mb-2">🏆 Community Impact</h4>
            <p class="text-sm text-gray-600">
              Every observation contributes to scientific research and conservation efforts. 
              Your data helps track biodiversity changes, migration patterns, and ecosystem health.
            </p>
          </div>
  
          <div class="tip">
            <h4 class="font-medium text-primary-forest mb-2">⚡ Quick Tips</h4>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Morning hours (6-10 AM) are best for bird observations</li>
              <li>• After rain is excellent for amphibian activity</li>
              <li>• Dawn and dusk are prime times for mammal sightings</li>
              <li>• Flowers attract pollinators - great for insect observations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Loading Overlay -->
    {#if isSubmitting}
      <div class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div class="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md mx-4">
          <div class="spinner w-12 h-12 border-4 border-primary-forest/20 border-t-primary-forest rounded-full animate-spin mx-auto mb-4"></div>
          <h3 class="text-lg font-semibold text-primary-forest mb-2">Processing Your Observation</h3>
          <p class="text-sm text-gray-600 mb-4">
            We're analyzing your submission and running AI identification...
          </p>
          <div class="progress-steps text-xs text-gray-500 space-y-1">
            <div class="step">✓ Validating data</div>
            <div class="step">🔄 Uploading media files</div>
            <div class="step">🤖 Running AI analysis</div>
            <div class="step">📊 Generating insights</div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    /* Page-specific styling */
    .new-observation-page {
      max-width: 1200px;
      margin: 0 auto;
    }
  
    .guide-modal {
      backdrop-filter: blur(4px);
    }
  
    .guide-content {
      animation: slideUpFade 0.3s ease-out;
    }
  
    @keyframes slideUpFade {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    .stats-bar .stat {
      opacity: 0.9;
    }
  
    .tips-sidebar .tip {
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(47, 93, 80, 0.1);
    }
  
    .tips-sidebar .tip:last-child {
      padding-bottom: 0;
      border-bottom: none;
    }
  
    .progress-steps .step {
      padding: 0.25rem 0;
      opacity: 0.7;
      transition: opacity 0.3s ease;
    }
  
    .progress-steps .step:nth-child(2) {
      opacity: 1;
      color: #2F5D50;
    }
  
    /* Responsive design */
    @media (max-width: 768px) {
      .page-header {
        padding: 1rem;
      }
      
      .stats-bar {
        flex-direction: column;
        gap: 0.75rem;
        align-items: flex-start;
      }
      
      .guide-content {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
      }
      
      .tips-sidebar {
        margin-top: 2rem;
      }
    }
  
    /* High contrast support */
    @media (prefers-contrast: high) {
      .page-header,
      .tips-sidebar > div,
      .guide-content {
        border: 2px solid currentColor;
      }
      
      .back-btn {
        border: 1px solid currentColor;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .guide-content {
        animation: none;
      }
      
      .spinner {
        animation: none;
      }
      
      .progress-steps .step {
        transition: none;
      }
    }
  
    /* Print styles */
    @media print {
      .page-header,
      .tips-sidebar,
      .guide-modal {
        display: none !important;
      }
    }
  </style>