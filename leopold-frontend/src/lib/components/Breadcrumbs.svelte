<script lang="ts">
  import { page } from '$app/stores';
  import { ChevronRight, Home } from 'lucide-svelte';

  interface Breadcrumb {
    label: string;
    href: string;
    icon?: string;
  }

  export let breadcrumbs: Breadcrumb[] = [];
  export let showHome = true;

  // Generate breadcrumbs from current route if not provided
  $: if (breadcrumbs.length === 0 && $page.url.pathname) {
    const segments = $page.url.pathname
      .split('/')
      .filter(Boolean)
      .map((segment, index, arr) => {
        const href = '/' + arr.slice(0, index + 1).join('/');
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return { label, href };
      });

    breadcrumbs = segments;
  }

  function handleKeyDown(event: KeyboardEvent, href: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = href;
    }
  }
</script>

<nav
  aria-label="Breadcrumb"
  class="flex items-center gap-2 px-4 py-3 bg-primary-sand text-sm text-primary-stone"
>
  {#if showHome}
    <a
      href="/"
      class="flex items-center gap-1 hover:text-primary-forest transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky rounded px-2 py-1"
      aria-label="Home"
    >
      <Home class="w-4 h-4" />
      <span class="hidden sm:inline">Home</span>
    </a>

    {#if breadcrumbs.length > 0}
      <ChevronRight class="w-4 h-4 text-primary-stone opacity-50" />
    {/if}
  {/if}

  {#each breadcrumbs as crumb, index}
    {#if index > 0}
      <ChevronRight class="w-4 h-4 text-primary-stone opacity-50" />
    {/if}

    {#if index === breadcrumbs.length - 1}
      <!-- Current page (not a link) -->
      <span
        class="font-medium text-primary-forest"
        aria-current="page"
      >
        {crumb.label}
      </span>
    {:else}
      <!-- Link to previous page -->
      <a
        href={crumb.href}
        class="hover:text-primary-forest transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky rounded px-2 py-1"
        on:keydown={(e) => handleKeyDown(e, crumb.href)}
      >
        {crumb.label}
      </a>
    {/if}
  {/each}
</nav>

<style>
  :global([aria-current="page"]) {
    @apply text-primary-forest font-semibold;
  }
</style>

