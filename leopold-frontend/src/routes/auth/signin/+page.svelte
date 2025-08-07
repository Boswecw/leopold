<script lang="ts">
  import { goto } from '$app/navigation';
  import { apiClient } from '$lib/api/client';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let errorMessage = '';
  let loading = false;

  $: redirectTo = $page.url.searchParams.get('redirect') || '/observations';

  async function handleSignIn(event: Event) {
    event.preventDefault();
    errorMessage = '';
    loading = true;

    const result = await apiClient.signIn(email, password);

    if (result.success) {
      localStorage.setItem('auth_token', result.data.token);
      goto(redirectTo);
    } else {
      errorMessage = result.error || 'Failed to sign in';
    }

    loading = false;
  }
</script>

<section class="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-neutral-soft-black rounded-lg shadow-md">
  <h1 class="text-2xl font-bold mb-4 text-center">Sign In</h1>

  {#if errorMessage}
    <div class="mb-4 text-red-600 bg-red-100 p-3 rounded">{errorMessage}</div>
  {/if}

  <form on:submit|preventDefault={handleSignIn} class="space-y-4">
    <div>
      <label class="block mb-1 font-medium" for="email">Email</label>
      <input
        id="email"
        type="email"
        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-green-500"
        bind:value={email}
        required
      />
    </div>

    <div>
      <label class="block mb-1 font-medium" for="password">Password</label>
      <input
        id="password"
        type="password"
        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-green-500"
        bind:value={password}
        required
      />
    </div>

    <button
      type="submit"
      class="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:opacity-50"
      disabled={loading}
    >
      {loading ? 'Signing in…' : 'Sign In'}
    </button>
  </form>
</section>
