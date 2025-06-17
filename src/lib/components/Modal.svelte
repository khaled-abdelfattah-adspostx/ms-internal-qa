<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;
  export let title = '';  export let size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' = 'md';
  export let closable = true;

  const dispatch = createEventDispatcher<{
    close: void;
    open: void;
  }>();
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    fullscreen: 'max-w-[95vw] h-[95vh]'
  };

  function closeModal() {
    isOpen = false;
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget && closable) {
      closeModal();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closable) {
      closeModal();
    }
  }

  $: if (isOpen) {
    dispatch('open');
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="modal animate-fade-in"
    on:click={handleBackdropClick}
    on:keydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    tabindex="-1"
  >    <!-- Modal content -->
    <div class="modal-content {sizeClasses[size]} {size === 'fullscreen' ? 'overflow-hidden flex flex-col' : ''} animate-slide-in shadow-2xl border-2 border-brand-gray-100">
      {#if title || closable}
        <div class="flex items-center justify-between mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 -m-8 mb-6 rounded-t-2xl border-b border-brand-gray-200">
          {#if title}
            <h3 id="modal-title" class="text-xl font-bold ms-text-gradient flex items-center gap-3">
              <div class="p-2 ms-brand-gradient rounded-lg">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              {title}
            </h3>
          {:else}
            <div></div>
          {/if}
          
          {#if closable}
            <button 
              type="button"
              class="p-2 text-brand-gray-400 hover:text-brand-primary hover:bg-white rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 shadow-md"
              on:click={closeModal}
              aria-label="Close modal"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </div>
      {/if}
        <!-- Modal body -->
      <div class="modal-body {size === 'fullscreen' ? 'flex-1 overflow-hidden' : ''}">
        <slot />
      </div>
    </div>
  </div>
{/if}
