<!-- @component
no description yet
-->
<script lang="ts">
  import { Star, Send, X } from 'lucide-svelte';
  import { uiStore } from '$lib/stores';

  export let onClose: () => void = () => {};
  export let onSubmit: (feedback: FeedbackData) => Promise<void> = async () => {};

  interface FeedbackData {
    rating: number;
    category: string;
    message: string;
    email?: string;
  }

  let rating = 0;
  let category = 'general';
  let message = '';
  let email = '';
  let isSubmitting = false;

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'performance', label: 'Performance Issue' },
    { value: 'accessibility', label: 'Accessibility' }
  ];

  async function handleSubmit() {
    if (rating === 0 || !message.trim()) {
      uiStore.showNotification('error', 'Please provide a rating and message');
      return;
    }

    isSubmitting = true;
    try {
      await onSubmit({ rating, category, message, email });
      uiStore.showNotification('success', 'Thank you for your feedback!');
      onClose();
    } catch (error) {
      uiStore.showNotification('error', 'Failed to submit feedback');
    } finally {
      isSubmitting = false;
    }
  }

  function setRating(value: number) {
    rating = value;
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div class="bg-primary-sand rounded-lg shadow-xl max-w-md w-full p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-primary-forest">Share Your Feedback</h2>
      <button
        on:click={onClose}
        class="p-1 hover:bg-secondary-moss rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
        aria-label="Close feedback form"
      >
        <X class="w-5 h-5 text-primary-stone" />
      </button>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-primary-forest mb-2">
          How would you rate your experience?
        </label>
        <div class="flex gap-2">
          {#each [1, 2, 3, 4, 5] as value}
            <button
              type="button"
              on:click={() => setRating(value)}
              class="p-2 rounded transition-all focus:outline-none focus:ring-2 focus:ring-primary-sky"
              class:bg-secondary-gold={rating >= value}
              class:bg-secondary-moss={rating < value}
              aria-label="Rate {value} out of 5 stars"
              aria-pressed={rating === value}
            >
              <div class="w-6 h-6" class:text-secondary-gold={rating >= value} class:text-primary-stone={rating < value}>
                <Star class="w-6 h-6" fill={rating >= value ? 'currentColor' : 'none'} />
              </div>
            </button>
          {/each}
        </div>
      </div>

      <!-- Category -->
      <div>
        <label for="category" class="block text-sm font-medium text-primary-forest mb-2">
          Category
        </label>
        <select
          id="category"
          bind:value={category}
          class="w-full px-3 py-2 border-2 border-secondary-moss rounded-lg focus:outline-none focus:border-primary-sky transition-colors"
        >
          {#each categories as cat}
            <option value={cat.value}>{cat.label}</option>
          {/each}
        </select>
      </div>

      <!-- Message -->
      <div>
        <label for="message" class="block text-sm font-medium text-primary-forest mb-2">
          Your Feedback
        </label>
        <textarea
          id="message"
          bind:value={message}
          placeholder="Tell us what you think..."
          rows="4"
          class="w-full px-3 py-2 border-2 border-secondary-moss rounded-lg focus:outline-none focus:border-primary-sky transition-colors resize-none"
        />
      </div>

      <!-- Email (Optional) -->
      <div>
        <label for="email" class="block text-sm font-medium text-primary-forest mb-2">
          Email (Optional)
        </label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="your@email.com"
          class="w-full px-3 py-2 border-2 border-secondary-moss rounded-lg focus:outline-none focus:border-primary-sky transition-colors"
        />
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-4">
        <button
          type="button"
          on:click={onClose}
          class="flex-1 px-4 py-2 border-2 border-secondary-moss text-primary-forest rounded-lg hover:bg-secondary-moss transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          class="flex-1 px-4 py-2 bg-primary-forest text-primary-sand rounded-lg hover:bg-primary-earth transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send class="w-4 h-4" />
          {isSubmitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  textarea {
    @apply font-sans;
  }
</style>

