<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  
  onMount(() => {
    console.log('🚀 App loaded directly - no loading screen');
  });
</script>

<!-- Main Application - No Loading Screen -->
<div class="relative">
  <slot />
</div>
