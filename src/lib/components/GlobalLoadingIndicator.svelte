<script lang="ts">
  import { loadingState } from '$lib/stores/loading';
  import { fade, fly } from 'svelte/transition';
  
  $: isVisible = $loadingState.isLoading;
</script>

{#if isVisible}
  <div 
    class="fixed top-4 right-4 z-40 pointer-events-none"
    transition:fly={{ y: -20, duration: 300 }}
  >
    <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700 max-w-sm">
      <div class="flex items-center space-x-3">
        <!-- Spinner -->
        <div class="w-5 h-5 border-2 border-orange-200 dark:border-gray-600 border-t-orange-500 dark:border-t-orange-400 rounded-full animate-spin"></div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {$loadingState.stage}
          </p>
          {#if $loadingState.substage}
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {$loadingState.substage}
            </p>
          {/if}
        </div>
        
        <!-- Progress -->
        {#if $loadingState.progress > 0}
          <div class="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {Math.round($loadingState.progress)}%
          </div>
        {/if}
      </div>
      
      <!-- Progress bar -->
      {#if $loadingState.progress > 0}
        <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div 
            class="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-300 ease-out"
            style="width: {$loadingState.progress}%"
          ></div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Custom animations for the loading indicator */
  .pointer-events-none {
    pointer-events: none;
  }
</style>
