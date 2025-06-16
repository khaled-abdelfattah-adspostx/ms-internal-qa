<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import InputField from './InputField.svelte';
  import SelectField from './SelectField.svelte';
  import { Plus, Trash2, Code, Eye, Copy } from 'lucide-svelte';

  export let jsonValue: string = '';
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{
    update: string;
  }>();

  interface JsonField {
    id: string;
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  }

  let fields: JsonField[] = [];
  let viewMode: 'visual' | 'raw' = 'visual';
  let nextId = 1;

  const typeOptions = [
    { value: 'string', label: 'String' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'null', label: 'Null' },
    { value: 'object', label: 'Object' },
    { value: 'array', label: 'Array' }
  ];

  // Initialize fields from JSON value
  $: if (jsonValue && viewMode === 'visual') {
    try {
      const parsed = JSON.parse(jsonValue);
      initializeFromJson(parsed);
    } catch (e) {
      // Invalid JSON, keep current fields
    }
  }

  function initializeFromJson(obj: any, prefix = '') {
    fields = [];
    nextId = 1;
    parseObjectToFields(obj, prefix);
  }

  function parseObjectToFields(obj: any, prefix = '') {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        addFieldFromValue(fullKey, value);
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const fullKey = prefix ? `${prefix}[${index}]` : `[${index}]`;
        addFieldFromValue(fullKey, item);
      });
    }
  }

  function addFieldFromValue(key: string, value: any) {
    let type: JsonField['type'] = 'string';
    let strValue = '';

    if (value === null) {
      type = 'null';
      strValue = '';
    } else if (typeof value === 'boolean') {
      type = 'boolean';
      strValue = value.toString();
    } else if (typeof value === 'number') {
      type = 'number';
      strValue = value.toString();
    } else if (Array.isArray(value)) {
      type = 'array';
      strValue = JSON.stringify(value);
    } else if (typeof value === 'object') {
      type = 'object';
      strValue = JSON.stringify(value);
    } else {
      type = 'string';
      strValue = String(value);
    }

    fields.push({
      id: (nextId++).toString(),
      key,
      value: strValue,
      type
    });
  }

  function addField() {
    fields.push({
      id: (nextId++).toString(),
      key: '',
      value: '',
      type: 'string'
    });
    fields = fields; // Trigger reactivity
  }

  function removeField(id: string) {
    fields = fields.filter(f => f.id !== id);
    updateJson();
  }

  function updateJson() {
    try {
      const obj: any = {};
      
      for (const field of fields) {
        if (!field.key.trim()) continue;
        
        let value: any = field.value;
        
        switch (field.type) {
          case 'number':
            value = parseFloat(field.value) || 0;
            break;
          case 'boolean':
            value = field.value.toLowerCase() === 'true';
            break;
          case 'null':
            value = null;
            break;
          case 'object':
          case 'array':
            try {
              value = JSON.parse(field.value);
            } catch (e) {
              value = field.value; // Keep as string if invalid JSON
            }
            break;
          default:
            value = field.value;
        }
        
        // Handle nested keys (e.g., "user.name")
        const keys = field.key.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];
          if (!(key in current)) {
            current[key] = {};
          }
          current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
      }
      
      const jsonString = JSON.stringify(obj, null, 2);
      jsonValue = jsonString;
      dispatch('update', jsonString);
    } catch (e) {
      // Handle error gracefully
      console.warn('Failed to build JSON:', e);
    }
  }

  function toggleViewMode() {
    if (viewMode === 'visual') {
      updateJson();
    } else {
      // Switching to visual mode - parse current JSON
      try {
        const parsed = JSON.parse(jsonValue);
        initializeFromJson(parsed);
      } catch (e) {
        // Invalid JSON, add empty field
        fields = [{
          id: (nextId++).toString(),
          key: '',
          value: '',
          type: 'string'
        }];
      }
    }
    viewMode = viewMode === 'visual' ? 'raw' : 'visual';
  }

  function handleRawJsonChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    jsonValue = target.value;
    dispatch('update', jsonValue);
  }
</script>

<div class="space-y-4">
  <!-- Header with mode toggle -->
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-3">
      <h3 class="text-lg font-semibold text-brand-gray-800 dark:text-gray-200">Request Body</h3>
      <div class="text-xs bg-brand-gray-100 dark:bg-gray-700 text-brand-gray-600 dark:text-gray-300 px-2 py-1 rounded">
        {viewMode === 'visual' ? 'Visual Builder' : 'Raw JSON'}
      </div>
    </div>
    
    <Button variant="secondary" size="sm" on:click={toggleViewMode} {disabled}>
      {#if viewMode === 'visual'}
        <Code class="w-4 h-4 mr-2" />
        Raw JSON
      {:else}
        <Eye class="w-4 h-4 mr-2" />
        Visual
      {/if}
    </Button>
  </div>

  {#if viewMode === 'visual'}
    <!-- Visual JSON Builder -->
    <div class="space-y-3">
      {#if fields.length === 0}
        <div class="text-center py-8 bg-brand-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-brand-gray-300 dark:border-gray-600">
          <Code class="w-8 h-8 text-brand-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p class="text-brand-gray-600 dark:text-gray-400 mb-4">No fields added yet</p>
          <Button variant="primary" size="sm" on:click={addField} {disabled}>
            <Plus class="w-4 h-4 mr-2" />
            Add First Field
          </Button>
        </div>
      {:else}
        <div class="space-y-3 max-h-64 overflow-y-auto">
          {#each fields as field (field.id)}
            <div class="flex items-end space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-brand-gray-200 dark:border-gray-600 animate-fade-in">
              <div class="flex-1">
                <InputField
                  id="key-{field.id}"
                  label="Key"
                  bind:value={field.key}
                  placeholder="field_name"
                  {disabled}
                  on:input={updateJson}
                />
              </div>
              
              <div class="w-24">
                <SelectField
                  id="type-{field.id}"
                  label="Type"
                  bind:value={field.type}
                  options={typeOptions}
                  {disabled}
                  on:change={updateJson}
                />
              </div>
              
              <div class="flex-1">
                {#if field.type === 'boolean'}
                  <SelectField
                    id="value-{field.id}"
                    label="Value"
                    bind:value={field.value}
                    options={[
                      { value: 'true', label: 'true' },
                      { value: 'false', label: 'false' }
                    ]}
                    {disabled}
                    on:change={updateJson}
                  />                {:else if field.type === 'null'}
                  <div class="mt-1">
                    <div class="input-label">Value</div>
                    <div class="px-4 py-3 bg-brand-gray-100 dark:bg-gray-700 border-2 border-brand-gray-200 dark:border-gray-600 rounded-xl text-brand-gray-500 dark:text-gray-400 text-sm">
                      null
                    </div>
                  </div>
                {:else}
                  <InputField
                    id="value-{field.id}"
                    label="Value"
                    bind:value={field.value}
                    placeholder={field.type === 'object' || field.type === 'array' ? '{"key": "value"}' : 'Enter value'}
                    rows={field.type === 'object' || field.type === 'array' ? 3 : undefined}
                    {disabled}
                    on:input={updateJson}
                  />
                {/if}
              </div>
              
              <div class="pb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  on:click={() => removeField(field.id)}
                  {disabled}
                  title="Remove field"
                >
                  <Trash2 class="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          {/each}
        </div>
        
        <Button variant="secondary" on:click={addField} {disabled}>
          <Plus class="w-4 h-4 mr-2" />
          Add Field
        </Button>
      {/if}
    </div>
  {:else}
    <!-- Raw JSON Editor -->
    <div class="space-y-2">
      <textarea
        bind:value={jsonValue}
        on:input={handleRawJsonChange}
        {disabled}
        class="input-field font-mono text-sm h-64 resize-none"
        placeholder="Enter JSON here..."
      ></textarea>
      
      {#if jsonValue}
        <div class="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            on:click={() => {
              navigator.clipboard.writeText(jsonValue);
            }}
            {disabled}
          >
            <Copy class="w-4 h-4 mr-1" />
            Copy JSON
          </Button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
