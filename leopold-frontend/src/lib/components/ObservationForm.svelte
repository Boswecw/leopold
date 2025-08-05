<!-- src/lib/components/ObservationForm.svelte -->
<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { Camera, Mic, MapPin, Search, Upload, X, CheckCircle, AlertCircle } from 'lucide-svelte';
    import AudioRecorder from './AudioRecorder.svelte';
    import ImageUpload from './ImageUpload.svelte';
    import LocationPicker from './LocationPicker.svelte';
    import SpeciesSelector from './SpeciesSelector.svelte';
    import { uiStore } from '$stores';
    import type { 
      ObservationType, 
      ObservationFormData, 
      AudioRecording, 
      Location,
      SpeciesSearchResult 
    } from '$lib/types';
  
    const dispatch = createEventDispatcher<{
      submit: ObservationFormData;
      cancel: void;
      typeChanged: ObservationType;
    }>();
  
    // Form state
    export let initialData: Partial<ObservationFormData> = {};
    
    let observationType: ObservationType = initialData.observation_type || 'visual';
    let speciesName = initialData.species_name || '';
    let description = initialData.description || '';
    let location: Location | null = initialData.location || null;
    let audioRecording: AudioRecording | null = null;
    let selectedImages: File[] = [];
    let weatherConditions = '';
    let habitatType = '';
    let callType = '';
    let confidence = 3;
  
    // UI state
    let currentStep = 1;
    let totalSteps = 5;
    let isSubmitting = false;
    let validationErrors: Record<string, string> = {};
    let selectedSpecies: SpeciesSearchResult | null = null;
  
    // Reactive validation
    $: isValid = validateForm();
    $: hasMedia = (observationType === 'visual' && selectedImages.length > 0) ||
                  (observationType === 'audio' && audioRecording) ||
                  (observationType === 'multi-modal' && selectedImages.length > 0 && audioRecording);
  
    onMount(() => {
      // Auto-detect location if available
      if (navigator.geolocation && !location) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
          },
          (error) => {
            console.warn('Location detection failed:', error);
          }
        );
      }
    });
  
    function validateForm(): boolean {
      validationErrors = {};
  
      // Observation type validation
      if (!observationType) {
        validationErrors.observationType = 'Please select an observation type';
      }
  
      // Media validation
      if (!hasMedia) {
        if (observationType === 'visual' || observationType === 'multi-modal') {
          validationErrors.images = 'At least one image is required';
        }
        if (observationType === 'audio' || observationType === 'multi-modal') {
          validationErrors.audio = 'Audio recording is required';
        }
      }
  
      // Location validation
      if (!location) {
        validationErrors.location = 'Location is required';
      }
  
      // Species validation (optional but recommended)
      if (!speciesName.trim()) {
        validationErrors.species = 'Species identification helps with research';
      }
  
      return Object.keys(validationErrors).length === 0;
    }
  
    function handleObservationTypeChange(newType: ObservationType) {
      observationType = newType;
      dispatch('typeChanged', newType);
      
      // Auto-advance to next step
      if (currentStep === 1) {
        currentStep = 2;
      }
    }
  
    function handleAudioRecording(event: CustomEvent<AudioRecording>) {
      audioRecording = event.detail;
      
      // Auto-switch to audio or multi-modal if not already selected
      if (observationType === 'visual' && !selectedImages.length) {
        handleObservationTypeChange('audio');
      } else if (observationType === 'visual' && selectedImages.length > 0) {
        handleObservationTypeChange('multi-modal');
      }
    }
  
    function handleImageUpload(event: CustomEvent<File[]>) {
      selectedImages = event.detail;
      
      // Auto-switch to visual or multi-modal if not already selected
      if (observationType === 'audio' && !audioRecording) {
        handleObservationTypeChange('visual');
      } else if (observationType === 'audio' && audioRecording) {
        handleObservationTypeChange('multi-modal');
      }
    }
  
    function handleLocationSelect(event: CustomEvent<Location>) {
      location = event.detail;
    }
  
    function handleSpeciesSelect(event: CustomEvent<SpeciesSearchResult>) {
      selectedSpecies = event.detail;
      speciesName = event.detail.common_name;
    }
  
    function nextStep() {
      if (currentStep < totalSteps) {
        currentStep++;
      }
    }
  
    function prevStep() {
      if (currentStep > 1) {
        currentStep--;
      }
    }
  
    async function submitForm() {
      if (!isValid || isSubmitting) return;
  
      isSubmitting = true;
      uiStore.setLoading('loading');
  
      try {
        const formData: ObservationFormData = {
          observation_type: observationType,
          species_name: speciesName,
          description: description.trim(),
          location: location!,
          audio_recording: audioRecording || undefined,
          images: selectedImages.length > 0 ? selectedImages : undefined,
          weather_conditions: weatherConditions.trim() || undefined,
          habitat_type: habitatType.trim() || undefined,
          call_type: callType.trim() || undefined,
          confidence
        };
  
        dispatch('submit', formData);
        
        uiStore.showNotification('success', 'Observation submitted successfully!');
        resetForm();
        
      } catch (error) {
        console.error('Form submission error:', error);
        uiStore.showNotification('error', 'Failed to submit observation. Please try again.');
      } finally {
        isSubmitting = false;
        uiStore.setLoading('idle');
      }
    }
  
    function resetForm() {
      observationType = 'visual';
      speciesName = '';
      description = '';
      location = null;
      audioRecording = null;
      selectedImages = [];
      weatherConditions = '';
      habitatType = '';
      callType = '';
      confidence = 3;
      currentStep = 1;
      selectedSpecies = null;
      validationErrors = {};
    }
  
    function cancelForm() {
      resetForm();
      dispatch('cancel');
    }
  
    function getStepTitle(step: number): string {
      switch (step) {
        case 1: return 'Observation Type';
        case 2: return 'Media Capture';
        case 3: return 'Location & Species';
        case 4: return 'Additional Details';
        case 5: return 'Review & Submit';
        default: return 'Step ' + step;
      }
    }
  </script>
  
  <!-- Observation Form Component -->
  <div class="observation-form max-w-4xl mx-auto bg-white rounded-xl shadow-nature-lg border border-primary-forest/10">
    <!-- Form Header -->
    <div class="form-header bg-gradient-to-r from-primary-forest to-primary-sky text-white p-6 rounded-t-xl">
      <h2 class="text-2xl font-bold mb-2">🌿 Record New Observation</h2>
      <p class="text-primary-sky/80">Contribute to wildlife research and conservation</p>
      
      <!-- Progress Bar -->
      <div class="progress-bar mt-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm">Step {currentStep} of {totalSteps}</span>
          <span class="text-sm">{getStepTitle(currentStep)}</span>
        </div>
        <div class="progress-track bg-white/20 rounded-full h-2">
          <div 
            class="progress-fill bg-secondary-goldenrod rounded-full h-2 transition-all duration-300"
            style="width: {(currentStep / totalSteps) * 100}%"
          ></div>
        </div>
      </div>
    </div>
  
    <!-- Form Content -->
    <div class="form-content p-6">
      <!-- Step 1: Observation Type Selection -->
      {#if currentStep === 1}
        <div class="step step-type" in:slide="{{ duration: 300 }}">
          <h3 class="text-xl font-semibold text-primary-forest mb-4">What type of observation are you making?</h3>
          
          <div class="type-grid grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              class="type-option p-6 border-2 rounded-xl transition-all duration-200 {observationType === 'visual' ? 'border-primary-forest bg-primary-forest/5' : 'border-gray-200 hover:border-primary-forest/40'}"
              on:click={() => handleObservationTypeChange('visual')}
            >
              <Camera class="w-12 h-12 mx-auto mb-3 text-primary-forest" />
              <h4 class="font-semibold text-primary-forest mb-2">📷 Visual</h4>
              <p class="text-sm text-neutral-stone-gray">Photograph wildlife, plants, or nature scenes</p>
            </button>
            
            <button
              class="type-option p-6 border-2 rounded-xl transition-all duration-200 {observationType === 'audio' ? 'border-primary-forest bg-primary-forest/5' : 'border-gray-200 hover:border-primary-forest/40'}"
              on:click={() => handleObservationTypeChange('audio')}
            >
              <Mic class="w-12 h-12 mx-auto mb-3 text-primary-forest" />
              <h4 class="font-semibold text-primary-forest mb-2">🎵 Audio</h4>
              <p class="text-sm text-neutral-stone-gray">Record bird songs, frog calls, or nature sounds</p>
            </button>
            
            <button
              class="type-option p-6 border-2 rounded-xl transition-all duration-200 {observationType === 'multi-modal' ? 'border-primary-forest bg-primary-forest/5' : 'border-gray-200 hover:border-primary-forest/40'}"
              on:click={() => handleObservationTypeChange('multi-modal')}
            >
              <div class="flex justify-center mb-3">
                <Camera class="w-8 h-8 text-primary-forest" />
                <Mic class="w-8 h-8 text-primary-forest ml-1" />
              </div>
              <h4 class="font-semibold text-primary-forest mb-2">🎭 Multi-Modal</h4>
              <p class="text-sm text-neutral-stone-gray">Combine photos and audio for complete documentation</p>
            </button>
          </div>
  
          {#if validationErrors.observationType}
            <p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
              <AlertCircle class="w-4 h-4" />
              {validationErrors.observationType}
            </p>
          {/if}
        </div>
      {/if}
  
      <!-- Step 2: Media Capture -->
      {#if currentStep === 2}
        <div class="step step-media" in:slide="{{ duration: 300 }}">
          <h3 class="text-xl font-semibold text-primary-forest mb-4">Capture Your Observation</h3>
          
          <!-- Audio Recording Section -->
          {#if observationType === 'audio' || observationType === 'multi-modal'}
            <section class="audio-section mb-6">
              <h4 class="text-lg font-medium text-primary-forest mb-3 flex items-center gap-2">
                🎤 Audio Recording
              </h4>
              <p class="text-neutral-stone-gray mb-4">Record bird songs, frog calls, insect sounds, or mammal vocalizations</p>
              
              <AudioRecorder 
                maxDuration={60}
                enableVisualization={true}
                showWaveform={true}
                showSpectrogram={true}
                on:recordingComplete={handleAudioRecording}
                on:error={(e) => uiStore.showNotification('error', e.detail.message)}
              />
              
              {#if validationErrors.audio}
                <p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle class="w-4 h-4" />
                  {validationErrors.audio}
                </p>
              {/if}
            </section>
          {/if}
  
          <!-- Image Upload Section -->
          {#if observationType === 'visual' || observationType === 'multi-modal'}
            <section class="image-section">
              <h4 class="text-lg font-medium text-primary-forest mb-3 flex items-center gap-2">
                📷 Visual Documentation
              </h4>
              <p class="text-neutral-stone-gray mb-4">Upload clear photos showing identifying features</p>
              
              <ImageUpload 
                maxFiles={5}
                acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxSizePerFile={10 * 1024 * 1024}
                on:filesSelected={handleImageUpload}
                on:error={(e) => uiStore.showNotification('error', e.detail.message)}
              />
              
              {#if validationErrors.images}
                <p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle class="w-4 h-4" />
                  {validationErrors.images}
                </p>
              {/if}
            </section>
          {/if}
        </div>
      {/if}
  
      <!-- Step 3: Location & Species -->
      {#if currentStep === 3}
        <div class="step step-location-species" in:slide="{{ duration: 300 }}">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Location Section -->
            <section class="location-section">
              <h4 class="text-lg font-medium text-primary-forest mb-3 flex items-center gap-2">
                📍 Location
              </h4>
              <p class="text-neutral-stone-gray mb-4">Where did you make this observation?</p>
              
              <LocationPicker 
                initialLocation={location}
                enableGPS={true}
                showMap={true}
                on:locationSelected={handleLocationSelect}
              />
              
              {#if validationErrors.location}
                <p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle class="w-4 h-4" />
                  {validationErrors.location}
                </p>
              {/if}
            </section>
  
            <!-- Species Section -->
            <section class="species-section">
              <h4 class="text-lg font-medium text-primary-forest mb-3 flex items-center gap-2">
                🦋 Species Identification
              </h4>
              <p class="text-neutral-stone-gray mb-4">Help identify the species (optional but valuable for research)</p>
              
              <SpeciesSelector 
                observationType={observationType}
                location={location}
                audioFeatures={audioRecording?.spectrogram_data}
                on:speciesSelected={handleSpeciesSelect}
              />
              
              <!-- Manual species input -->
              <div class="manual-input mt-4">
                <label for="species-name" class="block text-sm font-medium text-neutral-stone-gray mb-2">
                  Or enter species name manually:
                </label>
                <input
                  id="species-name"
                  type="text"
                  bind:value={speciesName}
                  placeholder="e.g., American Robin, Red-eyed Tree Frog"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                />
              </div>
              
              {#if validationErrors.species}
                <p class="warning-message text-secondary-goldenrod text-sm mt-2 flex items-center gap-1">
                  <AlertCircle class="w-4 h-4" />
                  {validationErrors.species}
                </p>
              {/if}
            </section>
          </div>
        </div>
      {/if}
  
      <!-- Step 4: Additional Details -->
      {#if currentStep === 4}
        <div class="step step-details" in:slide="{{ duration: 300 }}">
          <h3 class="text-xl font-semibold text-primary-forest mb-4">Additional Details</h3>
          <p class="text-neutral-stone-gray mb-6">Provide context to help with species identification and research</p>
          
          <div class="details-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Description -->
            <div class="col-span-2">
              <label for="description" class="block text-sm font-medium text-neutral-stone-gray mb-2">
                Description
              </label>
              <textarea
                id="description"
                bind:value={description}
                placeholder="Describe behavior, appearance, habitat, or any notable observations..."
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent resize-none"
              ></textarea>
            </div>
  
            <!-- Weather Conditions -->
            <div>
              <label for="weather" class="block text-sm font-medium text-neutral-stone-gray mb-2">
                Weather Conditions
              </label>
              <select
                id="weather"
                bind:value={weatherConditions}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
              >
                <option value="">Select weather...</option>
                <option value="sunny">☀️ Sunny</option>
                <option value="partly-cloudy">⛅ Partly Cloudy</option>
                <option value="cloudy">☁️ Cloudy</option>
                <option value="rainy">🌧️ Rainy</option>
                <option value="foggy">🌫️ Foggy</option>
                <option value="windy">💨 Windy</option>
              </select>
            </div>
  
            <!-- Habitat Type -->
            <div>
              <label for="habitat" class="block text-sm font-medium text-neutral-stone-gray mb-2">
                Habitat Type
              </label>
              <select
                id="habitat"
                bind:value={habitatType}
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
              >
                <option value="">Select habitat...</option>
                <option value="forest">🌲 Forest</option>
                <option value="wetland">🏞️ Wetland</option>
                <option value="grassland">🌾 Grassland</option>
                <option value="urban">🏙️ Urban</option>
                <option value="coastal">🏖️ Coastal</option>
                <option value="mountain">⛰️ Mountain</option>
                <option value="desert">🏜️ Desert</option>
              </select>
            </div>
  
            <!-- Call Type (for audio observations) -->
            {#if observationType === 'audio' || observationType === 'multi-modal'}
              <div>
                <label for="call-type" class="block text-sm font-medium text-neutral-stone-gray mb-2">
                  Call/Sound Type
                </label>
                <select
                  id="call-type"
                  bind:value={callType}
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-transparent"
                >
                  <option value="">Select call type...</option>
                  <option value="song">🎵 Song</option>
                  <option value="call">📢 Call</option>
                  <option value="alarm">⚠️ Alarm</option>
                  <option value="territorial">🚩 Territorial</option>
                  <option value="mating">❤️ Mating</option>
                  <option value="contact">📞 Contact</option>
                </select>
              </div>
            {/if}
  
            <!-- Confidence Level -->
            <div>
              <label for="confidence" class="block text-sm font-medium text-neutral-stone-gray mb-2">
                Confidence Level: {confidence}/5
              </label>
              <input
                id="confidence"
                type="range"
                min="1"
                max="5"
                bind:value={confidence}
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div class="flex justify-between text-xs text-neutral-stone-gray mt-1">
                <span>Uncertain</span>
                <span>Very Confident</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
  
      <!-- Step 5: Review & Submit -->
      {#if currentStep === 5}
        <div class="step step-review" in:slide="{{ duration: 300 }}">
          <h3 class="text-xl font-semibold text-primary-forest mb-4">Review Your Observation</h3>
          <p class="text-neutral-stone-gray mb-6">Please review your observation before submitting</p>
          
          <div class="review-summary bg-neutral-off-white border border-primary-forest/10 rounded-lg p-6">
            <div class="summary-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Basic Info -->
              <div>
                <h4 class="font-medium text-primary-forest mb-3">Basic Information</h4>
                <dl class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <dt class="text-neutral-stone-gray">Type:</dt>
                    <dd class="font-medium capitalize">{observationType}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-neutral-stone-gray">Species:</dt>
                    <dd class="font-medium">{speciesName || 'Not specified'}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-neutral-stone-gray">Confidence:</dt>
                    <dd class="font-medium">{confidence}/5</dd>
                  </div>
                </dl>
              </div>
  
              <!-- Media Summary -->
              <div>
                <h4 class="font-medium text-primary-forest mb-3">Media</h4>
                <div class="space-y-2 text-sm">
                  {#if selectedImages.length > 0}
                    <p class="flex items-center gap-2">
                      <Camera class="w-4 h-4" />
                      {selectedImages.length} image(s)
                    </p>
                  {/if}
                  {#if audioRecording}
                    <p class="flex items-center gap-2">
                      <Mic class="w-4 h-4" />
                      Audio recording ({audioRecording.duration.toFixed(1)}s)
                    </p>
                  {/if}
                </div>
              </div>
  
              <!-- Location -->
              <div>
                <h4 class="font-medium text-primary-forest mb-3">Location</h4>
                {#if location}
                  <p class="text-sm text-neutral-stone-gray">
                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    {#if location.region}
                      <br />{location.region}
                    {/if}
                  </p>
                {/if}
              </div>
  
              <!-- Environmental Context -->
              <div>
                <h4 class="font-medium text-primary-forest mb-3">Environment</h4>
                <dl class="space-y-1 text-sm">
                  {#if weatherConditions}
                    <div class="flex justify-between">
                      <dt class="text-neutral-stone-gray">Weather:</dt>
                      <dd class="capitalize">{weatherConditions}</dd>
                    </div>
                  {/if}
                  {#if habitatType}
                    <div class="flex justify-between">
                      <dt class="text-neutral-stone-gray">Habitat:</dt>
                      <dd class="capitalize">{habitatType}</dd>
                    </div>
                  {/if}
                  {#if callType}
                    <div class="flex justify-between">
                      <dt class="text-neutral-stone-gray">Call Type:</dt>
                      <dd class="capitalize">{callType}</dd>
                    </div>
                  {/if}
                </dl>
              </div>
            </div>
  
            {#if description}
              <div class="mt-6 pt-6 border-t border-primary-forest/10">
                <h4 class="font-medium text-primary-forest mb-2">Description</h4>
                <p class="text-sm text-neutral-stone-gray">{description}</p>
              </div>
            {/if}
          </div>
  
          <!-- Validation Errors -->
          {#if !isValid}
            <div class="validation-errors mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 class="font-medium text-red-700 mb-2 flex items-center gap-2">
                <AlertCircle class="w-4 h-4" />
                Please fix the following issues:
              </h4>
              <ul class="text-sm text-red-600 space-y-1">
                {#each Object.values(validationErrors) as error}
                  <li>• {error}</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  
    <!-- Form Footer -->
    <div class="form-footer bg-neutral-off-white border-t border-primary-forest/10 p-6 rounded-b-xl">
      <div class="flex justify-between items-center">
        <!-- Previous Button -->
        <button
          type="button"
          on:click={prevStep}
          disabled={currentStep === 1}
          class="prev-btn px-6 py-2 border border-gray-300 text-neutral-stone-gray rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
  
        <!-- Step Navigation -->
        <div class="step-dots flex gap-2">
          {#each Array(totalSteps) as _, i}
            <button
              class="step-dot w-3 h-3 rounded-full transition-colors {i + 1 === currentStep ? 'bg-primary-forest' : i + 1 < currentStep ? 'bg-secondary-goldenrod' : 'bg-gray-300'}"
              on:click={() => currentStep = i + 1}
              aria-label="Go to step {i + 1}"
            ></button>
          {/each}
        </div>
  
        <!-- Next/Submit Button -->
        {#if currentStep < totalSteps}
          <button
            type="button"
            on:click={nextStep}
            disabled={currentStep === 2 && !hasMedia}
            class="next-btn px-6 py-2 bg-primary-forest text-white rounded-lg hover:bg-primary-forest/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        {:else}
          <button
            type="button"
            on:click={submitForm}
            disabled={!isValid || isSubmitting}
            class="submit-btn px-8 py-2 bg-secondary-goldenrod text-white rounded-lg hover:bg-secondary-goldenrod/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {#if isSubmitting}
              <div class="spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            {:else}
              <CheckCircle class="w-4 h-4" />
              Submit Observation
            {/if}
          </button>
        {/if}
      </div>
  
      <!-- Cancel Button -->
      <div class="mt-4 text-center">
        <button
          type="button"
          on:click={cancelForm}
          class="cancel-btn text-sm text-neutral-stone-gray hover:text-red-600 transition-colors"
        >
          Cancel and Clear Form
        </button>
      </div>
    </div>
  </div>
  
  <style>
    /* Step transitions */
    .step {
      animation: fadeInUp 0.3s ease-out;
    }
  
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    /* Custom range slider */
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #2F5D50;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  
    .slider::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #2F5D50;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  
    /* Responsive design */
    @media (max-width: 768px) {
      .type-grid {
        grid-template-columns: 1fr;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
      }
      
      .summary-grid {
        grid-template-columns: 1fr;
      }
      
      .form-footer {
        flex-direction: column;
        gap: 1rem;
      }
      
      .step-dots {
        order: -1;
      }
    }
  
    /* High contrast support */
    @media (prefers-contrast: high) {
      .type-option {
        border-width: 3px;
      }
      
      .form-header,
      .submit-btn,
      .next-btn {
        border: 2px solid currentColor;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .step,
      .type-option,
      .next-btn,
      .submit-btn {
        animation: none;
        transition: none;
      }
      
      .progress-fill {
        transition: none;
      }
    }
  </style>