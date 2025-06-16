<script lang="ts">
  import { onMount } from 'svelte';  import InputField from './InputField.svelte';
  import SelectField from './SelectField.svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import ResponseViewer from './ResponseViewer.svelte';
  import VisualJsonBuilder from './VisualJsonBuilder.svelte';
  import QaWorkflowHelpers from './QaWorkflowHelpers.svelte';
  import { Send, Copy, Star, StarOff } from 'lucide-svelte';
  import { API_PRESETS, getPresetByName, replacePlaceholders, buildFullUrl, validateJson, updateJsonBodyWithPubUserId } from '$lib/api-utils';
  import { addToHistory, toggleFavorite, isFavorite } from '$lib/storage';
  import type { ApiConfig, ApiRequest, ApiResponse } from '$lib/types';

  // Configuration state
  let config: ApiConfig = {
    globalPubUserId: '',
    environment: 'staging',
    stagingUrl: 'https://api-staging.adspostx.com',
    productionUrl: 'https://api.adspostx.com',
    sdkId: '8c7efcd41c82b20e',
    apiKey: '124a5528-6db7-4373-b278-7605c2719d0f'
  };

  // Request state
  let request: ApiRequest = {
    method: 'POST',
    path: '',
    body: '',
    sessionId: '',
    campaignId: ''
  };
  // UI state
  let selectedPreset = 'Moments API';
  let isCustomEndpoint = false;
  let customEndpointPath = '';
  let jsonError = '';
  let isLoading = false;
  let showSuccessModal = false;
  let successMessage = '';
  let response: ApiResponse | null = null;
  let previousResponse: ApiResponse | null = null;

  // Derived state
  $: selectedPresetData = getPresetByName(selectedPreset);
  $: isCustomEndpoint = selectedPreset === 'custom';
  $: currentBaseUrl = config.environment === 'staging' ? config.stagingUrl : config.productionUrl;
  $: showSessionIdField = request.path.includes('<<sessionId>>');
  $: showCampaignIdField = request.path.includes('<<campaignId>>');
  $: showJsonBody = ['POST', 'PUT', 'PATCH'].includes(request.method);
  $: showPubUserIdParam = selectedPresetData?.requiresPubUserId && config.globalPubUserId;
  $: isPresetFavorite = selectedPreset ? isFavorite(selectedPreset) : false;

  // Environment options
  const environmentOptions = [
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
  ];

  // Method options
  const methodOptions = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' }
  ];  // Preset options
  const presetOptions = [
    ...API_PRESETS.map(preset => ({ 
      value: preset.name, 
      label: preset.name + (isFavorite(preset.name) ? ' ⭐' : '') 
    })),
    { value: 'custom', label: '🔧 Custom Endpoint' }
  ];

  onMount(() => {
    // Load saved configuration if available
    loadSavedConfig();
  });

  function loadSavedConfig() {
    // Implementation would load from localStorage via storage utility
    // For now, we'll use the default values
  }
  function handlePresetChange() {
    if (selectedPreset === 'custom') {
      // Switch to custom endpoint mode
      request.path = customEndpointPath || '/custom/endpoint';
      request.method = 'GET';
      request.body = '';
    } else {
      const preset = getPresetByName(selectedPreset);
      if (!preset) return;

      request.path = preset.path;
      request.method = preset.method;
      
      // Update JSON body if preset has default body
      if (preset.defaultBody && showJsonBody) {
        request.body = updateJsonBodyWithPubUserId(preset.defaultBody, config.globalPubUserId);
      } else if (showJsonBody) {
        request.body = '';
      }
    }

    // Clear validation error
    jsonError = '';
  }

  function handleCustomEndpointChange() {
    if (isCustomEndpoint) {
      request.path = customEndpointPath;
    }
  }

  function handleGlobalPubUserIdChange() {
    // Update JSON body if it contains pub_user_id
    if (request.body && showJsonBody) {
      request.body = updateJsonBodyWithPubUserId(request.body, config.globalPubUserId);
    }
  }
  function handleJsonBodyChange() {
    const validation = validateJson(request.body || '');
    jsonError = validation.isValid ? '' : validation.error || 'Invalid JSON';
  }

  function handleToggleFavorite() {
    if (selectedPreset) {
      toggleFavorite(selectedPreset);
      // Force reactivity update
      presetOptions.forEach(option => {
        if (option.value === selectedPreset) {
          option.label = selectedPreset + (isFavorite(selectedPreset) ? ' ⭐' : '');
        }
      });
    }
  }
  async function sendRequest() {
    // Validate required fields
    if (!currentBaseUrl) {
      showMessage('Error: Base URL is required');
      return;
    }

    if (!request.path) {
      showMessage('Error: API path is required');
      return;
    }

    // Validate session ID if required
    if (showSessionIdField && !request.sessionId) {
      showMessage('Error: Session ID is required for this endpoint');
      return;
    }

    // Validate campaign ID if required
    if (showCampaignIdField && !request.campaignId) {
      showMessage('Error: Campaign ID is required for this endpoint');
      return;
    }

    // Store current response as previous
    if (response) {
      previousResponse = { ...response };
    }

    // Validate JSON if showing body
    if (showJsonBody && request.body) {
      const validation = validateJson(request.body);
      if (!validation.isValid) {
        showMessage('Error: Invalid JSON in request body');
        return;
      }
    }    isLoading = true;
    response = null;

    const startTime = performance.now();
    let timingData = {
      dns: 0,
      connect: 0,
      ttfb: 0,
      download: 0,
      total: 0
    };

    try {
      // Build the URL
      let processedPath = replacePlaceholders(request.path, request.sessionId, request.campaignId);
      let fullUrl = buildFullUrl(currentBaseUrl, processedPath);

      // Add pub_user_id parameter if required
      if (selectedPresetData?.requiresPubUserId && config.globalPubUserId) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl += `${separator}pub_user_id=${encodeURIComponent(config.globalPubUserId)}`;
      }

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (config.sdkId) {
        headers['X-SDK-ID'] = config.sdkId;
      }

      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method: request.method,
        headers
      };

      // Add body for POST/PUT/PATCH requests
      if (showJsonBody) {
        fetchOptions.body = request.body || '{}';
      }      // Make the request with timing
      const preRequestTime = performance.now();
      const fetchResponse = await fetch(fullUrl, fetchOptions);
      
      const responseStartTime = performance.now();
      timingData.ttfb = Math.round(responseStartTime - preRequestTime);

      // Parse response
      let responseData: unknown;
      try {
        responseData = await fetchResponse.json();
      } catch {
        responseData = await fetchResponse.text();
      }

      const endTime = performance.now();
      timingData.download = Math.round(endTime - responseStartTime);
      timingData.total = Math.round(endTime - startTime);

      // Create response object
      response = {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
        data: responseData,
        timestamp: new Date(),
        timing: timingData,
        headers: Object.fromEntries(fetchResponse.headers.entries())
      };

      // Save to history
      addToHistory({
        config: { ...config },
        request: { ...request },
        response,
        url: fullUrl
      });    } catch (error) {
      console.error('Request failed:', error);
      const endTime = performance.now();
      timingData.total = Math.round(endTime - startTime);
      
      response = {
        status: 0,
        statusText: 'Network Error',
        data: `Failed to send request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: timingData
      };
    } finally {
      isLoading = false;
    }  }

  function copyResponseToClipboard() {
    if (!response) return;
    
    const responseText = typeof response.data === 'string' 
      ? response.data 
      : JSON.stringify(response.data, null, 2);
    
    navigator.clipboard.writeText(responseText).then(() => {
      showMessage('Response copied to clipboard!');
    }).catch(() => {
      showMessage('Failed to copy response');
    });
  }

  function showMessage(message: string) {
    successMessage = message;
    showSuccessModal = true;
  }

  function getResponseClass() {
    if (!response) return 'response-area bg-gray-800 text-gray-400';
    
    if (response.status >= 200 && response.status < 300) {
      return 'response-area bg-gray-800 text-green-400';
    } else if (response.status >= 400) {
      return 'response-area bg-gray-800 text-red-400';
    } else {
      return 'response-area bg-gray-800 text-yellow-400';
    }
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

  function buildCurrentFullUrl(): string {
    if (!currentBaseUrl || !request.path) return '';
    
    let processedPath = replacePlaceholders(request.path, request.sessionId, request.campaignId);
    let fullUrl = buildFullUrl(currentBaseUrl, processedPath);

    // Add pub_user_id parameter if required
    if (selectedPresetData?.requiresPubUserId && config.globalPubUserId) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl += `${separator}pub_user_id=${encodeURIComponent(config.globalPubUserId)}`;
    }

    return fullUrl;
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- Header -->
  <div class="flex items-center justify-between section-card card-hover bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-100">
    <div class="flex items-center space-x-4">
      <div class="p-3 ms-brand-gradient rounded-xl shadow-lg">        <Send class="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 class="text-3xl font-bold ms-text-gradient">API Request Builder</h1>
        <p class="text-brand-gray-600 mt-1 font-medium">Configure and test MomentScience API endpoints with precision</p>
      </div>
    </div>
  </div>
  <!-- Configuration Section -->
  <div class="section-card card-hover bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 animate-slide-in">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-blue-600 dark:text-blue-300">Configuration</h2>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        id="global-pub-user-id"
        label="Global pub_user_id"
        bind:value={config.globalPubUserId}
        placeholder="Enter global pub_user_id"
        tooltip="Global user ID that will be used in URL params and request body for applicable endpoints"
        on:input={handleGlobalPubUserIdChange}
      />
      
      <SelectField
        id="environment"
        label="Environment"
        bind:value={config.environment}
        options={environmentOptions}
        tooltip="Select the target environment for API requests"
      />
      
      {#if config.environment === 'staging'}
        <InputField
          id="staging-url"
          label="Staging API URL"
          bind:value={config.stagingUrl}
          type="url"
          placeholder="https://api-staging.adspostx.com"
          tooltip="Base URL for staging environment API requests"
        />
      {:else}
        <InputField
          id="production-url"
          label="Production API URL"
          bind:value={config.productionUrl}
          type="url"
          placeholder="https://api.adspostx.com"
          tooltip="Base URL for production environment API requests"
        />
      {/if}
      
      <InputField
        id="sdk-id"
        label="SDK ID"
        bind:value={config.sdkId}
        placeholder="Enter SDK ID"
        tooltip="SDK identifier sent in X-SDK-ID header"
      />
      
      <InputField
        id="api-key"
        label="API Key"
        bind:value={config.apiKey}
        type="password"
        placeholder="Enter API Key"
        tooltip="API key sent in Authorization header as Bearer token"
      />
    </div>
  </div>
  <!-- Request Section -->
  <div class="section-card card-hover bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 animate-slide-in" style="animation-delay: 0.1s">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
          <Send class="w-6 h-6 text-white" />
        </div>
        <h2 class="text-2xl font-bold text-green-600 dark:text-green-300">Request Details</h2>
      </div>
    </div>
    
    <div class="space-y-4">      <!-- API Endpoint Selection -->
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <SelectField
            id="api-preset"
            label="API Endpoint"
            bind:value={selectedPreset}
            options={presetOptions}
            tooltip="Select a predefined API endpoint configuration"
            on:change={handlePresetChange}
          />
        </div>
        {#if selectedPreset && !isCustomEndpoint}
          <Button
            variant="secondary"
            size="sm"
            on:click={handleToggleFavorite}
            title={isPresetFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {#if isPresetFavorite}
              <StarOff class="w-4 h-4" />
            {:else}
              <Star class="w-4 h-4" />
            {/if}
          </Button>        {/if}
      </div>

      <!-- Custom Endpoint Input -->
      {#if isCustomEndpoint}
        <div class="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium text-amber-700 dark:text-amber-300">Custom Endpoint Mode</span>
          </div>
          <InputField
            id="custom-endpoint"
            label="Custom API Endpoint Path"
            bind:value={customEndpointPath}
            placeholder="/your/custom/endpoint"
            tooltip="Enter your custom API endpoint path (e.g., /api/v1/custom)"
            on:input={handleCustomEndpointChange}
          />
        </div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          id="api-path"
          label="API Endpoint Path"
          bind:value={request.path}
          placeholder="/v1/users"
          tooltip="API endpoint path (relative to base URL)"
        />
        
        <SelectField
          id="request-method"
          label="Request Method"
          bind:value={request.method}
          options={methodOptions}
          tooltip="HTTP method for the request"
        />
      </div>

      <!-- Conditional Parameter Fields -->
      {#if showSessionIdField}
        <InputField
          id="session-id"
          label="Session ID"
          bind:value={request.sessionId}
          placeholder="Enter Session ID"
          tooltip="Session ID that replaces <<sessionId>> in the path"
          required
        />
      {/if}

      {#if showCampaignIdField}
        <InputField
          id="campaign-id"
          label="Campaign ID"
          bind:value={request.campaignId}
          placeholder="Enter Campaign ID"
          tooltip="Campaign ID that replaces <<campaignId>> in the path"
          required
        />
      {/if}

      <!-- pub_user_id Parameter Display -->
      {#if showPubUserIdParam}
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-700 font-medium mb-1">
            URL Parameter (auto-appended):
          </p>
          <p class="text-sm text-gray-700">
            <code class="bg-gray-200 px-1 rounded">pub_user_id</code> = 
            <span class="font-mono bg-gray-200 px-1 rounded">{config.globalPubUserId}</span>
          </p>
        </div>
      {/if}      <!-- JSON Body -->
      {#if showJsonBody}
        <VisualJsonBuilder
          bind:jsonValue={request.body}
          disabled={isLoading}
          on:update={(e) => {
            request.body = e.detail;
            handleJsonBodyChange();
          }}
        />
      {/if}

      <!-- Send Button -->      <div class="flex justify-center pt-6">
        <Button
          variant="primary"
          size="lg"
          loading={isLoading}
          disabled={isLoading || !!jsonError}
          on:click={sendRequest}
        >
          <Send class="w-5 h-5 mr-2" />
          {isLoading ? 'Sending Request...' : 'Send Request'}
        </Button>
      </div>    </div>
  </div>

  <!-- Enhanced Response Viewer -->
  <ResponseViewer bind:response bind:previousResponse />
  <!-- QA Workflow Helpers -->
  <QaWorkflowHelpers 
    {config} 
    {request} 
    {response} 
    fullUrl={buildCurrentFullUrl()} 
  />
</div>

<!-- Success Modal -->
<Modal bind:isOpen={showSuccessModal} title="Success" size="sm">
  <p class="text-gray-700 mb-4">{successMessage}</p>
  <Button variant="primary" fullWidth on:click={() => showSuccessModal = false}>
    OK
  </Button>
</Modal>
