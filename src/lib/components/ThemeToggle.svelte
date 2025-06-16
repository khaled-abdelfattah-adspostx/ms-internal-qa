<script lang="ts">
  import { onMount } from 'svelte';
  import { Sun, Moon, Monitor } from 'lucide-svelte';
  
  let theme: 'light' | 'dark' | 'auto' = 'auto';
  let mounted = false;

  onMount(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('ms-qa-theme') as 'light' | 'dark' | 'auto' || 'auto';
    theme = savedTheme;
    mounted = true;
    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  });

  function handleSystemThemeChange() {
    if (theme === 'auto') {
      applyTheme();
    }
  }

  function applyTheme() {
    if (!mounted) return;
    
    let effectiveTheme = theme;
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save preference
    localStorage.setItem('ms-qa-theme', theme);
  }

  function setTheme(newTheme: 'light' | 'dark' | 'auto') {
    theme = newTheme;
    applyTheme();
  }

  $: if (mounted) applyTheme();
</script>

<div class="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg border-2 border-brand-gray-200 dark:border-gray-600 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
  <button
    on:click={() => setTheme('light')}
    class="p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 {theme === 'light' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-gray-600 hover:bg-brand-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
    title="Light mode"
  >
    <Sun class="w-5 h-5" />
  </button>
  
  <button
    on:click={() => setTheme('auto')}
    class="p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 {theme === 'auto' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-gray-600 hover:bg-brand-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
    title="Auto (system)"
  >
    <Monitor class="w-5 h-5" />
  </button>
  
  <button
    on:click={() => setTheme('dark')}
    class="p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 {theme === 'dark' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-gray-600 hover:bg-brand-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}"
    title="Dark mode"
  >
    <Moon class="w-5 h-5" />
  </button>
</div>
