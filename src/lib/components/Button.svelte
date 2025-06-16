<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const dispatch = createEventDispatcher<{
    click: MouseEvent;
  }>();
  const variantClasses = {
    primary: 'btn btn-primary animate-fade-in',
    secondary: 'btn btn-secondary animate-fade-in',
    danger: 'btn btn-danger animate-fade-in',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 focus:ring-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300'
  };
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold'
  };
  $: buttonClass = `
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${fullWidth ? 'w-full' : ''} 
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
    inline-flex items-center justify-center rounded-xl border border-transparent 
    shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 
    transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
    hover:shadow-xl transform hover:scale-105 active:scale-95
  `.trim().replace(/\s+/g, ' ');

  function handleClick(event: MouseEvent) {
    if (!disabled && !loading) {
      dispatch('click', event);
    }
  }
</script>

<button
  {type}
  class={buttonClass}
  disabled={disabled || loading}
  on:click={handleClick}
  {...$$restProps}
>  {#if loading}
    <div class="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
  {/if}
  
  <slot />
</button>
