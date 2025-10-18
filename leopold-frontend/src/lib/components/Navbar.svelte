<!-- @component
no description yet
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { Menu, X, Map, Plus, User, LogOut, Settings, Search, Moon, Sun } from 'lucide-svelte';
  import { uiStore } from '$lib/stores';

  let isMenuOpen = false;
  let isUserMenuOpen = false;
  let currentTheme: 'light' | 'dark' = 'light';

  // Subscribe to theme changes
  const unsubscribe = uiStore.subscribe((ui) => {
    currentTheme = ui.theme;
  });

  function handleThemeToggle() {
    uiStore.toggleTheme();
  }

  interface NavItem {
    label: string;
    href: string;
    icon: unknown;
    ariaLabel: string;
  }

  const navItems: NavItem[] = [
    { label: 'Map', href: '/map', icon: Map, ariaLabel: 'View observations map' },
    { label: 'Report', href: '/observations/new', icon: Plus, ariaLabel: 'Report new observation' },
    { label: 'Observations', href: '/observations', icon: Search, ariaLabel: 'View all observations' }
  ];

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function toggleUserMenu() {
    isUserMenuOpen = !isUserMenuOpen;
  }

  function closeMenus() {
    isMenuOpen = false;
    isUserMenuOpen = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeMenus();
    }
  }

  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<nav
  class="sticky top-0 z-50 bg-primary-forest text-primary-sand shadow-lg"
  aria-label="Main navigation"
>
  <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
    <div class="flex justify-between items-center h-14">
      <!-- Logo (Left) -->
      <a
        href="/"
        class="flex items-center gap-1 font-bold hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-sky rounded px-1 py-0.5 flex-shrink-0"
        aria-label="Leopold - Nature Observer"
      >
        <img src="/sig_icon.webp" alt="Leopold Logo" class="w-4 h-4" />
        <span class="hidden sm:inline text-xs sm:text-sm font-semibold">Leopold</span>
      </a>

      <!-- Desktop Navigation (Center) -->
      <div class="hidden md:flex items-center gap-0.5 flex-1 justify-center">
        {#each navItems as item}
          <a
            href={item.href}
            class="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
            class:bg-primary-earth={isActive(item.href)}
            class:hover:bg-primary-earth={!isActive(item.href)}
            aria-label={item.ariaLabel}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <svelte:component this={item.icon} class="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </a>
        {/each}
      </div>

      <!-- Right side actions -->
      <div class="flex items-center gap-1">
        <!-- Theme Toggle -->
        <button
          on:click={handleThemeToggle}
          class="p-1.5 rounded-md hover:bg-primary-earth transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
          aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={currentTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {#if currentTheme === 'light'}
            <Moon class="w-4 h-4" />
          {:else}
            <Sun class="w-4 h-4" />
          {/if}
        </button>

        <!-- User Menu (Desktop) -->
        <div class="hidden md:block relative">
          <button
            on:click={toggleUserMenu}
            class="flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-primary-earth transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <User class="w-4 h-4 flex-shrink-0" />
            <span class="text-sm hidden sm:inline">Account</span>
          </button>

          {#if isUserMenuOpen}
            <div
              class="absolute right-0 mt-2 w-48 bg-primary-sand text-primary-forest rounded-lg shadow-xl py-2 z-50"
              role="menu"
            >
              <a
                href="/profile"
                class="flex items-center gap-2 px-4 py-2 hover:bg-secondary-moss transition-colors"
                role="menuitem"
              >
                <User class="w-4 h-4" />
                <span>Profile</span>
              </a>
              <a
                href="/settings"
                class="flex items-center gap-2 px-4 py-2 hover:bg-secondary-moss transition-colors"
                role="menuitem"
              >
                <Settings class="w-4 h-4" />
                <span>Settings</span>
              </a>
              <hr class="my-2 border-primary-stone opacity-20" />
              <button
                on:click={() => {
                  uiStore.showNotification('info', 'Logout functionality coming soon');
                  closeMenus();
                }}
                class="w-full flex items-center gap-2 px-4 py-2 hover:bg-secondary-moss transition-colors text-left"
                role="menuitem"
              >
                <LogOut class="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          {/if}
        </div>

        <!-- Mobile Menu Button -->
        <button
          on:click={toggleMenu}
          class="md:hidden p-1.5 rounded-md hover:bg-primary-earth transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          {#if isMenuOpen}
            <X class="w-5 h-5" />
          {:else}
            <Menu class="w-5 h-5" />
          {/if}
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    {#if isMenuOpen}
      <div class="md:hidden pb-3 space-y-1" role="navigation">
        {#each navItems as item}
          <a
            href={item.href}
            on:click={closeMenus}
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
            class:bg-primary-earth={isActive(item.href)}
            class:hover:bg-primary-earth={!isActive(item.href)}
            aria-label={item.ariaLabel}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <svelte:component this={item.icon} class="w-4 h-4" />
            <span>{item.label}</span>
          </a>
        {/each}

        <hr class="my-2 border-primary-stone opacity-20" />

        <a
          href="/profile"
          on:click={closeMenus}
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-earth transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
        >
          <User class="w-4 h-4" />
          <span>Profile</span>
        </a>
        <a
          href="/settings"
          on:click={closeMenus}
          class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-earth transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
        >
          <Settings class="w-4 h-4" />
          <span>Settings</span>
        </a>
      </div>
    {/if}
  </div>
</nav>

<style>
  :global([aria-current="page"]) {
    @apply bg-primary-earth;
  }
</style>

