<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { base } from '$app/paths';
  import InputField from '$lib/components/InputField.svelte';
  import SelectField from '$lib/components/SelectField.svelte';
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { Menu, Settings, History, PlayCircle, HelpCircle } from 'lucide-svelte';
  
  // Lazy load heavy components for better performance
  let ApiRequestBuilder: any;
  let RequestHistory: any;
  
  // Store for active tab
  const activeTab = writable('api-builder');
  
  // Reactive variables
  let sidebarOpen = false;
  let mounted = false;
  let componentsLoaded = false;
  
  // Dynamic import functions for better performance
  async function loadApiRequestBuilder() {
    if (!ApiRequestBuilder) {
      try {
        const module = await import('$lib/components/ApiRequestBuilder.svelte');
        ApiRequestBuilder = module.default;
      } catch (error) {
        console.error('Failed to load API Builder:', error);
      }
    }
    return ApiRequestBuilder;
  }
  
  async function loadRequestHistory() {
    if (!RequestHistory) {
      try {
        const module = await import('$lib/components/RequestHistory.svelte');
        RequestHistory = module.default;
      } catch (error) {
        console.error('Failed to load Request History:', error);
      }
    }
    return RequestHistory;
  }
  
  // Tab configuration
  const tabs = [
    { id: 'api-builder', label: 'API Builder', icon: PlayCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'help', label: 'Help & Guide', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];
  
  onMount(() => {
    console.log('📄 Main page mounted');
    mounted = true;
    
    // Preload components after initial render with staggered loading
    setTimeout(async () => {
      try {
        console.log('📦 Loading components...');
        // Load components in parallel for better performance
        await Promise.allSettled([
          loadApiRequestBuilder(),
          loadRequestHistory()
        ]);
        componentsLoaded = true;
        console.log('✅ Components loaded successfully');
      } catch (error) {
        console.error('❌ Component loading failed:', error);
        componentsLoaded = true; // Still mark as loaded to show UI
      }
    }, 50); // Reduced delay for faster perceived performance
  });
  
  function setActiveTab(tabId: string) {
    activeTab.set(tabId);
    
    // Close sidebar on mobile when tab is selected
    if (window.innerWidth < 768) {
      sidebarOpen = false;
    }
  }
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<svelte:head>
  <title>MomentScience QA Tools - Testing Suite</title>
  <meta name="description" content="Professional API testing tools for MomentScience development team" />
</svelte:head>

<!-- Mobile header -->
<div class="md:hidden bg-white shadow-lg border-b border-brand-gray-200 p-4 backdrop-blur-sm bg-opacity-95">
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3 animate-fade-in">
      <!-- MomentScience logo -->
      <img src="{base}/ms-logo.svg" alt="MomentScience Logo" class="w-8 h-8 drop-shadow-md" />
      <div>
        <h1 class="text-lg font-bold ms-text-gradient">QA Tools</h1>
        <p class="text-xs text-brand-gray-600">MomentScience</p>
      </div>
    </div>
    <div class="flex items-center space-x-3">
      <button
        on:click={toggleSidebar}
        class="p-3 rounded-xl text-brand-gray-600 hover:text-brand-primary hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md"
        aria-label="Toggle navigation"
      >
        <Menu class="w-6 h-6" />
      </button>
    </div>
  </div>
</div>

<div class="flex h-screen gradient-bg overflow-hidden">
  <!-- Sidebar -->
  <div class="
    {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:translate-x-0 
    transition-all duration-500 ease-out
    fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-2xl border-r border-brand-gray-200 dark:border-gray-600
  ">
    <!-- Desktop header -->
    <div class="hidden md:flex items-center justify-between p-6 border-b border-brand-gray-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800 animate-fade-in">
      <div class="flex items-center space-x-4">
        <!-- MomentScience logo -->
        <img src="{base}/ms-logo.svg" alt="MomentScience Logo" class="w-12 h-12 drop-shadow-lg" />
        <div>
          <h1 class="text-xl font-bold ms-text-gradient">QA Tools</h1>
          <p class="text-sm text-brand-gray-600 dark:text-gray-300 font-medium">MomentScience Testing Suite</p>
        </div>
      </div>
    </div>
    
    <!-- Navigation -->
    <nav class="flex-1 p-4">
      <ul class="space-y-3">
        {#each tabs as tab, index}
          <li class="animate-slide-in" style="animation-delay: {index * 0.1}s">
            <button
              on:click={() => setActiveTab(tab.id)}
              class="
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group transform hover:scale-105 active:scale-95
                {$activeTab === tab.id 
                  ? 'ms-brand-gradient text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/20' 
                  : 'text-brand-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:shadow-md'
                }
              "
            >
              <svelte:component this={tab.icon} class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span class="font-semibold">{tab.label}</span>
              {#if $activeTab === tab.id}
                <div class="ml-auto w-2 h-2 bg-white rounded-full animate-pulse-gentle"></div>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    </nav>
    
    <!-- Footer -->
    <div class="p-4 border-t border-brand-gray-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800">
      <div class="text-center animate-fade-in">
        <div class="flex items-center justify-center space-x-2 mb-2">
          <img src="{base}/ms-logo.svg" alt="MomentScience Logo" class="w-4 h-4" />
          <span class="text-xs font-bold ms-text-gradient">MomentScience</span>
        </div>
        <p class="text-xs text-brand-gray-500 dark:text-gray-400">
          Internal QA Tools<br />
          <span class="font-semibold">Version 1.0.0</span>
        </p>
      </div>
    </div>
  </div>
  
  <!-- Overlay for mobile -->
  {#if sidebarOpen}
    <div 
      class="fixed inset-0 bg-brand-gray-900 bg-opacity-60 backdrop-blur-sm z-40 md:hidden transition-all duration-500"
      on:click={toggleSidebar}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
    ></div>
  {/if}
  
  <!-- Main content -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Content area -->
    <main class="flex-1 overflow-auto p-4 md:p-8">
      {#if mounted}
        <div class="animate-fade-in">
          {#if $activeTab === 'api-builder'}
            {#if componentsLoaded && ApiRequestBuilder}
              <svelte:component this={ApiRequestBuilder} />
            {:else}
              <div class="section-card text-center py-12">
                <div class="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-brand-gray-600 dark:text-gray-400">Loading API Request Builder...</p>
              </div>
            {/if}
          {:else if $activeTab === 'history'}
            {#if componentsLoaded && RequestHistory}
              <svelte:component this={RequestHistory} />
            {:else}
              <div class="section-card text-center py-12">
                <div class="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-brand-gray-600 dark:text-gray-400">Loading Request History...</p>
              </div>
            {/if}
          {:else if $activeTab === 'help'}
            <div class="section-card card-hover animate-slide-in bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-700">
              <div class="flex items-center space-x-3 mb-6">
                <div class="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <HelpCircle class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-300">Help & Quick Guide</h2>
                  <p class="text-brand-gray-600 dark:text-gray-300">Get started with our QA tools in minutes</p>
                </div>
              </div>

              <div class="space-y-6">
                <!-- Getting Started -->
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">🚀 Getting Started</h3>
                  <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>• Choose an <strong>API Endpoint</strong> from the dropdown or select "Custom Endpoint" for your own APIs</p>
                    <p>• Configure your <strong>environment</strong> (staging or production) and API credentials</p>
                    <p>• Add request parameters and JSON body as needed</p>
                    <p>• Hit "Send Request" and watch the magic happen! ✨</p>
                  </div>
                </div>

                <!-- Key Features -->
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">⚡ Key Features</h3>
                  <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <h4 class="font-medium text-blue-600 dark:text-blue-400 mb-2">API Testing</h4>
                      <p>• Pre-configured MomentScience endpoints</p>
                      <p>• Custom endpoint support</p>
                      <p>• Real-time response viewer</p>
                      <p>• JSON syntax highlighting</p>
                    </div>
                    <div>
                      <h4 class="font-medium text-blue-600 dark:text-blue-400 mb-2">QA Workflow</h4>
                      <p>• Auto-generated cURL commands</p>
                      <p>• Request/response history</p>
                      <p>• Bug report generator</p>
                      <p>• Performance timing breakdown</p>
                    </div>
                  </div>
                </div>

                <!-- Tips & Tricks -->
                <div class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">💡 Pro Tips</h3>
                  <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>• Use the <strong>Visual JSON Builder</strong> to create request bodies without syntax errors</p>
                    <p>• Star your favorite endpoints for quick access</p>
                    <p>• Copy responses and cURL commands with one click</p>
                    <p>• Toggle between light and dark themes using the floating button</p>
                    <p>• Search through JSON responses to find specific values quickly</p>
                  </div>
                </div>

                <!-- Custom Endpoints -->
                <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700">
                  <h3 class="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-3">🔧 Custom Endpoints</h3>
                  <div class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>• Select "Custom Endpoint" from the API Endpoint dropdown</p>
                    <p>• Enter your endpoint path (e.g., <code class="bg-gray-200 dark:bg-gray-700 px-1 rounded">/api/v1/users</code>)</p>
                    <p>• Choose the HTTP method (GET, POST, PUT, DELETE)</p>
                    <p>• Add headers and body data as needed</p>
                  </div>
                </div>

                <!-- Need Help? -->
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-700 text-center">
                  <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">🤔 Need Help?</h3>
                  <p class="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    These tools are designed to make API testing as smooth as your morning coffee ☕
                  </p>
                  <p class="text-xs text-green-600 dark:text-green-400">
                    Built with ❤️ for the MomentScience QA team
                  </p>
                </div>
              </div>
            </div>
          {:else if $activeTab === 'settings'}
            <div class="section-card card-hover animate-slide-in">
              <div class="flex items-center space-x-3 mb-6">
                <div class="p-3 ms-brand-gradient rounded-xl">
                  <Settings class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold ms-text-gradient">Settings</h2>
                  <p class="text-brand-gray-600">Configure your QA tools preferences</p>
                </div>
              </div>
              <div class="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-100">
                <p class="text-brand-gray-700 font-medium">🚧 Settings panel coming soon...</p>
                <p class="text-sm text-brand-gray-600 mt-2">We're working on adding customization options for your testing workflow.</p>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <!-- Loading state -->
        <div class="flex items-center justify-center h-64">
          <div class="relative">
            <div class="animate-spin rounded-full h-16 w-16 border-4 border-orange-200"></div>
            <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-primary absolute top-0 left-0"></div>
            <img src="{base}/ms-logo.svg" alt="Loading" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 animate-pulse-gentle" />
          </div>
        </div>
      {/if}
    </main>
  </div>
</div>

<!-- Floating Theme Toggle -->
<div class="fixed bottom-6 right-6 z-50">
  <ThemeToggle />
</div>
