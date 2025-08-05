<!-- src/lib/components/ImageUpload.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Upload, X, Camera, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-svelte';
    import { uiStore } from '$stores';
  
    const dispatch = createEventDispatcher<{
      filesSelected: File[];
      fileRemoved: { file: File; index: number };
      error: { message: string; code?: string };
    }>();
  
    // Props
    export let maxFiles = 5;
    export let maxSizePerFile = 10 * 1024 * 1024; // 10MB
    export let acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    export let enableCamera = true;
    export let enableDragDrop = true;
    export let showPreview = true;
    export let compressImages = true;
    export let maxWidth = 1920;
    export let maxHeight = 1080;
    export let quality = 0.8;
  
    // State
    let selectedFiles: File[] = [];
    let previews: string[] = [];
    let fileInput: HTMLInputElement;
    let cameraInput: HTMLInputElement;
    let dropZone: HTMLDivElement;
    let isDragging = false;
    let isUploading = false;
    let uploadProgress: number[] = [];
  
    // Reactive statements
    $: canAddMore = selectedFiles.length < maxFiles;
    $: totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
  
    // File validation
    function validateFile(file: File): { valid: boolean; error?: string } {
      // Check file type
      if (!acceptedTypes.includes(file.type.toLowerCase())) {
        return {
          valid: false,
          error: `File type ${file.type} not supported. Please use: ${acceptedTypes.join(', ')}`
        };
      }
  
      // Check file size
      if (file.size > maxSizePerFile) {
        return {
          valid: false,
          error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(maxSizePerFile)})`
        };
      }
  
      return { valid: true };
    }
  
    // Handle file selection
    async function handleFiles(files: FileList | File[]) {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errors: string[] = [];
  
      // Check if adding these files would exceed the limit
      if (selectedFiles.length + fileArray.length > maxFiles) {
        errors.push(`Cannot add ${fileArray.length} files. Maximum ${maxFiles} files allowed (${selectedFiles.length} already selected)`);
        dispatch('error', { message: errors[0], code: 'MAX_FILES_EXCEEDED' });
        return;
      }
  
      // Validate each file
      for (const file of fileArray) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      }
  
      if (errors.length > 0) {
        dispatch('error', { message: errors.join('\n'), code: 'VALIDATION_FAILED' });
      }
  
      if (validFiles.length > 0) {
        try {
          isUploading = true;
          const processedFiles = compressImages ? 
            await Promise.all(validFiles.map(compressImage)) : 
            validFiles;
  
          selectedFiles = [...selectedFiles, ...processedFiles];
          await generatePreviews(processedFiles);
          
          dispatch('filesSelected', selectedFiles);
          uiStore.showNotification('success', `Added ${processedFiles.length} image(s)`);
        } catch (error) {
          console.error('Error processing images:', error);
          dispatch('error', { 
            message: 'Failed to process images. Please try again.',
            code: 'PROCESSING_FAILED'
          });
        } finally {
          isUploading = false;
        }
      }
  
      // Reset file inputs
      if (fileInput) fileInput.value = '';
      if (cameraInput) cameraInput.value = '';
    }
  
    // Image compression
    async function compressImage(file: File): Promise<File> {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
  
        img.onload = () => {
          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }
  
          canvas.width = width;
          canvas.height = height;
  
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, file.type, quality);
        };
  
        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
      });
    }
  
    // Generate image previews
    async function generatePreviews(files: File[]) {
      const newPreviews = await Promise.all(
        files.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        })
      );
      
      previews = [...previews, ...newPreviews];
    }
  
    // Remove file
    function removeFile(index: number) {
      const removedFile = selectedFiles[index];
      selectedFiles = selectedFiles.filter((_, i) => i !== index);
      
      // Clean up preview URL
      if (previews[index]) {
        URL.revokeObjectURL(previews[index]);
        previews = previews.filter((_, i) => i !== index);
      }
      
      dispatch('fileRemoved', { file: removedFile, index });
      dispatch('filesSelected', selectedFiles);
      
      uiStore.showNotification('info', 'Image removed');
    }
  
    // Drag and drop handlers
    function handleDragOver(e: DragEvent) {
      if (!enableDragDrop) return;
      e.preventDefault();
      isDragging = true;
    }
  
    function handleDragLeave(e: DragEvent) {
      if (!enableDragDrop) return;
      e.preventDefault();
      // Only set isDragging to false if we're leaving the drop zone entirely
      if (!dropZone.contains(e.relatedTarget as Node)) {
        isDragging = false;
      }
    }
  
    function handleDrop(e: DragEvent) {
      if (!enableDragDrop) return;
      e.preventDefault();
      isDragging = false;
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
    }
  
    // Camera capture
    function captureFromCamera() {
      if (cameraInput) {
        cameraInput.click();
      }
    }
  
    // File browser
    function selectFromFiles() {
      if (fileInput) {
        fileInput.click();
      }
    }
  
    // Utility functions
    function formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
  
    function getFileTypeIcon(type: string): string {
      if (type.startsWith('image/')) return '🖼️';
      return '📄';
    }
  
    // Cleanup on destroy
    function cleanup() {
      previews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    }
  
    // Auto-cleanup on component destroy
    import { onDestroy } from 'svelte';
    onDestroy(cleanup);
  </script>
  
  <!-- Image Upload Component -->
  <div class="image-upload">
    <!-- Hidden file inputs -->
    <input
      bind:this={fileInput}
      type="file"
      multiple
      accept={acceptedTypes.join(',')}
      on:change={(e) => e.target.files && handleFiles(e.target.files)}
      class="hidden"
      aria-label="Select images from device"
    />
    
    {#if enableCamera}
      <input
        bind:this={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        on:change={(e) => e.target.files && handleFiles(e.target.files)}
        class="hidden"
        aria-label="Capture image with camera"
      />
    {/if}
  
    <!-- Upload Controls -->
    {#if canAddMore}
      <div class="upload-controls mb-4">
        <!-- Drag & Drop Zone -->
        <div
          bind:this={dropZone}
          class="drop-zone border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 {isDragging ? 'border-primary-forest bg-primary-forest/5 scale-105' : 'border-gray-300 hover:border-primary-forest/50'} {!canAddMore ? 'opacity-50 pointer-events-none' : ''}"
          on:dragover={handleDragOver}
          on:dragleave={handleDragLeave}
          on:drop={handleDrop}
          role="button"
          tabindex="0"
          aria-label="Drag and drop images here or click to select"
        >
          {#if isUploading}
            <div class="uploading-state">
              <div class="spinner w-12 h-12 border-4 border-primary-forest/20 border-t-primary-forest rounded-full animate-spin mx-auto mb-4"></div>
              <p class="text-primary-forest font-medium">Processing images...</p>
              <p class="text-sm text-neutral-stone-gray">Please wait while we optimize your images</p>
            </div>
          {:else}
            <div class="upload-prompt">
              <Upload class="w-16 h-16 text-primary-forest/60 mx-auto mb-4" />
              
              <h3 class="text-lg font-semibold text-primary-forest mb-2">
                {selectedFiles.length === 0 ? 'Add Images' : 'Add More Images'}
              </h3>
              
              <p class="text-neutral-stone-gray mb-4">
                {#if enableDragDrop}
                  Drag & drop images here, or click to browse
                {:else}
                  Click to select images from your device
                {/if}
              </p>
  
              <div class="upload-buttons flex gap-3 justify-center">
                <button
                  type="button"
                  on:click={selectFromFiles}
                  class="upload-btn bg-primary-forest hover:bg-primary-forest/80 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
                >
                  <ImageIcon class="w-5 h-5" />
                  Browse Files
                </button>
                
                {#if enableCamera}
                  <button
                    type="button"
                    on:click={captureFromCamera}
                    class="camera-btn bg-secondary-goldenrod hover:bg-secondary-goldenrod/80 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
                  >
                    <Camera class="w-5 h-5" />
                    Take Photo
                  </button>
                {/if}
              </div>
  
              <div class="upload-info mt-4 text-xs text-neutral-stone-gray">
                <p>Accepted formats: {acceptedTypes.join(', ')}</p>
                <p>Maximum file size: {formatFileSize(maxSizePerFile)}</p>
                <p>Maximum files: {maxFiles} ({selectedFiles.length} selected)</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  
    <!-- Selected Images Preview -->
    {#if selectedFiles.length > 0 && showPreview}
      <div class="selected-images">
        <div class="images-header flex justify-between items-center mb-4">
          <h4 class="font-semibold text-primary-forest flex items-center gap-2">
            <CheckCircle class="w-5 h-5 text-green-600" />
            Selected Images ({selectedFiles.length}/{maxFiles})
          </h4>
          <div class="total-size text-sm text-neutral-stone-gray">
            Total size: {formatFileSize(totalSize)}
          </div>
        </div>
  
        <div class="images-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each selectedFiles as file, index (file.name + file.lastModified)}
            <div class="image-item relative group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <!-- Image Preview -->
              <div class="image-preview aspect-square bg-gray-100 relative overflow-hidden">
                {#if previews[index]}
                  <img
                    src={previews[index]}
                    alt={file.name}
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-6xl">
                    {getFileTypeIcon(file.type)}
                  </div>
                {/if}
                
                <!-- Remove Button -->
                <button
                  type="button"
                  on:click={() => removeFile(index)}
                  class="remove-btn absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  aria-label="Remove image"
                >
                  <X class="w-4 h-4" />
                </button>
  
                <!-- File Size Badge -->
                <div class="file-size absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatFileSize(file.size)}
                </div>
              </div>
  
              <!-- File Info -->
              <div class="file-info p-3">
                <p class="file-name text-sm font-medium text-primary-forest truncate" title={file.name}>
                  {file.name}
                </p>
                <div class="file-meta flex justify-between text-xs text-neutral-stone-gray mt-1">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{file.type.replace('image/', '').toUpperCase()}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
  
        <!-- Batch Actions -->
        <div class="batch-actions mt-4 flex justify-between items-center">
          <div class="compression-info text-sm text-neutral-stone-gray">
            {#if compressImages}
              <p class="flex items-center gap-1">
                <CheckCircle class="w-4 h-4 text-green-600" />
                Images will be optimized for web
              </p>
            {/if}
          </div>
          
          <button
            type="button"
            on:click={() => {
              selectedFiles.forEach((_, index) => removeFile(index));
            }}
            class="clear-all-btn text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    {/if}
  
    <!-- Upload Tips -->
    {#if selectedFiles.length === 0}
      <div class="upload-tips mt-6 bg-primary-sky/10 border border-primary-sky/20 rounded-lg p-4">
        <h4 class="font-medium text-primary-forest mb-2 flex items-center gap-2">
          📸 Photography Tips
        </h4>
        <ul class="text-sm text-neutral-stone-gray space-y-1">
          <li>• Take photos in good lighting conditions</li>
          <li>• Include identifying features (leaves, flowers, markings)</li>
          <li>• Capture multiple angles when possible</li>
          <li>• Keep subjects in focus and avoid blur</li>
          <li>• Show scale with common objects if helpful</li>
        </ul>
      </div>
    {/if}
  
    <!-- Error Display -->
    {#if $uiStore.error}
      <div class="error-display mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start gap-2">
          <AlertCircle class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 class="font-medium text-red-700">Upload Error</h4>
            <p class="text-red-600 text-sm mt-1 whitespace-pre-line">{$uiStore.error}</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <style>
    /* Custom styles for better visual feedback */
    .drop-zone {
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(47, 93, 80, 0.15) 1px, transparent 0);
      background-size: 20px 20px;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .drop-zone:hover {
      background-image: 
        radial-gradient(circle at 1px 1px, rgba(47, 93, 80, 0.25) 1px, transparent 0);
    }
  
    .image-item {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
  
    .image-item:hover {
      transform: translateY(-2px);
    }
  
    .remove-btn {
      backdrop-filter: blur(4px);
    }
  
    .upload-btn:hover,
    .camera-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  
    /* Responsive grid adjustments */
    @media (max-width: 640px) {
      .images-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .upload-buttons {
        flex-direction: column;
      }
      
      .drop-zone {
        padding: 2rem 1rem;
        min-height: 150px;
      }
    }
  
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .drop-zone {
        border-width: 3px;
      }
      
      .image-item {
        border-width: 2px;
      }
      
      .upload-btn,
      .camera-btn,
      .remove-btn {
        border: 2px solid currentColor;
      }
    }
  
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .drop-zone,
      .image-item,
      .upload-btn,
      .camera-btn {
        transition: none;
      }
      
      .image-item:hover {
        transform: none;
      }
      
      .upload-btn:hover,
      .camera-btn:hover {
        transform: none;
      }
    }
  
    /* Focus styles for accessibility */
    .drop-zone:focus {
      outline: 2px solid #2F5D50;
      outline-offset: 2px;
    }
  
    .upload-btn:focus,
    .camera-btn:focus,
    .remove-btn:focus {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  </style>