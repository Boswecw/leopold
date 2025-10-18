<script lang="ts">
  import { Search, X } from 'lucide-svelte';
  import { debounce } from '$lib/utils';

  interface Suggestion {
    id: string;
    label: string;
    description?: string;
    icon?: string;
  }

  export let suggestions: Suggestion[] = [];
  export let value: string = '';
  export let placeholder: string = 'Search...';
  export let label: string = '';
  export let onSearch: (query: string) => Promise<void> = async () => {};
  export let onSelect: (suggestion: Suggestion) => void = () => {};
  export let minChars: number = 2;
  export let maxSuggestions: number = 8;

  let isOpen = false;
  let isLoading = false;
  let filteredSuggestions: Suggestion[] = [];
  let selectedIndex = -1;
  let inputElement: HTMLInputElement;

  const debouncedSearch = debounce(async (query: string) => {
    if (query.length < minChars) {
      filteredSuggestions = [];
      isOpen = false;
      return;
    }

    isLoading = true;
    try {
      await onSearch(query);
      filteredSuggestions = suggestions.slice(0, maxSuggestions);
      isOpen = filteredSuggestions.length > 0;
      selectedIndex = -1;
    } finally {
      isLoading = false;
    }
  }, 300);

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = target.value;
    debouncedSearch(value);
  }

  function handleSelect(suggestion: Suggestion) {
    value = suggestion.label;
    onSelect(suggestion);
    isOpen = false;
    filteredSuggestions = [];
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (!isOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredSuggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        isOpen = false;
        break;
    }
  }

  function clearInput() {
    value = '';
    filteredSuggestions = [];
    isOpen = false;
    inputElement?.focus();
  }
</script>

<div class="relative w-full">
  {#if label}
    <label for="autosuggest-input" class="block text-sm font-medium text-primary-forest mb-2">
      {label}
    </label>
  {/if}

  <div class="relative">
    <div class="relative flex items-center">
      <Search class="absolute left-3 w-4 h-4 text-primary-stone opacity-50 pointer-events-none" />
      <input
        bind:this={inputElement}
        id="autosuggest-input"
        type="text"
        {value}
        {placeholder}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        on:focus={() => {
          if (filteredSuggestions.length > 0) isOpen = true;
        }}
        on:blur={() => {
          setTimeout(() => {
            isOpen = false;
          }, 200);
        }}
        class="w-full pl-10 pr-10 py-2 border-2 border-secondary-moss rounded-lg focus:outline-none focus:border-primary-sky transition-colors"
        aria-label={label || placeholder}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls="suggestions-list"
        role="combobox"
      />

      {#if value}
        <button
          on:click={clearInput}
          class="absolute right-3 p-1 hover:bg-secondary-moss rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-sky"
          aria-label="Clear input"
        >
          <X class="w-4 h-4 text-primary-stone" />
        </button>
      {/if}
    </div>

    {#if isLoading}
      <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div class="animate-spin">
          <Search class="w-4 h-4 text-primary-sky" />
        </div>
      </div>
    {/if}
  </div>

  <!-- Suggestions Dropdown -->
  {#if isOpen && filteredSuggestions.length > 0}
    <ul
      id="suggestions-list"
      class="absolute top-full left-0 right-0 mt-2 bg-primary-sand border-2 border-secondary-moss rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
      role="listbox"
    >
      {#each filteredSuggestions as suggestion, index}
        <li
          role="option"
          aria-selected={index === selectedIndex}
          class="px-4 py-3 cursor-pointer transition-colors border-b border-secondary-moss last:border-b-0"
          class:bg-secondary-moss={index === selectedIndex}
          class:hover:bg-secondary-moss={index !== selectedIndex}
          on:click={() => handleSelect(suggestion)}
          on:keydown={(e) => {
            if (e.key === 'Enter') handleSelect(suggestion);
          }}
        >
          <div class="flex items-center gap-2">
            {#if suggestion.icon}
              <span class="text-lg">{suggestion.icon}</span>
            {/if}
            <div>
              <p class="font-medium text-primary-forest">{suggestion.label}</p>
              {#if suggestion.description}
                <p class="text-xs text-primary-stone opacity-70">{suggestion.description}</p>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if isOpen && filteredSuggestions.length === 0 && !isLoading && value.length >= minChars}
    <div class="absolute top-full left-0 right-0 mt-2 bg-primary-sand border-2 border-secondary-moss rounded-lg shadow-lg p-4 text-center text-primary-stone">
      No suggestions found
    </div>
  {/if}
</div>

<style>
  :global([aria-selected="true"]) {
    @apply bg-secondary-moss;
  }
</style>

