<script lang="ts">
  import { onMount } from 'svelte';
  import InputField from './InputField.svelte';
  import SelectField from './SelectField.svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';
  import { Plus, Edit, Trash2, Key, Copy, Check } from 'lucide-svelte';
  import { getStorageData, saveTokenConfig, deleteTokenConfig } from '$lib/storage';
  import type { TokenConfig } from '$lib/types';

  let tokenConfigs: TokenConfig[] = [];
  let showCreateModal = false;
  let showEditModal = false;
  let showDeleteModal = false;
  let editingToken: TokenConfig | null = null;
  let deleteTokenName = '';
  let copiedItems: Set<string> = new Set();

  // Form data
  let formData: TokenConfig = {
    name: '',
    apiKey: '',
    sdkId: '',
    description: '',
    environment: 'staging'
  };

  const environmentOptions = [
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' }
  ];

  onMount(() => {
    loadTokenConfigs();
  });

  function loadTokenConfigs() {
    const data = getStorageData();
    tokenConfigs = data.tokenConfigs;
  }

  function resetForm() {
    formData = {
      name: '',
      apiKey: '',
      sdkId: '',
      description: '',
      environment: 'staging'
    };
    editingToken = null;
  }

  function openCreateModal() {
    resetForm();
    showCreateModal = true;
  }

  function openEditModal(token: TokenConfig) {
    formData = { ...token };
    editingToken = token;
    showEditModal = true;
  }

  function openDeleteModal(tokenName: string) {
    deleteTokenName = tokenName;
    showDeleteModal = true;
  }

  function closeModals() {
    showCreateModal = false;
    showEditModal = false;
    showDeleteModal = false;
    resetForm();
  }

  function handleSave() {
    if (!formData.name.trim() || !formData.apiKey.trim() || !formData.sdkId.trim()) {
      return; // Basic validation
    }

    saveTokenConfig(formData);
    loadTokenConfigs();
    closeModals();
  }

  function handleDelete() {
    deleteTokenConfig(deleteTokenName);
    loadTokenConfigs();
    closeModals();
  }

  async function copyToClipboard(text: string, itemId: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedItems.add(itemId);
      setTimeout(() => {
        copiedItems.delete(itemId);
        copiedItems = copiedItems; // Trigger reactivity
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  function getEnvironmentBadgeClass(environment: string) {
    return environment === 'production' 
      ? 'bg-red-100 text-red-800 border-red-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';
  }
</script>

<div class="space-y-8 animate-fade-in">
  <!-- Header -->
  <div class="section-card card-hover bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-100">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center space-x-4">
        <div class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
          <Key class="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Token Manager</h1>
          <p class="text-brand-gray-600 mt-1 font-medium">Securely manage API keys and SDK configurations</p>
        </div>
      </div>
      
      <Button variant="primary" size="lg" on:click={openCreateModal}>
        <Plus class="w-5 h-5 mr-2" />
        Add Token Config
      </Button>
    </div>
  </div>

  <!-- Token Configurations -->
  <div class="section-card card-hover animate-slide-in">
    {#if tokenConfigs.length === 0}
      <div class="text-center py-12">
        <div class="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full w-fit mx-auto mb-4">
          <Key class="w-12 h-12 text-emerald-600" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Token Configurations</h3>
        <p class="text-gray-600 mb-4">Add your API keys and SDK configurations to get started.</p>
        <Button variant="primary" on:click={openCreateModal}>
          <Plus class="w-4 h-4 mr-2" />
          Add Your First Config
        </Button>
      </div>
    {:else}
      <div class="space-y-4">
        {#each tokenConfigs as token (token.name)}
          <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <!-- Header -->
                <div class="flex items-center gap-2 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">{token.name}</h3>
                  <span class="inline-flex items-center px-2 py-1 rounded border text-xs font-medium {getEnvironmentBadgeClass(token.environment)}">
                    {token.environment}
                  </span>
                </div>
                
                <!-- Description -->
                {#if token.description}
                  <p class="text-sm text-gray-600 mb-3">{token.description}</p>
                {/if}
                  <!-- API Key -->
                <div class="mb-2">
                  <div class="text-xs font-medium text-gray-700 block mb-1">API Key</div>
                  <div class="flex items-center gap-2">
                    <code class="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {token.apiKey.substring(0, 8)}...{token.apiKey.substring(token.apiKey.length - 4)}
                    </code>
                    <button
                      on:click={() => copyToClipboard(token.apiKey, `${token.name}-apikey`)}
                      class="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy API Key"
                    >
                      {#if copiedItems.has(`${token.name}-apikey`)}
                        <Check class="w-4 h-4 text-green-500" />
                      {:else}
                        <Copy class="w-4 h-4" />
                      {/if}
                    </button>
                  </div>
                </div>
                  <!-- SDK ID -->
                <div>
                  <div class="text-xs font-medium text-gray-700 block mb-1">SDK ID</div>
                  <div class="flex items-center gap-2">
                    <code class="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {token.sdkId}
                    </code>
                    <button
                      on:click={() => copyToClipboard(token.sdkId, `${token.name}-sdkid`)}
                      class="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy SDK ID"
                    >
                      {#if copiedItems.has(`${token.name}-sdkid`)}
                        <Check class="w-4 h-4 text-green-500" />
                      {:else}
                        <Copy class="w-4 h-4" />
                      {/if}
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="flex items-center gap-2 ml-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  on:click={() => openEditModal(token)}
                >
                  <Edit class="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  on:click={() => openDeleteModal(token.name)}
                >
                  <Trash2 class="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<!-- Create Modal -->
<Modal bind:isOpen={showCreateModal} title="Add Token Configuration" size="md">
  <form on:submit|preventDefault={handleSave} class="space-y-4">
    <InputField
      id="create-name"
      label="Configuration Name"
      bind:value={formData.name}
      placeholder="e.g., Development API Keys"
      required
      tooltip="A descriptive name for this token configuration"
    />
    
    <InputField
      id="create-description"
      label="Description (Optional)"
      bind:value={formData.description}
      placeholder="Brief description of when to use this configuration"
      tooltip="Optional description to help identify when to use this configuration"
    />
    
    <SelectField
      id="create-environment"
      label="Environment"
      bind:value={formData.environment}
      options={environmentOptions}
      tooltip="Target environment for this configuration"
    />
    
    <InputField
      id="create-api-key"
      label="API Key"
      bind:value={formData.apiKey}
      type="password"
      placeholder="Enter API Key"
      required
      tooltip="The API key for authentication"
    />
    
    <InputField
      id="create-sdk-id"
      label="SDK ID"
      bind:value={formData.sdkId}
      placeholder="Enter SDK ID"
      required
      tooltip="The SDK identifier"
    />
    
    <div class="flex gap-3 pt-4">
      <Button variant="secondary" fullWidth on:click={closeModals}>
        Cancel
      </Button>
      <Button variant="primary" fullWidth type="submit">
        Save Configuration
      </Button>
    </div>
  </form>
</Modal>

<!-- Edit Modal -->
<Modal bind:isOpen={showEditModal} title="Edit Token Configuration" size="md">
  <form on:submit|preventDefault={handleSave} class="space-y-4">
    <InputField
      id="edit-name"
      label="Configuration Name"
      bind:value={formData.name}
      placeholder="e.g., Development API Keys"
      required
      tooltip="A descriptive name for this token configuration"
    />
    
    <InputField
      id="edit-description"
      label="Description (Optional)"
      bind:value={formData.description}
      placeholder="Brief description of when to use this configuration"
      tooltip="Optional description to help identify when to use this configuration"
    />
    
    <SelectField
      id="edit-environment"
      label="Environment"
      bind:value={formData.environment}
      options={environmentOptions}
      tooltip="Target environment for this configuration"
    />
    
    <InputField
      id="edit-api-key"
      label="API Key"
      bind:value={formData.apiKey}
      type="password"
      placeholder="Enter API Key"
      required
      tooltip="The API key for authentication"
    />
    
    <InputField
      id="edit-sdk-id"
      label="SDK ID"
      bind:value={formData.sdkId}
      placeholder="Enter SDK ID"
      required
      tooltip="The SDK identifier"
    />
    
    <div class="flex gap-3 pt-4">
      <Button variant="secondary" fullWidth on:click={closeModals}>
        Cancel
      </Button>
      <Button variant="primary" fullWidth type="submit">
        Update Configuration
      </Button>
    </div>
  </form>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:isOpen={showDeleteModal} title="Delete Token Configuration" size="sm">
  <div class="text-center">
    <Trash2 class="w-12 h-12 text-red-500 mx-auto mb-4" />
    <p class="text-gray-700 mb-6">
      Are you sure you want to delete the token configuration "{deleteTokenName}"? This action cannot be undone.
    </p>
    <div class="flex gap-3">
      <Button variant="secondary" fullWidth on:click={closeModals}>
        Cancel
      </Button>
      <Button variant="danger" fullWidth on:click={handleDelete}>
        Delete
      </Button>
    </div>
  </div>
</Modal>
