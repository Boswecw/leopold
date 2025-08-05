<!-- src/lib/components/AudioRecorder.svelte -->
<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { audioStore } from '$stores';
    import { Mic, Square, Play, Pause, Download, Trash2, Volume2 } from 'lucide-svelte';
    import type { AudioRecording } from '$lib/types';
  
    // Component props
    export let maxDuration = 60; // Maximum recording duration in seconds
    export let enableVisualization = true;
    export let enableNoiseReduction = true;
    export let autoStart = false;
    export let showWaveform = true;
    export let showSpectrogram = true;
  
    const dispatch = createEventDispatcher<{
      recordingStarted: void;
      recordingStopped: void;
      recordingComplete: AudioRecording;
      error: { message: string; code?: string };
      levelUpdate: { level: number; peak: number };
    }>();
  
    // Local state
    let audioElement: HTMLAudioElement;
    let waveformCanvas: HTMLCanvasElement;
    let spectrogramCanvas: HTMLCanvasElement;
    let isPlaying = false;
    let playbackTime = 0;
    let hasPermission = false;
    let permissionError = '';
  
    // Audio visualization
    let waveformData = new Uint8Array(1024);
    let spectrogramData = new Uint8Array(512);
    let spectrogramHistory: Uint8Array[] = [];
    let animationId: number;
  
    // Reactive audio store subscription
    $: audioState = $audioStore;
    $: currentRecording = audioState.current_recording;
    $: isRecording = audioState.is_recording;
    $: recordingTime = audioState.recording_time;
    $: audioLevel = audioState.audio_level;
  
    onMount(async () => {
      // Initialize audio system
      const initialized = await audioStore.initialize();
      if (!initialized) {
        dispatch('error', { 
          message: 'Audio recording not supported in this browser',
          code: 'AUDIO_NOT_SUPPORTED'
        });
        return;
      }
  
      // Request permissions
      const granted = await audioStore.requestPermissions();
      hasPermission = granted;
      
      if (!granted) {
        permissionError = 'Microphone access is required for audio recordings';
        dispatch('error', { 
          message: permissionError,
          code: 'PERMISSION_DENIED'
        });
      }
  
      // Auto-start if requested
      if (autoStart && hasPermission) {
        startRecording();
      }
  
      // Start visualization if recording
      if (isRecording && enableVisualization) {
        startVisualization();
      }
    });
  
    onDestroy(() => {
      stopVisualization();
      audioStore.cleanup();
    });
  
    // Recording controls
    async function startRecording() {
      if (!hasPermission) {
        const granted = await audioStore.requestPermissions();
        if (!granted) {
          permissionError = 'Microphone access denied';
          return;
        }
        hasPermission = true;
      }
  
      const started = await audioStore.startRecording(maxDuration);
      if (started) {
        dispatch('recordingStarted');
        if (enableVisualization) {
          startVisualization();
        }
      } else {
        dispatch('error', { 
          message: 'Failed to start recording',
          code: 'RECORDING_START_FAILED'
        });
      }
    }
  
    function stopRecording() {
      audioStore.stopRecording();
      stopVisualization();
      dispatch('recordingStopped');
      
      // Dispatch recording complete when available
      if (currentRecording) {
        dispatch('recordingComplete', currentRecording);
      }
    }
  
    function clearRecording() {
      audioStore.clearRecording();
      stopPlayback();
    }
  
    // Playback controls
    function togglePlayback() {
      if (!currentRecording) return;
  
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  
    function stopPlayback() {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      isPlaying = false;
      playbackTime = 0;
    }
  
    // Audio visualization
    function startVisualization() {
      if (!enableVisualization) return;
      visualizeAudio();
    }
  
    function stopVisualization() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    }
  
    function visualizeAudio() {
      if (!isRecording) return;
  
      // This would connect to the actual audio context from the store
      // For now, we'll simulate the visualization
      
      if (showWaveform && waveformCanvas) {
        drawWaveform();
      }
      
      if (showSpectrogram && spectrogramCanvas) {
        drawSpectrogram();
      }
  
      // Dispatch level update
      dispatch('levelUpdate', { 
        level: audioLevel, 
        peak: audioLevel * 1.2 
      });
  
      if (isRecording) {
        animationId = requestAnimationFrame(visualizeAudio);
      }
    }
  
    function drawWaveform() {
      const ctx = waveformCanvas.getContext('2d');
      if (!ctx) return;
  
      const width = waveformCanvas.width;
      const height = waveformCanvas.height;
  
      // Clear canvas
      ctx.fillStyle = '#2F5D50';
      ctx.fillRect(0, 0, width, height);
  
      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#76B4BD';
      ctx.beginPath();
  
      // Simulate waveform data based on audio level
      const amplitude = audioLevel * 0.8;
      const frequency = 0.02;
      
      for (let i = 0; i < width; i++) {
        const x = i;
        const y = height / 2 + Math.sin(i * frequency + recordingTime * 5) * amplitude * height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
  
      ctx.stroke();
  
      // Add time indicator
      ctx.fillStyle = '#DAA520';
      ctx.font = '12px Inter';
      ctx.fillText(`${recordingTime.toFixed(1)}s`, 10, 20);
    }
  
    function drawSpectrogram() {
      const ctx = spectrogramCanvas.getContext('2d');
      if (!ctx) return;
  
      const width = spectrogramCanvas.width;
      const height = spectrogramCanvas.height;
  
      // Shift existing data left
      if (spectrogramHistory.length > 0) {
        const imageData = ctx.getImageData(1, 0, width - 1, height);
        ctx.putImageData(imageData, 0, 0);
      }
  
      // Draw new frequency column based on audio level
      const intensity = audioLevel * 255;
      for (let i = 0; i < height; i++) {
        const frequency = i / height;
        const value = intensity * (1 - frequency) * Math.random(); // Simulate frequency data
        
        const hue = (240 - (value / 255) * 240) % 360; // Blue to red
        const saturation = 100;
        const lightness = (value / 255) * 40 + 20;
        
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(width - 1, height - i - 1, 1, 1);
      }
    }
  
    function downloadRecording() {
      if (!currentRecording) return;
  
      const link = document.createElement('a');
      link.href = currentRecording.url;
      link.download = `leopold-recording-${new Date().toISOString().split('T')[0]}.webm`;
      link.click();
    }
  
    function formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  
    function formatFileSize(bytes: number): string {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
  </script>
  
  <!-- Audio Recorder Component -->
  <div class="audio-recorder bg-gradient-to-br from-secondary-sand to-neutral-off-white border-2 border-primary-forest/20 rounded-xl p-6 shadow-nature">
    <!-- Permission Error -->
    {#if !hasPermission && permissionError}
      <div class="permission-error bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 text-red-700">
          <Mic class="w-5 h-5" />
          <span class="font-medium">Microphone Access Required</span>
        </div>
        <p class="text-red-600 text-sm mt-1">{permissionError}</p>
        <button 
          on:click={() => audioStore.requestPermissions().then(granted => hasPermission = granted)}
          class="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Grant Permission
        </button>
      </div>
    {/if}
  
    <!-- Recording Controls -->
    <div class="recording-controls flex items-center justify-center gap-4 mb-6">
      {#if !isRecording && !currentRecording}
        <button 
          on:click={startRecording}
          disabled={!hasPermission}
          class="record-btn bg-audio-recording hover:bg-red-700 disabled:bg-neutral-stone-gray disabled:cursor-not-allowed text-white rounded-full p-4 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          aria-label="Start Recording"
        >
          <Mic class="w-8 h-8" />
        </button>
        
      {:else if isRecording}
        <button 
          on:click={stopRecording}
          class="stop-btn bg-neutral-stone-gray hover:bg-neutral-soft-black text-white rounded-full p-4 transition-all duration-200 shadow-lg animate-recording-pulse"
          aria-label="Stop Recording"
        >
          <Square class="w-8 h-8" />
        </button>
        
        <div class="recording-info text-center">
          <div class="text-2xl font-mono font-bold text-primary-forest">
            {formatTime(recordingTime)}
          </div>
          <div class="text-sm text-neutral-stone-gray">
            Recording... ({Math.round((recordingTime / maxDuration) * 100)}%)
          </div>
          
          <!-- Audio Level Indicator -->
          <div class="audio-level mt-2 flex items-center gap-2">
            <Volume2 class="w-4 h-4 text-neutral-stone-gray" />
            <div class="level-bar bg-neutral-stone-gray/20 rounded-full h-2 flex-1 overflow-hidden">
              <div 
                class="level-fill bg-primary-sky h-full transition-all duration-100 rounded-full"
                style="width: {audioLevel * 100}%"
              ></div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  
    <!-- Audio Visualization -->
    {#if enableVisualization && (isRecording || currentRecording)}
      <div class="audio-visualization space-y-4">
        {#if showWaveform}
          <div class="waveform-container">
            <h4 class="text-sm font-medium text-neutral-stone-gray mb-2 flex items-center gap-2">
              📊 Waveform (Time Domain)
            </h4>
            <canvas 
              bind:this={waveformCanvas}
              width="400" 
              height="100"
              class="w-full h-20 border border-primary-forest/20 rounded-lg bg-primary-forest"
            ></canvas>
          </div>
        {/if}
  
        {#if showSpectrogram}
          <div class="spectrogram-container">
            <h4 class="text-sm font-medium text-neutral-stone-gray mb-2 flex items-center gap-2">
              🎵 Spectrogram (Frequency Domain)
            </h4>
            <canvas 
              bind:this={spectrogramCanvas}
              width="400" 
              height="150"
              class="w-full h-32 border border-primary-forest/20 rounded-lg"
              style="background: linear-gradient(to bottom, #1e3a8a, #1e40af, #3b82f6)"
            ></canvas>
          </div>
        {/if}
      </div>
    {/if}
  
    <!-- Playback Controls -->
    {#if currentRecording && !isRecording}
      <div class="playback-section mt-6 p-4 bg-white/50 rounded-lg border border-primary-forest/10">
        <div class="playback-info mb-3">
          <h4 class="font-medium text-primary-forest mb-1">Recording Complete</h4>
          <div class="text-sm text-neutral-stone-gray space-y-1">
            <div>Duration: {formatTime(currentRecording.duration)}</div>
            <div>Size: {formatFileSize(currentRecording.blob.size)}</div>
            <div>Format: {currentRecording.file_format}</div>
          </div>
        </div>
        
        <audio 
          bind:this={audioElement}
          src={currentRecording.url}
          on:play={() => isPlaying = true}
          on:pause={() => isPlaying = false}
          on:ended={() => isPlaying = false}
          on:timeupdate={(e) => playbackTime = e.target.currentTime}
          class="w-full mb-3"
          controls
        ></audio>
        
        <div class="playback-controls flex items-center justify-between">
          <div class="control-buttons flex gap-2">
            <button 
              on:click={togglePlayback}
              class="play-btn bg-primary-forest hover:bg-primary-forest/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {#if isPlaying}
                <Pause class="w-4 h-4" />
                Pause
              {:else}
                <Play class="w-4 h-4" />
                Play
              {/if}
            </button>
            
            <button 
              on:click={downloadRecording}
              class="download-btn bg-secondary-goldenrod hover:bg-secondary-goldenrod/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download class="w-4 h-4" />
              Download
            </button>
          </div>
          
          <button 
            on:click={clearRecording}
            class="clear-btn bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 class="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    {/if}
  
    <!-- Recording Tips -->
    {#if !isRecording && !currentRecording && hasPermission}
      <div class="recording-tips mt-4 p-4 bg-primary-sky/10 rounded-lg border border-primary-sky/20">
        <h4 class="font-medium text-primary-forest mb-2">🎤 Recording Tips</h4>
        <ul class="text-sm text-neutral-stone-gray space-y-1">
          <li>• Hold device 6-12 inches from sound source</li>
          <li>• Record in quiet environment when possible</li>
          <li>• Bird calls are best recorded at dawn/dusk</li>
          <li>• Maximum recording length: {maxDuration} seconds</li>
        </ul>
      </div>
    {/if}
  </div>
  
  <style>
    .audio-recorder {
      font-family: 'Inter', system-ui, sans-serif;
    }
    
    .record-btn:hover {
      box-shadow: 0 0 20px rgba(220, 38, 38, 0.4);
    }
    
    .stop-btn {
      animation: recordingPulse 1.5s ease-in-out infinite;
    }
    
    @keyframes recordingPulse {
      0%, 100% { 
        opacity: 1; 
        transform: scale(1);
      }
      50% { 
        opacity: 0.8; 
        transform: scale(1.05);
      }
    }
    
    .level-fill {
      transition: width 0.1s ease-out;
    }
    
    canvas {
      image-rendering: pixelated;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .audio-recorder {
        padding: 1rem;
      }
      
      .recording-controls {
        flex-direction: column;
        gap: 1rem;
      }
      
      .playback-controls {
        flex-direction: column;
        gap: 0.75rem;
        align-items: stretch;
      }
      
      .control-buttons {
        justify-content: center;
      }
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .audio-recorder {
        border-width: 3px;
      }
      
      .record-btn, .stop-btn {
        border: 2px solid currentColor;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .record-btn, .stop-btn {
        transition: none;
      }
      
      .stop-btn {
        animation: none;
      }
      
      .level-fill {
        transition: none;
      }
    }
  </style>