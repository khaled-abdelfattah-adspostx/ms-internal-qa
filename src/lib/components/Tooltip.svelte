<script lang="ts">
  import { onMount } from 'svelte';
  import { Info } from 'lucide-svelte';

  export let text: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  let showTooltip = false;
  let tooltipElement: HTMLDivElement;
  let triggerElement: HTMLDivElement;

  function handleMouseEnter() {
    showTooltip = true;
  }

  function handleMouseLeave() {
    showTooltip = false;
  }

  function handleFocus() {
    showTooltip = true;
  }

  function handleBlur() {
    showTooltip = false;
  }
  // Position classes for tooltip
  $: positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }[position];

  $: arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-ms-navy',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-ms-navy',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-ms-navy',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-ms-navy'
  }[position];
</script>

<div 
  bind:this={triggerElement}
  class="relative inline-flex items-center"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  role="button"
  tabindex="0"
  on:focus={handleFocus}
  on:blur={handleBlur}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      showTooltip = !showTooltip;
    }
  }}
>
  <Info class="w-4 h-4 text-ms-orange-400 hover:text-ms-orange-500 cursor-help transition-colors duration-200" />
  
  {#if showTooltip}    <div 
      bind:this={tooltipElement}
      class="tooltip absolute z-50 px-3 py-2 text-xs text-white bg-ms-navy rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-fadeIn {positionClasses}"
      style="opacity: 1;"
    >
      {text}
      <!-- Tooltip arrow -->
      <div class="absolute w-0 h-0 border-4 border-transparent {arrowClasses}"></div>
    </div>
  {/if}
</div>
