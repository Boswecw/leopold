<!-- @component
no description yet
-->
<script lang="ts">
  import { Trophy, Medal, Flame } from 'lucide-svelte';

  interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatar?: string;
    score: number;
    observations: number;
    streak?: number;
  }

  export let entries: LeaderboardEntry[] = [];
  export let title: string = 'Leaderboard';
  export let timeframe: 'week' | 'month' | 'all' = 'month';
  export let currentUserId: string = '';

  function getMedalIcon(rank: number) {
    switch (rank) {
      case 1:
        return Trophy;
      case 2:
        return Medal;
      case 3:
        return Medal;
      default:
        return null;
    }
  }

  function getMedalColor(rank: number): string {
    switch (rank) {
      case 1:
        return 'text-secondary-gold';
      case 2:
        return 'text-neutral-stone';
      case 3:
        return 'text-primary-earth';
      default:
        return 'text-primary-stone';
    }
  }
</script>

<div class="bg-primary-sand rounded-lg shadow-lg p-6">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-2xl font-bold text-primary-forest flex items-center gap-2">
        <Trophy class="w-6 h-6 text-secondary-gold" />
        {title}
      </h2>
      <p class="text-sm text-primary-stone opacity-70 mt-1">
        Top observers this {timeframe}
      </p>
    </div>
  </div>

  <!-- Leaderboard Table -->
  <div class="overflow-x-auto">
    <table class="w-full" aria-label={title}>
      <thead>
        <tr class="border-b-2 border-secondary-moss">
          <th class="text-left py-3 px-4 font-semibold text-primary-forest">Rank</th>
          <th class="text-left py-3 px-4 font-semibold text-primary-forest">Observer</th>
          <th class="text-center py-3 px-4 font-semibold text-primary-forest">Observations</th>
          <th class="text-center py-3 px-4 font-semibold text-primary-forest">Score</th>
          <th class="text-center py-3 px-4 font-semibold text-primary-forest">Streak</th>
        </tr>
      </thead>
      <tbody>
        {#each entries as entry}
          <tr
            class="border-b border-secondary-moss hover:bg-secondary-moss transition-colors"
            class:bg-secondary-gold-light={entry.userId === currentUserId}
          >
            <!-- Rank -->
            <td class="py-4 px-4">
              <div class="flex items-center gap-2">
                {#if entry.rank <= 3}
                  <svelte:component
                    this={getMedalIcon(entry.rank)}
                    class="w-5 h-5 {getMedalColor(entry.rank)}"
                  />
                {/if}
                <span class="font-bold text-lg text-primary-forest">#{entry.rank}</span>
              </div>
            </td>

            <!-- Observer -->
            <td class="py-4 px-4">
              <div class="flex items-center gap-3">
                {#if entry.avatar}
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    class="w-8 h-8 rounded-full object-cover"
                  />
                {:else}
                  <div class="w-8 h-8 rounded-full bg-primary-sky flex items-center justify-center text-primary-forest font-bold text-sm">
                    {entry.username.charAt(0).toUpperCase()}
                  </div>
                {/if}
                <div>
                  <p class="font-medium text-primary-forest">{entry.username}</p>
                  {#if entry.userId === currentUserId}
                    <p class="text-xs text-primary-sky">You</p>
                  {/if}
                </div>
              </div>
            </td>

            <!-- Observations -->
            <td class="py-4 px-4 text-center">
              <span class="font-semibold text-primary-forest">{entry.observations}</span>
            </td>

            <!-- Score -->
            <td class="py-4 px-4 text-center">
              <span class="font-bold text-lg text-primary-sky">{entry.score}</span>
            </td>

            <!-- Streak -->
            <td class="py-4 px-4 text-center">
              {#if entry.streak && entry.streak > 0}
                <div class="flex items-center justify-center gap-1">
                  <Flame class="w-4 h-4 text-secondary-gold" />
                  <span class="font-semibold text-primary-forest">{entry.streak}</span>
                </div>
              {:else}
                <span class="text-primary-stone opacity-50">-</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if entries.length === 0}
    <div class="text-center py-8">
      <p class="text-primary-stone opacity-70">No leaderboard data available yet</p>
    </div>
  {/if}
</div>

<style>
  :global(.bg-secondary-gold-light) {
    @apply bg-secondary-gold bg-opacity-20;
  }
</style>

