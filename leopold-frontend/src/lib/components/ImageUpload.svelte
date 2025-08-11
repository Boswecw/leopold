<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Upload, X, Camera, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-svelte';
    import { uiStore } from '$lib/stores';
    import { validateImageFile } from '$lib/utils/validation';
  
    // Props
    export let files: File[] = [];
    export let maxFiles = 5;
    export let maxFileSize = 10 * 1024 * 1024; // 10MB
    export let acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    export let required = false;
    export let label = 'Upload Images';
  
    // Component state
    let isDragging = false;
    let isProcessing = false;
    let uploadErrors: Record<string, string> = {};
    let previews: Record<string, string> = {};
  
    // Refs
    let fileInput: HTMLInputElement;
    let cameraInput: HTMLInputElement;
  
    const dispatch = createEventDispatcher<{
      filesSelected: File[];
      fileRemoved: { file: File; index: number };
      filesCleared: void;
      error: { message: string };
    }>();
  
    // Handle file selection
    function handleFiles(fileList: FileList) {
      isProcessing = true;
      const newFiles: File[] = [];
      const errors: Record<string, string> = {};
  
      Array.from(fileList).forEach((file, index) => {
        // Check if we're at max files
        if (files.length + newFiles.length >= maxFiles) {
          errors[`max_files`] = `Maximum ${maxFiles} files allowed`;
          return;
        }
  
        // Check for duplicates
        const isDuplicate = files.some(existing => 
          existing.name === file.name && existing.size === file.size
        );
        
        if (isDuplicate) {
          errors[`duplicate_${index}`] = `File "${file.name}" already selected`;
          return;
        }
  
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          Object.entries(validation.errors).forEach(([key, value]) => {
            errors[`${file.name}_${key}`] = value;
          });
          return;
        }
  
        newFiles.push(file);
        createPreview(file);
      });
  
      if (newFiles.length > 0) {
        files = [...files, ...newFiles];
        dispatch('filesSelected', newFiles);
      }
  
      uploadErrors = errors;
      
      if (Object.keys(errors).length > 0) {
        const errorMessages = Object.values(errors).join(', ');
        dispatch('error', { message: errorMessages });
      }
  
      isProcessing = false;
    }
  
    // Create image preview
    function createPreview(file: File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previews[file.name] = e.target.result as string;
          previews = { ...previews }; // Trigger reactivity
        }
      };
      reader.readAsDataURL(file);
    }
  
    // Remove file
    function removeFile(index: number) {
      const file = files[index];
      if (previews[file.name]) {
        delete previews[file.name];
        previews = { ...previews };
      }
      
      files = files.filter((_, i) => i !== index);
      dispatch('fileRemoved', { file, index });
      
      // Clear related errors
      const updatedErrors = { ...uploadErrors };
      Object.keys(updatedErrors).forEach(key => {
        if (key.startsWith(file.name)) {
          delete updatedErrors[key];
        }
      });
      uploadErrors = updatedErrors;
    }
  
    // Clear all files
    function clearAllFiles() {
      files = [];
      previews = {};
      uploadErrors = {};
      dispatch('filesCleared');
    }
  
    // Drag and drop handlers
    function handleDragOver(e: DragEvent) {
      e.preventDefault();
      isDragging = true;
    }
  
    function handleDragLeave(e: DragEvent) {
      e.preventDefault();
      isDragging = false;
    }
  
    function handleDrop(e: DragEvent) {
      e.preventDefault();
      isDragging = false;
      
      const droppedFiles = e.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    }
  
    // Format file size for display
    function formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  
    // Get file type icon
    function getFileTypeIcon(file: File): string {
      if (file.type.startsWith('image/')) return '🖼️';
      return '📁';
    }
  
    // Check if file type is accepted
    function isAcceptedType(file: File): boolean {
      return acceptedTypes.some(type => 
        file.type === type || file.type.match(new RegExp(type.replace('*', '.*')))
      );
    }
  
    // Handle file input change
    function handleFileInputChange(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target?.files && target.files.length > 0) {
        handleFiles(target.files);
        target.value = ''; // Reset input
      }
    }
  
    // Handle camera input change
    function handleCameraInputChange(e: Event) {
      const target = e.target as HTMLInputElement;
      if (target?.files && target.files.length > 0) {
        handleFiles(target.files);
        target.value = ''; // Reset input
      }
    }
  </script>
  
  <div class="image-upload">
    <!-- Header -->
    <div class="header mb-4">
      <h3 class="text-lg font-semibold text-primary-forest mb-2 flex items-center gap-2">
        <ImageIcon class="w-5 h-5" />
        {label} {required ? '*' : ''}
      </h3>
      <p class="text-sm text-gray-600">
        Upload up to {maxFiles} images. Supported formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
      </p>
    </div>
  
    <!-- Upload Area -->
    <div 
      class="upload-area border-2 border-dashed rounded-lg p-6 transition-colors duration-200 {isDragging 
        ? 'border-primary-forest bg-primary-forest/5' 
        : files.length > 0 
          ? 'border-green-300 bg-green-50' 
          : 'border-gray-300 bg-gray-50 hover:border-primary-forest hover:bg-primary-forest/5'}"
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
      role="button"
      tabindex="0"
    >
      <div class="text-center">
        {#if isProcessing}
          <div class="flex flex-col items-center gap-3">
            <div class="animate-spin w-8 h-8 border-3 border-primary-forest border-t-transparent rounded-full"></div>
            <p class="text-sm text-gray-600">Processing files...</p>
          </div>
        {:else if files.length === 0}
          <div class="flex flex-col items-center gap-4">
            <Upload class="w-12 h-12 text-gray-400" />
            <div>
              <p class="text-lg font-medium text-gray-700">Drop images here or click to upload</p>
              <p class="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to {formatFileSize(maxFileSize)}</p>
            </div>
            
            <!-- Upload Buttons -->
            <div class="flex gap-3">
              <button
                type="button"
                on:click={() => fileInput.click()}
                class="flex items-center gap-2 px-4 py-2 bg-primary-forest text-white rounded-lg hover:bg-primary-forest/90 transition-colors"
              >
                <Upload class="w-4 h-4" />
                Choose Files
              </button>
              
              <button
                type="button"
                on:click={() => cameraInput.click()}
                class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Camera class="w-4 h-4" />
                Take Photo
              </button>
            </div>
          </div>
        {:else}
          <div class="flex flex-col items-center gap-3">
            <CheckCircle class="w-8 h-8 text-green-600" />
            <div>
              <p class="text-lg font-medium text-green-800">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </p>
              <p class="text-sm text-green-600">
                {files.length < maxFiles ? `Add ${maxFiles - files.length} more` : 'Maximum reached'}
              </p>
            </div>
            
            {#if files.length < maxFiles}
              <div class="flex gap-2">
                <button
                  type="button"
                  on:click={() => fileInput.click()}
                  class="px-3 py-1 text-sm bg-primary-forest text-white rounded hover:bg-primary-forest/90"
                >
                  Add More
                </button>
                <button
                  type="button"
                  on:click={() => cameraInput.click()}
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Take Photo
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
  
      <!-- Hidden file inputs -->
      <input
        bind:this={fileInput}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        on:change={handleFileInputChange}
        class="hidden"
      />
      
      <input
        bind:this={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        on:change={handleCameraInputChange}
        class="hidden"
      />
    </div>
  
    <!-- File List -->
    {#if files.length > 0}
      <div class="file-list mt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-700">Selected Files</h4>
          <button
            type="button"
            on:click={clearAllFiles}
            class="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <X class="w-3 h-3" />
            Clear All
          </button>
        </div>
        
        <div class="space-y-3">
          {#each files as file, index}
            <div class="file-item flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <!-- Preview or Icon -->
              <div class="flex-shrink-0">
                {#if previews[file.name]}
                  <img
                    src={previews[file.name]}
                    alt="Preview of {file.name}"
                    class="w-12 h-12 object-cover rounded border"
                  />
                {:else}
                  <div class="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-lg">
                    {getFileTypeIcon(file)}
                  </div>
                {/if}
              </div>
              
              <!-- File Info -->
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span class="capitalize">{file.type.split('/')[1]}</span>
                  {#if isAcceptedType(file)}
                    <span class="flex items-center gap-1 text-green-600">
                      <CheckCircle class="w-3 h-3" />
                      Valid
                    </span>
                  {:else}
                    <span class="flex items-center gap-1 text-red-600">
                      <AlertCircle class="w-3 h-3" />
                      Invalid type
                    </span>
                  {/if}
                </div>
              </div>
              
              <!-- Remove Button -->
              <button
                type="button"
                on:click={() => removeFile(index)}
                class="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                aria-label="Remove {file.name}"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  
    <!-- Error Display -->
    {#if Object.keys(uploadErrors).length > 0}
      <div class="error-display mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-2">
          <AlertCircle class="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 class="font-medium text-red-700">Upload Errors</h4>
            <div class="text-red-600 text-sm mt-1 space-y-1">
              {#each Object.entries(uploadErrors) as [key, error]}
                <p>{error}</p>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}
  
    <!-- Validation Error -->
    {#if required && files.length === 0}
      <div class="validation-error mt-4 text-red-600 text-sm flex items-center gap-1">
        <AlertCircle class="w-4 h-4" />
        At least one image is required
      </div>
    {/if}
  
    <!-- Usage Tips -->
    <div class="tips mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="font-medium text-blue-800 mb-2">📸 Photography Tips</h4>
      <ul class="text-sm text-blue-700 space-y-1">
        <li>• Take photos in good lighting for better species identification</li>
        <li>• Include multiple angles if possible (front, side, back)</li>
        <li>• Get close-up shots of distinctive features</li>
        <li>• Keep the background simple when possible</li>
      </ul>
    </div>
  </div>
  
  <style>
    .image-upload {
      width: 100%;
    }
  
    .upload-area {
      cursor: pointer;
    }
  
    .upload-area:focus {
      outline: 2px solid #065f46;
      outline-offset: 2px;
    }
  
    .file-item {
      transition: all 0.2s ease;
    }
  
    .file-item:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  
    /* Animation for processing state */
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  
    /* Custom scrollbar for file list */
    .file-list {
      max-height: 300px;
      overflow-y: auto;
    }
  
    .file-list::-webkit-scrollbar {
      width: 6px;
    }
  
    .file-list::-webkit-scrollbar-track {
      background: #f3f4f6;
      border-radius: 3px;
    }
  
    .file-list::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
  
    .file-list::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
  </style>
