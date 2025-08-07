<script lang="ts">
	import { slide } from 'svelte/transition';
	import { onMount, createEventDispatcher } from 'svelte';
	import { Camera, Mic, AlertCircle, CheckCircle } from 'lucide-svelte';
	import AudioRecorder from './AudioRecorder.svelte';
	import ImageUpload from './ImageUpload.svelte';
	import LocationPicker from './LocationPicker.svelte';
	import SpeciesSelector from './SpeciesSelector.svelte';
	import { uiStore } from '$lib/stores';
	import type {
	  ObservationType,
	  ObservationFormData,
	  Location,
	  AudioRecording,
	  SpeciesSearchResult
	} from '$lib/types';
	import { validateObservationForm } from '$lib/utils/validation';
  
	// Props
	export let initialData: Partial<ObservationFormData> = {};
  
	// Form state
	let currentStep = 1;
	const totalSteps = 5;
	let isSubmitting = false;
  
	// Form data
	let observationType: ObservationType = initialData.observation_type || 'visual';
	let location: Location | undefined = initialData.location || undefined;
	let selectedImages: File[] = initialData.images || [];
	let audioRecording: AudioRecording | null = initialData.audio_recording || null;
	let selectedSpecies: SpeciesSearchResult | null = null;
	let notes = initialData.notes || '';
	let description = initialData.description || '';
	let count = initialData.count || 1;
	let confidence = initialData.confidence || 3;
	let weatherConditions = initialData.weather_conditions || '';
	let habitatDescription = initialData.habitat_description || '';
	let behaviorNotes = initialData.behavior_notes || '';
	let tags: string[] = initialData.tags || [];
  
	// Validation
	let validationErrors: Record<string, string> = {};
	let currentStepValid = false;
  
	// Event dispatcher
	const dispatch = createEventDispatcher<{
	  submit: ObservationFormData;
	  cancel: void;
	  stepChanged: { step: number; isValid: boolean };
	}>();
  
	// Initialize form
	onMount(() => {
	  validateCurrentStep();
	  if (initialData.species_name) {
		// Create a mock selected species from initial data
		selectedSpecies = {
		  id: 'unknown',
		  common_name: initialData.species_name,
		  scientific_name: initialData.scientific_name || '',
		  taxonomy: {
			kingdom: 'Unknown',
			phylum: 'Unknown',
			class: 'Unknown',
			order: 'Unknown',
			family: 'Unknown',
			genus: 'Unknown',
			species: 'unknown'
		  },
		  habitat_types: [],
		  conservation_status: undefined
		};
	  }
	});
  
	// Validate current step
	function validateCurrentStep() {
	  validationErrors = {};
	  currentStepValid = true;
  
	  switch (currentStep) {
		case 1: // Observation Type
		  if (!observationType) {
			validationErrors.observationType = 'Please select an observation type';
			currentStepValid = false;
		  }
		  break;
  
		case 2: // Media Capture
		  if (observationType === 'visual' && selectedImages.length === 0) {
			validationErrors.images = 'Visual observations require at least one image';
			currentStepValid = false;
		  }
		  if (observationType === 'audio' && !audioRecording) {
			validationErrors.audio = 'Audio observations require an audio recording';
			currentStepValid = false;
		  }
		  if (observationType === 'multi-modal' && selectedImages.length === 0 && !audioRecording) {
			validationErrors.media = 'Multi-modal observations require images or audio';
			currentStepValid = false;
		  }
		  break;
  
		case 3: // Location & Species
		  if (!location) {
			validationErrors.location = 'Location is required';
			currentStepValid = false;
		  }
		  if (!selectedSpecies) {
			validationErrors.species = 'Species identification is required';
			currentStepValid = false;
		  }
		  break;
  
		case 4: // Additional Details
		  // All fields are optional, so this step is always valid
		  break;
  
		case 5: // Review
		  // Validate entire form
		  const formData: Partial<ObservationFormData> = {
			observation_type: observationType,
			species_name: selectedSpecies?.common_name || '',
			scientific_name: selectedSpecies?.scientific_name,
			location,
			images: selectedImages.length > 0 ? selectedImages : undefined,
			audio_recording: audioRecording || undefined,
			notes: notes.trim() || undefined,
			description: description.trim() || undefined,
			count,
			confidence,
			weather_conditions: weatherConditions.trim() || undefined,
			habitat_description: habitatDescription.trim() || undefined,
			behavior_notes: behaviorNotes.trim() || undefined,
			tags: tags.length > 0 ? tags : undefined
		  };
  
		  const validation = validateObservationForm(formData);
		  if (!validation.isValid) {
			validationErrors = validation.errors;
			currentStepValid = false;
		  }
		  break;
	  }
  
	  dispatch('stepChanged', { step: currentStep, isValid: currentStepValid });
	}
  
	// Navigation functions
	function nextStep() {
	  if (currentStepValid && currentStep < totalSteps) {
		currentStep++;
		validateCurrentStep();
	  }
	}
  
	function previousStep() {
	  if (currentStep > 1) {
		currentStep--;
		validateCurrentStep();
	  }
	}
  
	function goToStep(step: number) {
	  if (step >= 1 && step <= totalSteps) {
		currentStep = step;
		validateCurrentStep();
	  }
	}
  
	// Form submission
	async function handleSubmit() {
	  if (!currentStepValid) return;
  
	  isSubmitting = true;
	  uiStore.setLoading(true);
  
	  try {
		const formData: ObservationFormData = {
		  observation_type: observationType,
		  species_name: selectedSpecies?.common_name || '',
		  scientific_name: selectedSpecies?.scientific_name,
		  location: location!,
		  images: selectedImages.length > 0 ? selectedImages : undefined,
		  audio_recording: audioRecording || undefined,
		  notes: notes.trim() || undefined,
		  description: description.trim() || undefined,
		  count,
		  confidence,
		  weather_conditions: weatherConditions.trim() || undefined,
		  habitat_description: habitatDescription.trim() || undefined,
		  behavior_notes: behaviorNotes.trim() || undefined,
		  tags: tags.length > 0 ? tags : undefined
		};
  
		dispatch('submit', formData);
	  } catch (error) {
		console.error('Form submission error:', error);
		uiStore.showNotification('error', 'Failed to submit observation. Please try again.');
	  } finally {
		isSubmitting = false;
		uiStore.setLoading(false);
	  }
	}
  
	// Event handlers
	function handleImageUpload(event: CustomEvent<File[]>) {
	  selectedImages = [...selectedImages, ...event.detail];
	  validateCurrentStep();
	}
  
	function handleImageError(event: CustomEvent<{ message: string }>) {
	  uiStore.showNotification('error', event.detail.message);
	}
  
	function handleImageRemoved(event: CustomEvent<{ file: File; index: number }>) {
	  selectedImages = selectedImages.filter((_, i) => i !== event.detail.index);
	  validateCurrentStep();
	}
  
	function handleAudioRecording(event: CustomEvent<AudioRecording>) {
	  audioRecording = event.detail;
	  validateCurrentStep();
	}
  
	function handleAudioCleared() {
	  audioRecording = null;
	  validateCurrentStep();
	}
  
	function handleLocationSelected(event: CustomEvent<Location>) {
	  location = event.detail;
	  validateCurrentStep();
	}
  
	function handleLocationCleared() {
	  location = undefined;
	  validateCurrentStep();
	}
  
	function handleSpeciesSelect(event: CustomEvent<SpeciesSearchResult>) {
	  selectedSpecies = event.detail;
	  validateCurrentStep();
	}
  
	function handleSpeciesCleared() {
	  selectedSpecies = null;
	  validateCurrentStep();
	}
  
	// Tag management
	function addTag(tag: string) {
	  const trimmedTag = tag.trim().toLowerCase();
	  if (trimmedTag && !tags.includes(trimmedTag)) {
		tags = [...tags, trimmedTag];
	  }
	}
  
	function removeTag(index: number) {
	  tags = tags.filter((_, i) => i !== index);
	}
  
	// Handle tag input
	function handleTagInput(event: KeyboardEvent) {
	  const target = event.target as HTMLInputElement;
	  if (event.key === 'Enter' && target.value.trim()) {
		event.preventDefault();
		addTag(target.value);
		target.value = '';
	  }
	}
  
	// Calculate progress percentage
	$: progressPercentage = (currentStep / totalSteps) * 100;
  
	// Reactive validation
	$: {
	  // Re-validate when key values change
	  observationType;
	  selectedImages;
	  audioRecording;
	  location;
	  selectedSpecies;
	  validateCurrentStep();
	}
  </script>
  
  <div class="observation-form">
	<!-- Progress Header -->
	<div class="progress-header mb-8">
	  <div class="flex justify-between items-center mb-4">
		<h2 class="text-2xl font-bold text-primary-forest">New Observation</h2>
		<div class="text-sm text-gray-500">
		  Step {currentStep} of {totalSteps}
		</div>
	  </div>
	  
	  <!-- Progress Bar -->
	  <div class="progress-bar w-full bg-gray-200 rounded-full h-2">
		<div 
		  class="bg-primary-forest h-2 rounded-full transition-all duration-300"
		  style="width: {progressPercentage}%"
		></div>
	  </div>
  
	  <!-- Step Indicators -->
	  <div class="step-indicators flex justify-between mt-4">
		{#each Array(totalSteps) as _, i}
		  <button
			type="button"
			on:click={() => goToStep(i + 1)}
			class="step-indicator flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors
			  {currentStep === i + 1 
				? 'bg-primary-forest text-white' 
				: currentStep > i + 1 
				  ? 'bg-green-600 text-white' 
				  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
		  >
			{#if currentStep > i + 1}
			  <CheckCircle class="w-4 h-4" />
			{:else}
			  {i + 1}
			{/if}
		  </button>
		{/each}
	  </div>
	</div>
  
	<!-- Step Content -->
	<div class="step-content">
	  <!-- Step 1: Observation Type -->
	  {#if currentStep === 1}
		<div class="step step-type" in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-4">What type of observation are you making?</h3>
		  
		  <div class="observation-types grid grid-cols-1 md:grid-cols-3 gap-4">
			<label class="observation-type-card">
			  <input
				type="radio"
				bind:group={observationType}
				value="visual"
				class="sr-only"
			  />
			  <div class="card p-6 border-2 rounded-lg cursor-pointer transition-all
				{observationType === 'visual' 
				  ? 'border-primary-forest bg-primary-forest/5' 
				  : 'border-gray-200 hover:border-primary-forest/50'}"
			  >
				<Camera class="w-12 h-12 mx-auto mb-3 text-primary-forest" />
				<h4 class="font-semibold text-primary-forest mb-2">📷 Visual</h4>
				<p class="text-sm text-gray-600">Photograph-based observations using images</p>
			  </div>
			</label>
  
			<label class="observation-type-card">
			  <input
				type="radio"
				bind:group={observationType}
				value="audio"
				class="sr-only"
			  />
			  <div class="card p-6 border-2 rounded-lg cursor-pointer transition-all
				{observationType === 'audio' 
				  ? 'border-primary-forest bg-primary-forest/5' 
				  : 'border-gray-200 hover:border-primary-forest/50'}"
			  >
				<Mic class="w-12 h-12 mx-auto mb-3 text-primary-forest" />
				<h4 class="font-semibold text-primary-forest mb-2">🎵 Audio</h4>
				<p class="text-sm text-gray-600">Sound-based observations using audio recordings</p>
			  </div>
			</label>
  
			<label class="observation-type-card">
			  <input
				type="radio"
				bind:group={observationType}
				value="multi-modal"
				class="sr-only"
			  />
			  <div class="card p-6 border-2 rounded-lg cursor-pointer transition-all
				{observationType === 'multi-modal' 
				  ? 'border-primary-forest bg-primary-forest/5' 
				  : 'border-gray-200 hover:border-primary-forest/50'}"
			  >
				<div class="flex justify-center mb-3">
				  <Camera class="w-8 h-8 text-primary-forest" />
				  <Mic class="w-8 h-8 text-primary-forest ml-1" />
				</div>
				<h4 class="font-semibold text-primary-forest mb-2">🎬 Multi-modal</h4>
				<p class="text-sm text-gray-600">Combine both visual and audio elements</p>
			  </div>
			</label>
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
		<div class="step step-media" in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-4">Capture Your Observation</h3>
		  
		  <div class="media-capture space-y-6">
			<!-- Visual Capture -->
			{#if observationType === 'visual' || observationType === 'multi-modal'}
			  <div class="image-section">
				<ImageUpload
				  bind:files={selectedImages}
				  maxFiles={5}
				  required={observationType === 'visual'}
				  label="Images"
				  on:filesSelected={handleImageUpload}
				  on:fileRemoved={handleImageRemoved}
				  on:error={handleImageError}
				/>
				
				{#if validationErrors.images}
				  <p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
					<AlertCircle class="w-4 h-4" />
					{validationErrors.images}
				  </p>
				{/if}
			  </div>
			{/if}
  
			<!-- Audio Capture -->
			{#if observationType === 'audio' || observationType === 'multi-modal'}
			  <div class="audio-section">
				<AudioRecorder
				  bind:recording={audioRecording}
				  maxDuration={300}
				  required={observationType === 'audio'}
				  on:recordingStopped={handleAudioRecording}
				  on:recordingCleared={handleAudioCleared}
				/>
				
				{#if validationErrors.audio}
				  <p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
					<AlertCircle class="w-4 h-4" />
					{validationErrors.audio}
				  </p>
				{/if}
			  </div>
			{/if}
  
			{#if validationErrors.media}
			  <p class="error-message text-red-600 text-sm flex items-center gap-1">
				<AlertCircle class="w-4 h-4" />
				{validationErrors.media}
			  </p>
			{/if}
		  </div>
		</div>
	  {/if}
  
	  <!-- Step 3: Location & Species -->
	  {#if currentStep === 3}
		<div class="step step-location-species" in:slide={{ duration: 300 }}>
		  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Location Picker -->
			<div class="location-section">
			  <LocationPicker
				bind:location
				required={true}
				on:locationSelected={handleLocationSelected}
				on:locationCleared={handleLocationCleared}
			  />
			  
			  {#if validationErrors.location}
				<p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
				  <AlertCircle class="w-4 h-4" />
				  {validationErrors.location}
				</p>
			  {/if}
			</div>
  
			<!-- Species Selector -->
			<div class="species-section">
			  <SpeciesSelector
				bind:selectedSpecies
				{location}
				{observationType}
				audioFeatures={audioRecording?.spectrogram_data?.frequency_data?.[0]}
				on:speciesSelected={handleSpeciesSelect}
				on:speciesCleared={handleSpeciesCleared}
			  />
			  
			  {#if validationErrors.species}
				<p class="error-message text-red-600 text-sm mt-2 flex items-center gap-1">
				  <AlertCircle class="w-4 h-4" />
				  {validationErrors.species}
				</p>
			  {/if}
			</div>
		  </div>
		</div>
	  {/if}
  
	  <!-- Step 4: Additional Details -->
	  {#if currentStep === 4}
		<div class="step step-details" in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-4">Additional Details</h3>
		  
		  <div class="details-form space-y-6">
			<!-- Basic Details -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			  <div>
				<label for="count" class="block text-sm font-medium text-gray-700 mb-2">
				  Number of Individuals
				</label>
				<input
				  id="count"
				  type="number"
				  bind:value={count}
				  min="1"
				  max="1000"
				  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
				/>
			  </div>
  
			  <div>
				<label for="confidence" class="block text-sm font-medium text-gray-700 mb-2">
				  Identification Confidence (1-5)
				</label>
				<select
				  id="confidence"
				  bind:value={confidence}
				  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
				>
				  <option value={1}>1 - Very Uncertain</option>
				  <option value={2}>2 - Somewhat Uncertain</option>
				  <option value={3}>3 - Moderately Confident</option>
				  <option value={4}>4 - Very Confident</option>
				  <option value={5}>5 - Absolutely Certain</option>
				</select>
			  </div>
			</div>
  
			<!-- Description -->
			<div>
			  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
				Description
			  </label>
			  <textarea
				id="description"
				bind:value={description}
				rows="3"
				placeholder="Describe what you observed (appearance, behavior, etc.)"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
			  ></textarea>
			</div>
  
			<!-- Environmental Conditions -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			  <div>
				<label for="weather" class="block text-sm font-medium text-gray-700 mb-2">
				  Weather Conditions
				</label>
				<input
				  id="weather"
				  type="text"
				  bind:value={weatherConditions}
				  placeholder="e.g., sunny, cloudy, rainy"
				  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
				/>
			  </div>
  
			  <div>
				<label for="habitat" class="block text-sm font-medium text-gray-700 mb-2">
				  Habitat Description
				</label>
				<input
				  id="habitat"
				  type="text"
				  bind:value={habitatDescription}
				  placeholder="e.g., oak forest, wetland, urban park"
				  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
				/>
			  </div>
			</div>
  
			<!-- Behavior Notes -->
			<div>
			  <label for="behavior" class="block text-sm font-medium text-gray-700 mb-2">
				Behavior Notes
			  </label>
			  <textarea
				id="behavior"
				bind:value={behaviorNotes}
				rows="2"
				placeholder="Describe any interesting behaviors you observed"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
			  ></textarea>
			</div>
  
			<!-- Tags -->
			<div>
			  <label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
				Tags
			  </label>
			  <div class="flex flex-wrap gap-2 mb-2">
				{#each tags as tag, index}
				  <span class="inline-flex items-center gap-1 px-2 py-1 bg-primary-forest/10 text-primary-forest text-sm rounded-full">
					{tag}
					<button
					  type="button"
					  on:click={() => removeTag(index)}
					  class="hover:text-red-600"
					>
					  ×
					</button>
				  </span>
				{/each}
			  </div>
			  <input
				type="text"
				placeholder="Add tags (press Enter to add)"
				on:keydown={handleTagInput}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
			  />
			</div>
  
			<!-- Additional Notes -->
			<div>
			  <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
				Additional Notes
			  </label>
			  <textarea
				id="notes"
				bind:value={notes}
				rows="4"
				placeholder="Any other observations or notes..."
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-forest focus:border-primary-forest"
			  ></textarea>
			</div>
		  </div>
		</div>
	  {/if}
  
	  <!-- Step 5: Review -->
	  {#if currentStep === 5}
		<div class="step step-review" in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-4">Review Your Observation</h3>
		  
		  <div class="review-content space-y-6">
			<!-- Observation Summary -->
			<div class="summary-card p-6 bg-gray-50 rounded-lg">
			  <h4 class="font-semibold text-gray-800 mb-4">Observation Summary</h4>
			  
			  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
				  <span class="text-sm text-gray-600">Type:</span>
				  <p class="font-medium capitalize">{observationType}</p>
				</div>
				
				<div>
				  <span class="text-sm text-gray-600">Species:</span>
				  <p class="font-medium">{selectedSpecies?.common_name}</p>
				  {#if selectedSpecies?.scientific_name}
					<p class="text-sm italic text-gray-600">{selectedSpecies.scientific_name}</p>
				  {/if}
				</div>
  
				<div>
				  <span class="text-sm text-gray-600">Location:</span>
				  <p class="font-medium">{location?.region || 'Selected location'}</p>
				  <p class="text-xs text-gray-500">
					{location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}
				  </p>
				</div>
  
				<div>
				  <span class="text-sm text-gray-600">Count:</span>
				  <p class="font-medium">{count} individual{count !== 1 ? 's' : ''}</p>
				</div>
			  </div>
			</div>
  
			<!-- Media Summary -->
			<div class="media-summary">
			  <h4 class="font-semibold text-gray-800 mb-3">Media</h4>
			  <div class="flex flex-wrap gap-4">
				{#if selectedImages.length > 0}
				  <div class="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
					<Camera class="w-4 h-4" />
					{selectedImages.length} image(s)
				  </div>
				{/if}
				
				{#if audioRecording}
				  <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
					<Mic class="w-4 h-4" />
					Audio recording ({audioRecording.duration.toFixed(1)}s)
				  </div>
				{/if}
			  </div>
			</div>
  
			<!-- Details Summary -->
			{#if description || weatherConditions || habitatDescription || behaviorNotes || tags.length > 0}
			  <div class="details-summary">
				<h4 class="font-semibold text-gray-800 mb-3">Additional Details</h4>
				
				{#if description}
				  <div class="mb-3">
					<span class="text-sm text-gray-600">Description:</span>
					<p class="text-gray-800">{description}</p>
				  </div>
				{/if}
  
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				  {#if weatherConditions}
					<div>
					  <span class="text-sm text-gray-600">Weather:</span>
					  <p class="text-gray-800">{weatherConditions}</p>
					</div>
				  {/if}
  
				  {#if habitatDescription}
					<div>
					  <span class="text-sm text-gray-600">Habitat:</span>
					  <p class="text-gray-800">{habitatDescription}</p>
					</div>
				  {/if}
				</div>
  
				{#if behaviorNotes}
				  <div class="mt-3">
					<span class="text-sm text-gray-600">Behavior:</span>
					<p class="text-gray-800">{behaviorNotes}</p>
				  </div>
				{/if}
  
				{#if tags.length > 0}
				  <div class="mt-3">
					<span class="text-sm text-gray-600">Tags:</span>
					<div class="flex flex-wrap gap-2 mt-1">
					  {#each tags as tag}
						<span class="px-2 py-1 bg-primary-forest/10 text-primary-forest text-sm rounded-full">
						  {tag}
						</span>
					  {/each}
					</div>
				  </div>
				{/if}
			  </div>
			{/if}
  
			{#if notes}
			  <div class="notes-summary">
				<h4 class="font-semibold text-gray-800 mb-3">Notes</h4>
				<p class="text-gray-700 whitespace-pre-wrap">{notes}</p>
			  </div>
			{/if}
		  </div>
  
		  <!-- Validation Errors -->
		  {#if !currentStepValid}
			<div class="validation-summary mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
			  <h4 class="font-medium text-red-700 mb-2 flex items-center gap-2">
				<AlertCircle class="w-4 h-4" />
				Please fix the following issues:
			  </h4>
			  <ul class="text-red-600 text-sm space-y-1">
				{#each Object.values(validationErrors) as error}
				  <li>• {error}</li>
				{/each}
			  </ul>
			</div>
		  {/if}
		</div>
	  {/if}
	</div>
  
	<!-- Navigation Buttons -->
	<div class="navigation-buttons flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
	  <div>
		{#if currentStep > 1}
		  <button
			type="button"
			on:click={previousStep}
			class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
		  >
			← Previous
		  </button>
		{/if}
	  </div>
  
	  <div class="flex gap-3">
		<button
		  type="button"
		  on:click={() => dispatch('cancel')}
		  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
		>
		  Cancel
		</button>
  
		{#if currentStep < totalSteps}
		  <button
			type="button"
			on:click={nextStep}
			disabled={!currentStepValid}
			class="flex items-center gap-2 px-6 py-2 bg-primary-forest text-white rounded-lg hover:bg-primary-forest/90 disabled:opacity-50 disabled:cursor-not-allowed"
		  >
			Next →
		  </button>
		{:else}
		  <button
			type="button"
			on:click={handleSubmit}
			disabled={!currentStepValid || isSubmitting}
			class="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
		  >
			{#if isSubmitting}
			  <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
			  Submitting...
			{:else}
			  <CheckCircle class="w-4 h-4" />
			  Submit Observation
			{/if}
		  </button>
		{/if}
	  </div>
	</div>
  </div>
  
  <style>
	.observation-form {
	  max-width: 4xl;
	  margin: 0 auto;
	}
  
	.step-indicators {
	  position: relative;
	}
  
	.step-indicators::before {
	  content: '';
	  position: absolute;
	  top: 50%;
	  left: 0;
	  right: 0;
	  height: 2px;
	  background-color: #e5e7eb;
	  z-index: -1;
	}
  
	.step-indicator {
	  background-color: white;
	  border: 2px solid;
	}
  
	.observation-type-card {
	  display: block;
	}
  
	.card {
	  height: 100%;
	  text-align: center;
	}
  
	.card:hover {
	  transform: translateY(-2px);
	  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
  
	.error-message {
	  animation: shake 0.5s ease-in-out;
	}
  
	@keyframes shake {
	  0%, 100% { transform: translateX(0); }
	  25% { transform: translateX(-5px); }
	  75% { transform: translateX(5px); }
	}
  
	/* Responsive adjustments */
	@media (max-width: 768px) {
	  .observation-types {
		grid-template-columns: 1fr;
	  }
	  
	  .step-indicators {
		justify-content: space-around;
	  }
	  
	  .navigation-buttons {
		flex-direction: column;
		gap: 1rem;
	  }
	}
  
	/* Focus styles */
	button:focus,
	input:focus,
	textarea:focus,
	select:focus {
	  outline: 2px solid #065f46;
	  outline-offset: 2px;
	}
  
	/* Animation for step transitions */
	.step {
	  min-height: 400px;
	}
  
	/* Summary card styling */
	.summary-card {
	  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	}
  
	/* Tag styling */
	.tags input {
	  border: none;
	  outline: none;
	  background: transparent;
	}
  
	/* Loading animation */
	@keyframes spin {
	  to {
		transform: rotate(360deg);
	  }
	}
  
	.animate-spin {
	  animation: spin 1s linear infinite;
	}
  </style>