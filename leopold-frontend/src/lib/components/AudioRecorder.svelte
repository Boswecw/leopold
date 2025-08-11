<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Mic, Square, Play, Pause } from 'lucide-svelte';
  import type { AudioRecording } from '$lib/types';

  // Props
  export let recording: AudioRecording | null = null;
  export let maxDuration = 300;
  export let required = false;

  // State
  let isRecording = false;
  let hasPermission = false;

  const dispatch = createEventDispatcher<{
    recordingStopped: AudioRecording;
    recordingCleared: void;
  }>();

  // Simple mock functions for now
  function startRecording() {
    isRecording = true;
  }

  function stopRecording() {
    isRecording = false;
    // Create a mock recording
    const mockRecording: AudioRecording = {
      id: 'test',
      blob: new Blob(),
      url: '',
      duration: 10,
      created_at: new Date().toISOString()
    };
    recording = mockRecording;
    dispatch('recordingStopped', mockRecording);
  }

  function clearRecording() {
    recording = null;
    dispatch('recordingCleared');
  }
</script>

<div class="audio-recorder p-4 border border-gray-200 rounded-lg">
  <h3 class="text-lg font-semibold mb-4">
    Audio Recording {required ? '*' : ''}
  </h3>
  
  {#if !recording}
    {#if !isRecording}
      <button 
        on:click={startRecording}
        class="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        <Mic class="w-4 h-4" />
        Start Recording
      </button>
    {:else}
      <button 
        on:click={stopRecording}
        class="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
      >
        <Square class="w-4 h-4" />
        Stop Recording
      </button>
    {/if}
  {:else}
    <div class="recording-info p-3 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-green-800 mb-2">Recording complete</p>
      <button 
        on:click={clearRecording}
        class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        Clear Recording
      </button>
    </div>
  {/if}
</div>

<style>
  .audio-recorder {
    width: 100%;
  }
</style>
