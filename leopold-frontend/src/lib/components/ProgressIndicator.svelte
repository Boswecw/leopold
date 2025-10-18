<script lang="ts">
  import { Check } from 'lucide-svelte';

  interface Step {
    id: string;
    label: string;
    description?: string;
  }

  export let steps: Step[] = [];
  export let currentStep: number = 0;
  export let completedSteps: number[] = [];
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';

  $: progress = ((currentStep + 1) / steps.length) * 100;

  function isStepCompleted(index: number): boolean {
    return completedSteps.includes(index) || index < currentStep;
  }

  function isStepActive(index: number): boolean {
    return index === currentStep;
  }
</script>

<div
  class="w-full"
  role="progressbar"
  aria-valuenow={currentStep + 1}
  aria-valuemin={1}
  aria-valuemax={steps.length}
  aria-label="Progress through form steps"
>
  {#if orientation === 'horizontal'}
    <!-- Horizontal Progress -->
    <div class="space-y-4">
      <!-- Progress Bar -->
      <div class="w-full bg-secondary-moss rounded-full h-2 overflow-hidden">
        <div
          class="bg-primary-forest h-full transition-all duration-300"
          style="width: {progress}%"
        />
      </div>

      <!-- Steps -->
      <div class="flex justify-between items-start">
        {#each steps as step, index}
          <div class="flex flex-col items-center flex-1">
            <!-- Step Circle -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 mb-2"
              class:bg-primary-forest={isStepActive(index)}
              class:bg-primary-sky={isStepCompleted(index) && !isStepActive(index)}
              class:bg-secondary-moss={!isStepCompleted(index) && !isStepActive(index)}
              class:text-primary-sand={isStepActive(index) || isStepCompleted(index)}
              class:text-primary-forest={!isStepCompleted(index) && !isStepActive(index)}
              aria-current={isStepActive(index) ? 'step' : undefined}
            >
              {#if isStepCompleted(index)}
                <Check class="w-5 h-5" />
              {:else}
                {index + 1}
              {/if}
            </div>

            <!-- Step Label -->
            <div class="text-center">
              <p
                class="text-sm font-medium transition-colors duration-300"
                class:text-primary-forest={isStepActive(index)}
                class:text-primary-sky={isStepCompleted(index) && !isStepActive(index)}
                class:text-primary-stone={!isStepCompleted(index) && !isStepActive(index)}
              >
                {step.label}
              </p>
              {#if step.description}
                <p class="text-xs text-primary-stone opacity-70 mt-1">
                  {step.description}
                </p>
              {/if}
            </div>

            <!-- Connector Line -->
            {#if index < steps.length - 1}
              <div
                class="hidden sm:block absolute w-12 h-0.5 mt-5 ml-12 transition-all duration-300"
                class:bg-primary-sky={isStepCompleted(index)}
                class:bg-secondary-moss={!isStepCompleted(index)}
              />
            {/if}
          </div>
        {/each}
      </div>

      <!-- Step Counter -->
      <div class="text-center text-sm text-primary-stone">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  {:else}
    <!-- Vertical Progress -->
    <div class="space-y-4">
      {#each steps as step, index}
        <div class="flex gap-4">
          <!-- Left Side: Circle and Line -->
          <div class="flex flex-col items-center">
            <!-- Step Circle -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 flex-shrink-0"
              class:bg-primary-forest={isStepActive(index)}
              class:bg-primary-sky={isStepCompleted(index) && !isStepActive(index)}
              class:bg-secondary-moss={!isStepCompleted(index) && !isStepActive(index)}
              class:text-primary-sand={isStepActive(index) || isStepCompleted(index)}
              class:text-primary-forest={!isStepCompleted(index) && !isStepActive(index)}
              aria-current={isStepActive(index) ? 'step' : undefined}
            >
              {#if isStepCompleted(index)}
                <Check class="w-5 h-5" />
              {:else}
                {index + 1}
              {/if}
            </div>

            <!-- Connector Line -->
            {#if index < steps.length - 1}
              <div
                class="w-0.5 h-12 mt-2 transition-all duration-300"
                class:bg-primary-sky={isStepCompleted(index)}
                class:bg-secondary-moss={!isStepCompleted(index)}
              />
            {/if}
          </div>

          <!-- Right Side: Content -->
          <div class="pb-8">
            <h3
              class="font-medium transition-colors duration-300"
              class:text-primary-forest={isStepActive(index)}
              class:text-primary-sky={isStepCompleted(index) && !isStepActive(index)}
              class:text-primary-stone={!isStepCompleted(index) && !isStepActive(index)}
            >
              {step.label}
            </h3>
            {#if step.description}
              <p class="text-sm text-primary-stone opacity-70 mt-1">
                {step.description}
              </p>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global([aria-current="step"]) {
    @apply ring-2 ring-offset-2 ring-primary-forest;
  }
</style>

