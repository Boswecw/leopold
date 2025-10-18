<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { uiStore } from '$lib/stores';
  import '$lib/styles/globals.css';

  onMount(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('leopold_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = (savedTheme as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
    uiStore.setTheme(theme);
  });
</script>

<div class="min-h-screen bg-neutral-off-white dark:bg-neutral-off-white flex flex-col transition-colors duration-300">
  <Navbar />
  <main class="flex-1">
    <slot />
  </main>
</div>
