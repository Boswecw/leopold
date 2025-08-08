<!-- ObservationForm.svelte - IMPROVED VERSION -->
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
  
  <!-- Main Container -->
  <div class="max-w-4xl mx-auto p-6">
	<!-- Progress Header -->
	<div class="mb-8">
	  <div class="flex justify-between items-center mb-4">
		<h2 class="text-3xl font-bold text-primary-forest">New Observation</h2>
		<div class="text-sm text-neutral-stone-gray">
		  Step {currentStep} of {totalSteps}
		</div>
	  </div>
	  
	  <!-- Progress Bar -->
	  <div class="w-full bg-neutral-200 rounded-full h-2 mb-6">
		<div 
		  class="bg-primary-forest h-2 rounded-full transition-all duration-300"
		  style="width: {progressPercentage}%"
		></div>
	  </div>
  
	  <!-- Step Indicators -->
	  <div class="flex justify-between relative">
		<!-- Progress Line -->
		<div class="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 -z-10"></div>
		
		{#each Array(totalSteps) as _, i}
		  <button
			type="button"
			on:click={() => goToStep(i + 1)}
			class="step-indicator-btn flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 bg-white border-2
			  {currentStep === i + 1 
				? 'border-primary-forest bg-primary-forest text-white shadow-nature' 
				: currentStep > i + 1 
				  ? 'border-success bg-success text-white' 
				  : 'border-neutral-300 text-neutral-400 hover:border-primary-forest hover:text-primary-forest'}"
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
	<div class="min-h-[500px]">
	  <!-- Step 1: Observation Type -->
	  {#if currentStep === 1}
		<div in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-6">What type of observation are you making?</h3>
		  
		  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<label class="block cursor-pointer">
			  <input
				type="radio"
				bind:group={observationType}
				value="visual"
				class="sr-only"
			  />
			  <div class="card p-6 text-center border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-nature-lg
				{observationType === 'visual' 
				  ? 'border-primary-forest bg-primary-forest/5' 
				  : 'border-neutral-200 hover:border-primary-forest/50'}"
			  >
				<Camera class="w-12 h-12 mx-auto mb-3 text-primary-forest" />
				<h4 class="font-semibold text-primary-forest mb-2">📷 Visual</h4>
				<p class="text-sm text-neutral-stone-gray">Photograph-based observations using images</p>
			  </div>
			</label>
  
			<label class="block cursor-pointer">
			  <input
				type="radio"
				bind:group={observationType}
				value="audio"
				class="sr-only"
			  />
			  <div class="card p-6 text-center border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-nature-lg
				{observationType === 'audio' 
				  ? 'border-primary-forest bg-primary-forest/5' 
				  : 'border-neutral-200 hover:border-primary-forest/50'}"
			  >
				<Mic class="w-12 h-12 mx-auto mb-3 text-primary-forest" />
				<h4 class="font-semibold text-primary-forest mb-2">🎵 Audio</h4>
				<p class="text-sm text-neutral-stone-gray">Sound-based observations using audio recordings</p>
			  </div>
			</label>
  
			<label class="block cursor-pointer">
			  <input
				type="radio"
				bind:group={observationType}
				value="multi-modal"
				class="sr-only"
			  />
			  <div class="card p-6 text-center border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-nature-lg
				{observationType === 'multi-modal' 
				  ? 'border-primary-forest bg-primary-forest/5' 
				  : 'border-neutral-200 hover:border-primary-forest/50'}"
			  >
				<div class="flex justify-center mb-3">
				  <Camera class="w-8 h-8 text-primary-forest" />
				  <Mic class="w-8 h-8 text-primary-forest ml-1" />
				</div>
				<h4 class="font-semibold text-primary-forest mb-2">🎬 Multi-modal</h4>
				<p class="text-sm text-neutral-stone-gray">Combine both visual and audio elements</p>
			  </div>
			</label>
		  </div>
  
		  {#if validationErrors.observationType}
			<p class="form-error mt-4 flex items-center gap-2">
			  <AlertCircle class="w-4 h-4" />
			  {validationErrors.observationType}
			</p>
		  {/if}
		</div>
	  {/if}
  
	  <!-- Step 2: Media Capture -->
	  {#if currentStep === 2}
		<div in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-6">Capture Your Observation</h3>
		  
		  <div class="space-y-8">
			<!-- Visual Capture -->
			{#if observationType === 'visual' || observationType === 'multi-modal'}
			  <div class="card card-body">
				<h4 class="font-semibold text-primary-forest mb-4">Images</h4>
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
				  <p class="form-error mt-2 flex items-center gap-2">
					<AlertCircle class="w-4 h-4" />
					{validationErrors.images}
				  </p>
				{/if}
			  </div>
			{/if}
  
			<!-- Audio Capture -->
			{#if observationType === 'audio' || observationType === 'multi-modal'}
			  <div class="card card-body">
				<h4 class="font-semibold text-primary-forest mb-4">Audio Recording</h4>
				<AudioRecorder
				  bind:recording={audioRecording}
				  maxDuration={300}
				  required={observationType === 'audio'}
				  on:recordingStopped={handleAudioRecording}
				  on:recordingCleared={handleAudioCleared}
				/>
				
				{#if validationErrors.audio}
				  <p class="form-error mt-2 flex items-center gap-2">
					<AlertCircle class="w-4 h-4" />
					{validationErrors.audio}
				  </p>
				{/if}
			  </div>
			{/if}
  
			{#if validationErrors.media}
			  <p class="form-error flex items-center gap-2">
				<AlertCircle class="w-4 h-4" />
				{validationErrors.media}
			  </p>
			{/if}
		  </div>
		</div>
	  {/if}
  
	  <!-- Step 3: Location & Species -->
	  {#if currentStep === 3}
		<div in:slide={{ duration: 300 }}>
		  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Location Picker -->
			<div class="card card-body">
			  <h4 class="font-semibold text-primary-forest mb-4">Location</h4>
			  <LocationPicker
				bind:location
				required={true}
				on:locationSelected={handleLocationSelected}
				on:locationCleared={handleLocationCleared}
			  />
			  
			  {#if validationErrors.location}
				<p class="form-error mt-2 flex items-center gap-2">
				  <AlertCircle class="w-4 h-4" />
				  {validationErrors.location}
				</p>
			  {/if}
			</div>
  
			<!-- Species Selector -->
			<div class="card card-body">
			  <h4 class="font-semibold text-primary-forest mb-4">Species Identification</h4>
			  <SpeciesSelector
				bind:selectedSpecies
				{location}
				{observationType}
				audioFeatures={audioRecording?.spectrogram_data?.frequency_data?.[0]}
				on:speciesSelected={handleSpeciesSelect}
				on:speciesCleared={handleSpeciesCleared}
			  />
			  
			  {#if validationErrors.species}
				<p class="form-error mt-2 flex items-center gap-2">
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
		<div in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-6">Additional Details</h3>
		  
		  <div class="card card-body space-y-6">
			<!-- Basic Details -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			  <div>
				<label for="count" class="form-label">Number of Individuals</label>
				<input
				  id="count"
				  type="number"
				  bind:value={count}
				  min="1"
				  max="1000"
				  class="form-input"
				/>
			  </div>
  
			  <div>
				<label for="confidence" class="form-label">Identification Confidence</label>
				<select
				  id="confidence"
				  bind:value={confidence}
				  class="form-input"
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
			  <label for="description" class="form-label">Description</label>
			  <textarea
				id="description"
				bind:value={description}
				rows="3"
				placeholder="Describe what you observed (appearance, behavior, etc.)"
				class="form-input resize-vertical"
			  ></textarea>
			</div>
  
			<!-- Environmental Conditions -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			  <div>
				<label for="weather" class="form-label">Weather Conditions</label>
				<input
				  id="weather"
				  type="text"
				  bind:value={weatherConditions}
				  placeholder="e.g., sunny, cloudy, rainy"
				  class="form-input"
				/>
			  </div>
  
			  <div>
				<label for="habitat" class="form-label">Habitat Description</label>
				<input
				  id="habitat"
				  type="text"
				  bind:value={habitatDescription}
				  placeholder="e.g., oak forest, wetland, urban park"
				  class="form-input"
				/>
			  </div>
			</div>
  
			<!-- Behavior Notes -->
			<div>
			  <label for="behavior" class="form-label">Behavior Notes</label>
			  <textarea
				id="behavior"
				bind:value={behaviorNotes}
				rows="2"
				placeholder="Describe any interesting behaviors you observed"
				class="form-input resize-vertical"
			  ></textarea>
			</div>
  
			<!-- Tags -->
			<div>
			  <label for="tags" class="form-label">Tags</label>
			  <div class="flex flex-wrap gap-2 mb-3">
				{#each tags as tag, index}
				  <span class="badge badge-primary">
					{tag}
					<button
					  type="button"
					  on:click={() => removeTag(index)}
					  class="ml-1 hover:text-error transition-colors"
					  aria-label="Remove tag"
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
				class="form-input"
			  />
			</div>
  
			<!-- Additional Notes -->
			<div>
			  <label for="notes" class="form-label">Additional Notes</label>
			  <textarea
				id="notes"
				bind:value={notes}
				rows="4"
				placeholder="Any other observations or notes..."
				class="form-input resize-vertical"
			  ></textarea>
			</div>
		  </div>
		</div>
	  {/if}
  
	  <!-- Step 5: Review -->
	  {#if currentStep === 5}
		<div in:slide={{ duration: 300 }}>
		  <h3 class="text-xl font-semibold text-primary-forest mb-6">Review Your Observation</h3>
		  
		  <div class="space-y-6">
			<!-- Observation Summary -->
			<div class="card">
			  <div class="card-header">
				<h4 class="font-semibold text-primary-forest">Observation Summary</h4>
			  </div>
			  <div class="card-body">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				  <div>
					<span class="text-sm text-neutral-stone-gray">Type:</span>
					<p class="font-medium capitalize text-primary-forest">{observationType}</p>
				  </div>
				  
				  <div>
					<span class="text-sm text-neutral-stone-gray">Species:</span>
					<p class="font-medium text-primary-forest">{selectedSpecies?.common_name}</p>
					{#if selectedSpecies?.scientific_name}
					  <p class="text-sm italic text-neutral-stone-gray">{selectedSpecies.scientific_name}</p>
					{/if}
				  </div>
  
				  <div>
					<span class="text-sm text-neutral-stone-gray">Location:</span>
					<p class="font-medium text-primary-forest">{location?.region || 'Selected location'}</p>
					<p class="text-xs text-neutral-stone-gray">
					  {location?.latitude.toFixed(6)}, {location?.longitude.toFixed(6)}
					</p>
				  </div>
  
				  <div>
					<span class="text-sm text-neutral-stone-gray">Count:</span>
					<p class="font-medium text-primary-forest">{count} individual{count !== 1 ? 's' : ''}</p>
				  </div>
				</div>
			  </div>
			</div>
  
			<!-- Media Summary -->
			<div class="card card-body">
			  <h4 class="font-semibold text-primary-forest mb-4">Media</h4>
			  <div class="flex flex-wrap gap-3">
				{#if selectedImages.length > 0}
				  <div class="badge badge-success text-sm">
					<Camera class="w-4 h-4 mr-1" />
					{selectedImages.length} image(s)
				  </div>
				{/if}
				
				{#if audioRecording}
				  <div class="badge badge-secondary text-sm">
					<Mic class="w-4 h-4 mr-1" />
					Audio recording ({audioRecording.duration.toFixed(1)}s)
				  </div>
				{/if}
			  </div>
			</div>
  
			<!-- Details Summary -->
			{#if description || weatherConditions || habitatDescription || behaviorNotes || tags.length > 0}
			  <div class="card card-body">
				<h4 class="font-semibold text-primary-forest mb-4">Additional Details</h4>
				
				{#if description}
				  <div class="mb-4">
					<span class="text-sm text-neutral-stone-gray">Description:</span>
					<p class="text-neutral-soft-black mt-1">{description}</p>
				  </div>
				{/if}
  
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				  {#if weatherConditions}
					<div>
					  <span class="text-sm text-neutral-stone-gray">Weather:</span>
					  <p class="text-neutral-soft-black">{weatherConditions}</p>
					</div>
				  {/if}
  
				  {#if habitatDescription}
					<div>
					  <span class="text-sm text-neutral-stone-gray">Habitat:</span>
					  <p class="text-neutral-soft-black">{habitatDescription}</p>
					</div>
				  {/if}
				</div>
  
				{#if behaviorNotes}
				  <div class="mt-4">
					<span class="text-sm text-neutral-stone-gray">Behavior:</span>
					<p class="text-neutral-soft-black mt-1">{behaviorNotes}</p>
				  </div>
				{/if}
  
				{#if tags.length > 0}
				  <div class="mt-4">
					<span class="text-sm text-neutral-stone-gray mb-2 block">Tags:</span>
					<div class="flex flex-wrap gap-2">
					  {#each tags as tag}
						<span class="badge badge-primary text-xs">{tag}</span>
					  {/each}
					</div>
				  </div>
				{/if}
			  </div>
			{/if}
  
			{#if notes}
			  <div class="card card-body">
				<h4 class="font-semibold text-primary-forest mb-3">Notes</h4>
				<p class="text-neutral-soft-black whitespace-pre-wrap">{notes}</p>
			  </div>
			{/if}
		  </div>
  
		  <!-- Validation Errors -->
		  {#if !currentStepValid}
			<div class="card bg-error/5 border-error/20 mt-6">
			  <div class="card-body">
				<h4 class="font-medium text-error mb-3 flex items-center gap-2">
				  <AlertCircle class="w-4 h-4" />
				  Please fix the following issues:
				</h4>
				<ul class="text-error text-sm space-y-1">
				  {#each Object.values(validationErrors) as error}
					<li>• {error}</li>
				  {/each}
				</ul>
			  </div>
			</div>
		  {/if}
		</div>
	  {/if}
	</div>
  
	<!-- Navigation Buttons -->
	<div class="flex justify-between items-center mt-8 pt-6 border-t border-neutral-200">
	  <div>
		{#if currentStep > 1}
		  <button
			type="button"
			on:click={previousStep}
			class="btn btn-ghost"
		  >
			← Previous
		  </button>
		{/if}
	  </div>
  
	  <div class="flex gap-4">
		<button
		  type="button"
		  on:click={() => dispatch('cancel')}
		  class="btn btn-outline"
		>
		  Cancel
		</button>
  
		{#if currentStep < totalSteps}
		  <button
			type="button"
			on:click={nextStep}
			disabled={!currentStepValid}
			class="btn btn-primary"
		  >
			Next →
		  </button>
		{:else}
		  <button
			type="button"
			on:click={handleSubmit}
			disabled={!currentStepValid || isSubmitting}
			class="btn btn-primary"
		  >
			{#if isSubmitting}
			  <div class="spinner w-4 h-4 mr-2"></div>
			  Submitting...
			{:else}
			  <CheckCircle class="w-4 h-4 mr-2" />
			  Submit Observation
			{/if}
		  </button>
		{/if}
	  </div>
	</div>
  </div>