<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Tooltip from './Tooltip.svelte';

  // Props
  export let id: string;
  export let label: string;
  export let value: string = '';
  export let type: 'text' | 'password' | 'email' | 'url' = 'text';
  export let placeholder: string = '';
  export let required: boolean = false;
  export let disabled: boolean = false;
  export let error: string = '';
  export let tooltip: string = '';
  export let rows: number | undefined = undefined; // For textarea

  // Internal state
  let inputElement: HTMLInputElement | HTMLTextAreaElement;
  let focused = false;

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    input: string;
    change: string;
    focus: void;
    blur: void;
  }>();
  // Reactive class computation
  $: inputClass = `input-field ${error ? 'error' : ''} ${disabled ? 'opacity-50' : ''} ${focused ? 'ring-2 ring-brand-primary border-transparent' : ''}`;
  $: labelClass = `input-label ${focused ? 'ms-text-gradient' : ''}`;
  $: containerClass = `relative animate-fade-in ${focused ? 'transform scale-[1.02]' : ''} transition-all duration-300`;

  // Event handlers
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    value = target.value;
    dispatch('input', value);
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    dispatch('change', target.value);
  }

  function handleFocus() {
    focused = true;
    dispatch('focus');
  }

  function handleBlur() {
    focused = false;
    dispatch('blur');
  }

  // Public method to focus the input
  export function focus() {
    inputElement?.focus();
  }
</script>

<div class={containerClass}>
  <div class="flex items-center gap-2 mb-2">
    <label for={id} class={labelClass}>
      {label}
      {#if required}
        <span class="text-brand-primary animate-pulse-gentle">*</span>
      {/if}
    </label>
    {#if tooltip}
      <Tooltip text={tooltip} />
    {/if}
  </div>
  
  {#if rows !== undefined}
    <!-- Textarea -->
    <textarea
      bind:this={inputElement}
      {id}
      {placeholder}
      {required}
      {disabled}
      {rows}
      {value}
      class={inputClass}
      on:input={handleInput}
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
    ></textarea>
  {:else}
    <!-- Input -->
    <input
      bind:this={inputElement}
      {id}
      {type}
      {placeholder}
      {required}
      {disabled}
      {value}
      class={inputClass}
      on:input={handleInput}
      on:change={handleChange}
      on:focus={handleFocus}
      on:blur={handleBlur}
    />
  {/if}
    {#if error}
    <div class="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-in">
      <div class="p-1 bg-red-100 rounded-full">
        <svg class="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
      <p class="text-red-700 text-sm font-medium">{error}</p>
    </div>
  {/if}
</div>
