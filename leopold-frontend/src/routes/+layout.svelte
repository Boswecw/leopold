<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../app.css';

	let sidebarOpen = false;

	onMount(() => {
	  // Any init logic
	});
</script>

<div class="app-layout">
	<header class="app-header bg-green-600 text-white p-4">
		<div class="container mx-auto flex items-center justify-between">
			<!-- Logo and Brand -->
			<div class="flex items-center gap-4">
				<div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
					<img src="/leopold-logo.svg" alt="Leopold Logo" class="w-12 h-12" />
				</div>
				<h1 class="text-3xl font-bold">Leopold</h1>
			</div>

			<!-- Desktop Nav -->
			<nav class="hidden md:flex gap-4">
				<a href="/" class:text-green-200={$page.url.pathname === '/'} class:font-semibold={$page.url.pathname === '/'}>Home</a>
				<a href="/observations" class:text-green-200={$page.url.pathname.startsWith('/observations')} class:font-semibold={$page.url.pathname.startsWith('/observations')}>Observations</a>
				<a href="/about" class:text-green-200={$page.url.pathname === '/about'} class:font-semibold={$page.url.pathname === '/about'}>About</a>
			</nav>

			<!-- Mobile Nav Toggle -->
			<button 
				class="md:hidden p-2 hover:bg-green-700 rounded"
				on:click={() => (sidebarOpen = !sidebarOpen)}
				aria-label="Toggle navigation menu"
			>
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		</div>

		{#if sidebarOpen}
			<div class="md:hidden mt-4 border-t border-green-500 pt-4">
				<nav class="flex flex-col space-y-2">
					<a href="/" class="block py-2 px-4 hover:bg-green-700 rounded" on:click={() => (sidebarOpen = false)}>Home</a>
					<a href="/observations" class="block py-2 px-4 hover:bg-green-700 rounded" on:click={() => (sidebarOpen = false)}>Observations</a>
					<a href="/about" class="block py-2 px-4 hover:bg-green-700 rounded" on:click={() => (sidebarOpen = false)}>About</a>
				</nav>
			</div>
		{/if}
	</header>

	<main class="app-main flex-1 min-h-screen">
		<slot />
	</main>

	<footer class="app-footer bg-gray-700 text-white p-4 text-center">
		<div class="container mx-auto">
			<p>&copy; 2024 Leopold Nature Observer. Conservation through community science.</p>
			<p class="text-sm text-gray-400 mt-2">Named after Aldo Leopold (1887–1948)</p>
		</div>
	</footer>
</div>

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}
	.app-main {
		flex: 1;
	}
</style>
