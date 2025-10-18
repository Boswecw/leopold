<script lang="ts">
  import { Award, Lock } from 'lucide-svelte';

  interface BadgeData {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: 'gold' | 'silver' | 'bronze' | 'forest' | 'sky';
    unlocked: boolean;
    unlockedDate?: Date;
    progress?: number; // 0-100
    requirement?: string;
  }

  export let badge: BadgeData;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showDetails = false;

  const colorMap = {
    gold: 'bg-secondary-gold text-primary-forest',
    silver: 'bg-neutral-stone text-primary-sand',
    bronze: 'bg-primary-earth text-primary-sand',
    forest: 'bg-primary-forest text-primary-sand',
    sky: 'bg-primary-sky text-primary-forest'
  };

  const sizeMap = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base'
  };

  $: badgeClass = `${colorMap[badge.color]} ${sizeMap[size]}`;
</script>

<div class="flex flex-col items-center gap-2">
  <div
    class="relative flex items-center justify-center rounded-full font-bold transition-transform hover:scale-110 cursor-pointer {badgeClass}"
    role="img"
    aria-label={badge.name}
    title={badge.description}
  >
    {#if badge.unlocked}
      <span class="text-2xl">{badge.icon}</span>
    {:else}
      <Lock class="w-6 h-6 opacity-50" />
    {/if}

    {#if badge.progress !== undefined && !badge.unlocked}
      <div class="absolute inset-0 rounded-full border-4 border-transparent" style="border-top-color: currentColor; border-right-color: currentColor; transform: rotate({(badge.progress / 100) * 360}deg);" />
    {/if}
  </div>

  {#if showDetails}
    <div class="text-center">
      <h3 class="font-semibold text-primary-forest">{badge.name}</h3>
      <p class="text-xs text-primary-stone opacity-70">{badge.description}</p>

      {#if badge.progress !== undefined && !badge.unlocked}
        <div class="mt-2 w-24 bg-secondary-moss rounded-full h-2">
          <div
            class="bg-primary-sky h-full rounded-full transition-all"
            style="width: {badge.progress}%"
          />
        </div>
        <p class="text-xs text-primary-stone mt-1">{badge.progress}% Complete</p>
      {/if}

      {#if badge.unlocked && badge.unlockedDate}
        <p class="text-xs text-primary-sky mt-1">
          Unlocked {new Date(badge.unlockedDate).toLocaleDateString()}
        </p>
      {/if}

      {#if badge.requirement}
        <p class="text-xs text-primary-stone opacity-70 mt-2">{badge.requirement}</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  :global([role="img"]) {
    @apply shadow-md;
  }
</style>

