<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import { 
    Copy, 
    Search, 
    Maximize, 
    Minimize, 
    Eye, 
    Code, 
    Clock, 
    Diff,
    ChevronDown,
    ChevronRight,
    Download,
    AlertTriangle
  } from 'lucide-svelte';
  import type { ApiResponse } from '$lib/types';

  export let response: ApiResponse | null = null;
  export let previousResponse: ApiResponse | null = null;

  let viewMode: 'formatted' | 'raw' = 'formatted';
  let isFullscreen = false;
  let searchQuery = '';
  let showDiff = false;
  let expandedPaths: Set<string> = new Set();
  let copySuccess = '';
  // Performance timing breakdown
  $: timing = response?.timing || null;
  $: hasError = response && (response.status >= 400 || response.error);
  $: isSuccess = response && response.status >= 200 && response.status < 300;

  onMount(() => {
    // Auto-expand first level of JSON
    if (response?.data) {
      expandedPaths.add('root');
    }
  });

  function toggleViewMode() {
    viewMode = viewMode === 'formatted' ? 'raw' : 'formatted';
  }

  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
  }

  function toggleDiff() {
    showDiff = !showDiff;
  }

  function getStatusClass() {
    if (!response) return 'text-brand-gray-500 font-medium';
    
    if (response.status >= 200 && response.status < 300) {
      return 'text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full text-sm';
    } else if (response.status >= 400) {
      return 'text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-sm';
    } else {
      return 'text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-full text-sm';
    }
  }

  async function copyToClipboard(text: string, type: string) {
    try {
      await navigator.clipboard.writeText(text);
      copySuccess = type;
      setTimeout(() => copySuccess = '', 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function copyResponse() {
    if (!response) return;
    const text = viewMode === 'formatted' 
      ? JSON.stringify(response.data, null, 2)
      : JSON.stringify(response.data);
    copyToClipboard(text, 'response');
  }

  function downloadResponse() {
    if (!response) return;
    const data = JSON.stringify(response.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-response-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function highlightSearchTerm(text: string): string {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }

  function togglePath(path: string) {
    if (expandedPaths.has(path)) {
      expandedPaths.delete(path);
    } else {
      expandedPaths.add(path);
    }
    expandedPaths = expandedPaths; // Trigger reactivity
  }
  function renderJsonNode(obj: any, path = 'root', depth = 0): string {
    if (obj === null) return '<span class="text-purple-600">null</span>';
    if (typeof obj === 'boolean') return `<span class="text-blue-600">${obj}</span>`;
    if (typeof obj === 'number') return `<span class="text-green-600">${obj}</span>`;
    if (typeof obj === 'string') return `<span class="text-orange-600">"${obj}"</span>`;

    const indent = '  '.repeat(depth);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '<span class="text-gray-500">[]</span>';
      
      let result = `<span class="text-gray-600">▼</span> <span class="text-gray-500">[${obj.length}]</span>\n`;
      
      obj.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        result += `${indent}  ${index}: ${renderJsonNode(item, itemPath, depth + 1)}`;
        if (index < obj.length - 1) result += ',';
        result += '\n';
      });
      result += `${indent}]`;
      return result;
    }

    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '<span class="text-gray-500">{}</span>';
      
      let result = `<span class="text-gray-600">▼</span> <span class="text-gray-500">{${keys.length}}</span>\n`;
      
      keys.forEach((key, index) => {
        const keyPath = `${path}.${key}`;
        result += `${indent}  <span class="text-blue-500">"${key}"</span>: ${renderJsonNode(obj[key], keyPath, depth + 1)}`;
        if (index < keys.length - 1) result += ',';
        result += '\n';
      });
      result += `${indent}}`;
      return result;
    }

    return String(obj);
  }

  $: formattedJson = response?.data ? renderJsonNode(response.data) : '';
  $: filteredJson = searchQuery ? highlightSearchTerm(formattedJson) : formattedJson;
</script>

<!-- Response Viewer Container -->
<div class="section-card card-hover bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 animate-slide-in" style="animation-delay: 0.2s">
  <!-- Header -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center space-x-3">
      <div class="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
        <Code class="w-6 h-6 text-white" />
      </div>
      <h2 class="text-2xl font-bold text-purple-600 dark:text-purple-300">API Response</h2>
    </div>
    
    <div class="flex items-center space-x-2">
      <!-- View Mode Toggle -->
      <Button
        variant="secondary"
        size="sm"
        on:click={toggleViewMode}
        title={`Switch to ${viewMode === 'formatted' ? 'raw' : 'formatted'} view`}
      >
        {#if viewMode === 'formatted'}
          <Eye class="w-4 h-4 mr-1" />
          Formatted
        {:else}
          <Code class="w-4 h-4 mr-1" />
          Raw
        {/if}
      </Button>

      <!-- Diff Toggle -->
      {#if previousResponse}
        <Button
          variant="secondary"
          size="sm"
          on:click={toggleDiff}
          title="Compare with previous response"
        >
          <Diff class="w-4 h-4 mr-1" />
          Diff
        </Button>
      {/if}

      <!-- Copy Response -->
      {#if response}
        <Button variant="secondary" size="sm" on:click={copyResponse}>
          {#if copySuccess === 'response'}
            <span class="text-green-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
              Copied!
            </span>
          {:else}
            <Copy class="w-4 h-4 mr-1" />
            Copy
          {/if}
        </Button>

        <!-- Download Response -->
        <Button variant="secondary" size="sm" on:click={downloadResponse}>
          <Download class="w-4 h-4 mr-1" />
          Download
        </Button>
      {/if}

      <!-- Fullscreen Toggle -->
      <Button
        variant="secondary"
        size="sm"
        on:click={toggleFullscreen}
        title="Toggle fullscreen"
      >
        {#if isFullscreen}
          <Minimize class="w-4 h-4" />
        {:else}
          <Maximize class="w-4 h-4" />
        {/if}
      </Button>
    </div>
  </div>

  <!-- Status and Timing -->
  {#if response}
    <div class="mb-4 p-4 bg-white rounded-xl border border-brand-gray-200 shadow-inner">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <span class="font-semibold text-brand-gray-700">Status:</span>
          <span class={getStatusClass()}>
            {response.status} {response.statusText}
          </span>
          {#if hasError}
            <div class="flex items-center text-red-600">
              <AlertTriangle class="w-4 h-4 mr-1" />
              <span class="text-sm font-medium">Error Response</span>
            </div>
          {/if}
        </div>
        
        <div class="flex items-center space-x-4 text-sm text-brand-gray-600">
          <div class="flex items-center">
            <Clock class="w-4 h-4 mr-1" />
            {#if timing}
              <span class="font-medium">{timing.total}ms</span>
            {:else}
              <span>Time: {response.timestamp.toLocaleTimeString()}</span>
            {/if}
          </div>
          {#if timing}
            <div class="flex space-x-2 text-xs">
              <span>DNS: {timing.dns}ms</span>
              <span>Connect: {timing.connect}ms</span>
              <span>TTFB: {timing.ttfb}ms</span>
              <span>Download: {timing.download}ms</span>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Error Details -->
    {#if response.error}
      <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div class="flex items-center space-x-2 mb-2">
          <AlertTriangle class="w-5 h-5 text-red-600" />
          <h3 class="font-semibold text-red-800">Network Error</h3>
        </div>
        <p class="text-red-700 text-sm mb-2">{response.error}</p>
        {#if response.error.includes('CORS')}
          <div class="text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>CORS Issue:</strong> The server doesn't allow requests from this origin. 
            This is common in development. Try using a browser extension to disable CORS or configure the server properly.
          </div>
        {/if}
      </div>
    {/if}

    <!-- Search Bar -->
    <div class="mb-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
        <input
          type="text"
          placeholder="Search in response..."
          bind:value={searchQuery}
          class="w-full pl-10 pr-4 py-2 border-2 border-brand-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-300"
        />
      </div>
    </div>
  {:else}
    <div class="mb-4 p-4 bg-white rounded-xl border border-brand-gray-200 shadow-inner">
      <div class="flex items-center space-x-4">
        <span class="font-semibold text-brand-gray-700">Status:</span>
        <span class="text-brand-gray-500">Awaiting request...</span>
      </div>
    </div>
  {/if}

  <!-- Response Content -->
  <div class="bg-white rounded-xl border-2 border-brand-gray-200 overflow-hidden">
    {#if response}
      {#if showDiff && previousResponse}
        <!-- Diff View -->
        <div class="p-4 bg-amber-50 border-b border-amber-200">
          <h3 class="font-semibold text-amber-800 mb-2">Response Comparison</h3>
          <p class="text-sm text-amber-700">Showing differences between current and previous response</p>
        </div>
        <!-- TODO: Implement actual diff logic -->
        <div class="p-4 font-mono text-sm">
          <div class="text-green-600">+ Current Response</div>
          <div class="text-red-600">- Previous Response</div>
        </div>
      {:else}        <!-- Normal View -->
        <div class="response-area min-h-[500px] max-h-[700px] overflow-auto">
          {#if viewMode === 'formatted' && response.data}
            <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4">{@html filteredJson}</pre>
          {:else}
            <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed p-4 text-green-400 bg-gray-900">{response.data ? JSON.stringify(response.data, null, 2) : 'No response data'}</pre>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="p-8 text-center text-brand-gray-500">
        <Code class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p class="text-lg font-medium">No response yet</p>
        <p class="text-sm">Send a request to see the response here</p>
      </div>
    {/if}
  </div>
</div>

<!-- Fullscreen Modal -->
{#if isFullscreen && response}
  <Modal bind:isOpen={isFullscreen} size="xl" title="Response Viewer - Fullscreen">
    <div class="max-h-[80vh] overflow-auto">
      <div class="mb-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-brand-gray-400" />
          <input
            type="text"
            placeholder="Search in response..."
            bind:value={searchQuery}
            class="w-full pl-10 pr-4 py-2 border-2 border-brand-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-300"
          />
        </div>
      </div>
      
      <div class="bg-gray-900 rounded-xl overflow-hidden">
        <div class="response-area">
          {#if viewMode === 'formatted' && response.data}
            <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed p-6 text-green-400">{@html filteredJson}</pre>
          {:else}
            <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed p-6 text-green-400">{response.data ? JSON.stringify(response.data, null, 2) : 'No response data'}</pre>
          {/if}
        </div>
      </div>
    </div>
  </Modal>
{/if}

<style>
  :global(mark) {
    background-color: #fef08a;
    padding: 2px 4px;
    border-radius: 4px;
  }
</style>
