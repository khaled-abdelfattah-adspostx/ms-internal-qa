<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import { Trash2, Clock, ExternalLink, RefreshCw, Search } from 'lucide-svelte';
  import { getStorageData, clearHistory } from '$lib/storage';
  import type { RequestHistoryItem } from '$lib/types';

  let historyItems: RequestHistoryItem[] = [];
  let filteredItems: RequestHistoryItem[] = [];
  let searchQuery = '';
  let selectedItem: RequestHistoryItem | null = null;
  let showDetailsModal = false;
  let showClearConfirmModal = false;

  onMount(() => {
    loadHistory();
  });

  function loadHistory() {
    const data = getStorageData();
    historyItems = data.requestHistory;
    filterItems();
  }

  function filterItems() {
    if (!searchQuery.trim()) {
      filteredItems = historyItems;
      return;
    }

    const query = searchQuery.toLowerCase();
    filteredItems = historyItems.filter(item => 
      item.request.path.toLowerCase().includes(query) ||
      item.url.toLowerCase().includes(query) ||
      item.response.status.toString().includes(query) ||
      item.config.environment.toLowerCase().includes(query)
    );
  }

  function handleSearch() {
    filterItems();
  }

  function showItemDetails(item: RequestHistoryItem) {
    selectedItem = item;
    showDetailsModal = true;
  }

  function handleClearHistory() {
    clearHistory();
    loadHistory();
    showClearConfirmModal = false;
  }

  function refreshHistory() {
    loadHistory();
  }

  function formatTimestamp(timestamp: Date | string) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function getStatusClass(status: number) {
    if (status >= 200 && status < 300) {
      return 'text-green-600 bg-green-100 border-green-200';
    } else if (status >= 400) {
      return 'text-red-600 bg-red-100 border-red-200';
    } else if (status >= 300) {
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    } else {
      return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  }

  function getMethodClass(method: string) {
    switch (method) {
      case 'GET':
        return 'text-blue-600 bg-blue-100';
      case 'POST':
        return 'text-green-600 bg-green-100';
      case 'PUT':
        return 'text-yellow-600 bg-yellow-100';
      case 'PATCH':
        return 'text-orange-600 bg-orange-100';
      case 'DELETE':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
    });
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- Header -->
  <div class="section-card card-hover bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-100">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center space-x-4">
        <div class="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
          <Clock class="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-indigo-600 dark:text-indigo-300">Request History</h1>
          <p class="text-brand-gray-600 mt-1 font-medium">Track and manage your API testing history</p>
        </div>
      </div>
      
      <div class="flex items-center gap-3">
        <Button variant="secondary" size="md" on:click={refreshHistory}>
          <RefreshCw class="w-5 h-5 mr-2" />
          Refresh
        </Button>
        <Button variant="danger" size="md" on:click={() => showClearConfirmModal = true}>
          <Trash2 class="w-5 h-5 mr-2" />
          Clear All
        </Button>
      </div>
    </div>
  </div>

  <!-- Search -->
  <div class="section-card">
    <div class="flex items-center gap-2">
      <Search class="w-5 h-5 text-gray-400" />
      <input
        type="text"
        bind:value={searchQuery}
        on:input={handleSearch}
        placeholder="Search by path, URL, status, or environment..."
        class="flex-1 input-field mt-0"
      />
    </div>
  </div>

  <!-- History Items -->
  <div class="section-card">
    {#if filteredItems.length === 0}
      <div class="text-center py-12">
        {#if historyItems.length === 0}
          <Clock class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
          <p class="text-gray-600">Your API request history will appear here after you send requests.</p>
        {:else}
          <Search class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
          <p class="text-gray-600">Try adjusting your search query.</p>
        {/if}
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredItems as item (item.id)}
          <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <!-- Request details -->
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {getMethodClass(item.request.method)}">
                    {item.request.method}
                  </span>
                  <span class="inline-flex items-center px-2 py-1 rounded border text-xs font-medium {getStatusClass(item.response.status)}">
                    {item.response.status}
                  </span>
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-100">
                    {item.config.environment}
                  </span>
                </div>
                
                <!-- URL -->
                <p class="text-sm font-medium text-gray-900 mb-1 truncate">
                  {item.request.path}
                </p>
                
                <!-- Full URL (truncated) -->
                <p class="text-xs text-gray-500 mb-2 truncate">
                  {item.url}
                </p>
                
                <!-- Timestamp -->
                <p class="text-xs text-gray-400">
                  <Clock class="w-3 h-3 inline mr-1" />
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center gap-2 ml-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  on:click={() => showItemDetails(item)}
                >
                  <ExternalLink class="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </div>
          </div>
        {/each}
      </div>
      
      <!-- Pagination info -->
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-500">
          Showing {filteredItems.length} of {historyItems.length} requests
          {#if historyItems.length >= 100}
            (limited to latest 100)
          {/if}
        </p>
      </div>
    {/if}
  </div>
</div>

<!-- Details Modal -->
<Modal bind:isOpen={showDetailsModal} title="Request Details" size="lg">
  {#if selectedItem}
    <div class="space-y-6">
      <!-- Request Info -->
      <div>
        <h4 class="font-semibold text-gray-900 mb-3">Request Information</h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-700">Method:</span>
              <span class="ml-2">{selectedItem.request.method}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Status:</span>
              <span class="ml-2">{selectedItem.response.status} {selectedItem.response.statusText}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Environment:</span>
              <span class="ml-2">{selectedItem.config.environment}</span>
            </div>
            <div>
              <span class="font-medium text-gray-700">Timestamp:</span>
              <span class="ml-2">{formatTimestamp(selectedItem.timestamp)}</span>
            </div>
          </div>
          
          <div class="mt-4">
            <span class="font-medium text-gray-700">Full URL:</span>
            <div class="mt-1 p-2 bg-white rounded border">
              <code class="text-xs break-all">{selectedItem.url}</code>
              <Button 
                variant="secondary" 
                size="sm" 
                on:click={() => copyToClipboard(selectedItem.url)}
                class="ml-2"
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Body -->
      {#if selectedItem.request.body}
        <div>
          <h4 class="font-semibold text-gray-900 mb-3">Request Body</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <pre class="text-xs bg-white rounded border p-3 overflow-auto max-h-40">{selectedItem.request.body}</pre>
            <Button 
              variant="secondary" 
              size="sm" 
              on:click={() => copyToClipboard(selectedItem.request.body)}
              class="mt-2"
            >
              Copy Body
            </Button>
          </div>
        </div>
      {/if}

      <!-- Response -->
      <div>
        <h4 class="font-semibold text-gray-900 mb-3">Response</h4>
        <div class="bg-gray-50 rounded-lg p-4">
          <pre class="text-xs bg-white rounded border p-3 overflow-auto max-h-60">
{typeof selectedItem.response.data === 'string' ? selectedItem.response.data : JSON.stringify(selectedItem.response.data, null, 2)}
          </pre>
          <Button 
            variant="secondary" 
            size="sm" 
            on:click={() => copyToClipboard(typeof selectedItem.response.data === 'string' ? selectedItem.response.data : JSON.stringify(selectedItem.response.data, null, 2))}
            class="mt-2"
          >
            Copy Response
          </Button>
        </div>
      </div>
    </div>
  {/if}
</Modal>

<!-- Clear Confirmation Modal -->
<Modal bind:isOpen={showClearConfirmModal} title="Clear All History" size="sm">
  <div class="text-center">
    <Trash2 class="w-12 h-12 text-red-500 mx-auto mb-4" />
    <p class="text-gray-700 mb-6">
      Are you sure you want to clear all request history? This action cannot be undone.
    </p>
    <div class="flex gap-3">
      <Button 
        variant="secondary" 
        fullWidth 
        on:click={() => showClearConfirmModal = false}
      >
        Cancel
      </Button>
      <Button 
        variant="danger" 
        fullWidth 
        on:click={handleClearHistory}
      >
        Clear All
      </Button>
    </div>
  </div>
</Modal>
