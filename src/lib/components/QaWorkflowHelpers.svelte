<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import Modal from './Modal.svelte';  import { 
    Bug, 
    Terminal, 
    Copy, 
    Check, 
    FileText,
    ExternalLink 
  } from 'lucide-svelte';
  import type { ApiConfig, ApiRequest, ApiResponse } from '$lib/types';

  export let config: ApiConfig;
  export let request: ApiRequest;
  export let response: ApiResponse | null = null;
  export let fullUrl: string = '';

  const dispatch = createEventDispatcher<{
    copy: { type: string; content: string };
  }>();

  let showBugReportModal = false;
  let bugReportTitle = '';
  let bugReportDescription = '';
  let bugReportSteps = '';
  let bugReportExpected = '';
  let bugReportActual = '';
  let copySuccess = '';

  $: curlCommand = generateCurlCommand();
  $: bugReport = generateBugReport();

  function generateCurlCommand(): string {
    if (!request || !fullUrl) return '';

    let curl = `curl -X ${request.method} '${fullUrl}'`;
    
    // Add headers
    curl += ` \\\n  -H 'Content-Type: application/json'`;
    curl += ` \\\n  -H 'X-SDK-ID: ${config.sdkId}'`;
    curl += ` \\\n  -H 'Authorization: Bearer ${config.apiKey}'`;
    
    // Add body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method) && request.body) {
      const escapedBody = request.body.replace(/'/g, "'\"'\"'");
      curl += ` \\\n  -d '${escapedBody}'`;
    }

    return curl;
  }

  function generateBugReport(): string {
    const timestamp = new Date().toISOString();
    const env = config.environment.toUpperCase();
    
    let report = `# Bug Report - API Issue\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Environment:** ${env}\n`;
    report += `**Endpoint:** \`${request.method} ${request.path}\`\n\n`;
    
    if (bugReportTitle) {
      report += `## ${bugReportTitle}\n\n`;
    }
    
    if (bugReportDescription) {
      report += `### Description\n${bugReportDescription}\n\n`;
    }
    
    if (bugReportSteps) {
      report += `### Steps to Reproduce\n${bugReportSteps}\n\n`;
    }
    
    if (bugReportExpected) {
      report += `### Expected Behavior\n${bugReportExpected}\n\n`;
    }
    
    if (bugReportActual) {
      report += `### Actual Behavior\n${bugReportActual}\n\n`;
    }
    
    report += `### Technical Details\n\n`;
    report += `**Request Details:**\n`;
    report += `- Method: \`${request.method}\`\n`;
    report += `- URL: \`${fullUrl}\`\n`;
    report += `- Environment: \`${config.environment}\`\n`;
    report += `- SDK ID: \`${config.sdkId}\`\n`;
    
    if (request.body) {
      report += `\n**Request Body:**\n\`\`\`json\n${request.body}\n\`\`\`\n`;
    }
    
    if (response) {
      report += `\n**Response:**\n`;
      report += `- Status: \`${response.status} ${response.statusText}\`\n`;
      report += `- Timestamp: \`${response.timestamp.toISOString()}\`\n`;
      
      if (response.error) {
        report += `- Error: \`${response.error}\`\n`;
      }
      
      if (response.timing) {
        report += `- Response Time: \`${response.timing.total}ms\`\n`;
      }
      
      report += `\n**Response Data:**\n\`\`\`json\n${JSON.stringify(response.data, null, 2)}\n\`\`\`\n`;
    }
    
    report += `\n**cURL Command:**\n\`\`\`bash\n${curlCommand}\n\`\`\`\n`;
    
    return report;
  }

  async function copyToClipboard(content: string, type: string) {
    try {
      await navigator.clipboard.writeText(content);
      copySuccess = type;
      setTimeout(() => copySuccess = '', 2000);
      dispatch('copy', { type, content });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  function openBugReportModal() {
    // Pre-fill some fields based on response
    if (response && response.status >= 400) {
      bugReportTitle = `API Error: ${response.status} ${response.statusText}`;
      bugReportActual = `Received ${response.status} ${response.statusText} from ${request.method} ${request.path}`;
      
      if (response.error) {
        bugReportActual += `\n\nError details: ${response.error}`;
      }
    } else if (!response) {
      bugReportTitle = `API Request Failed`;
      bugReportActual = `Request to ${request.method} ${request.path} failed to complete`;
    }
    
    showBugReportModal = true;
  }

  function copyBugReport() {    copyToClipboard(bugReport, 'bug-report');
    showBugReportModal = false;
  }
</script>

<div class="space-y-4">
  <div class="flex items-center space-x-3 mb-4">
    <div class="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
      <Bug class="w-5 h-5 text-white" />
    </div>
    <h3 class="text-lg font-semibold text-brand-gray-800 dark:text-gray-200">QA Workflow Tools</h3>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Copy cURL Command -->
    <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-brand-gray-200 dark:border-gray-600 space-y-3">
      <div class="flex items-center space-x-2">
        <Terminal class="w-5 h-5 text-green-600" />
        <h4 class="font-semibold text-brand-gray-800 dark:text-gray-200">cURL Command</h4>
      </div>
      <p class="text-sm text-brand-gray-600 dark:text-gray-400">
        Copy the equivalent cURL command for terminal testing
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        fullWidth
        on:click={() => copyToClipboard(curlCommand, 'curl')}
        disabled={!request || !fullUrl}
      >
        {#if copySuccess === 'curl'}
          <Check class="w-4 h-4 mr-2 text-green-600" />
          Copied!
        {:else}
          <Copy class="w-4 h-4 mr-2" />
          Copy cURL
        {/if}
      </Button>
    </div>

    <!-- Copy Response JSON -->
    <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-brand-gray-200 dark:border-gray-600 space-y-3">
      <div class="flex items-center space-x-2">
        <FileText class="w-5 h-5 text-blue-600" />
        <h4 class="font-semibold text-brand-gray-800 dark:text-gray-200">Response Data</h4>
      </div>
      <p class="text-sm text-brand-gray-600 dark:text-gray-400">
        Copy formatted response JSON for documentation
      </p>
      <Button 
        variant="secondary" 
        size="sm" 
        fullWidth
        on:click={() => copyToClipboard(response ? JSON.stringify(response.data, null, 2) : '', 'response')}
        disabled={!response}
      >
        {#if copySuccess === 'response'}
          <Check class="w-4 h-4 mr-2 text-green-600" />
          Copied!
        {:else}
          <Copy class="w-4 h-4 mr-2" />
          Copy Response
        {/if}
      </Button>
    </div>

    <!-- Bug Report Generator -->
    <div class="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-brand-gray-200 dark:border-gray-600 space-y-3">
      <div class="flex items-center space-x-2">
        <Bug class="w-5 h-5 text-red-600" />
        <h4 class="font-semibold text-brand-gray-800 dark:text-gray-200">Bug Report</h4>
      </div>
      <p class="text-sm text-brand-gray-600 dark:text-gray-400">
        Generate a comprehensive bug report with all context
      </p>
      <Button 
        variant="danger" 
        size="sm"        fullWidth
        on:click={openBugReportModal}
        disabled={!request}
      >
        <Bug class="w-4 h-4 mr-2" />
        Create Bug Report
      </Button>
    </div>
  </div>
</div>

<!-- Bug Report Modal -->
<Modal bind:isOpen={showBugReportModal} size="lg" title="Generate Bug Report">
  <div class="space-y-4">    <div class="grid grid-cols-1 gap-4">
      <div>
        <label for="bug-title" class="block text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">
          Bug Title <span class="text-red-500">*</span>
        </label>
        <input
          id="bug-title"
          type="text"
          bind:value={bugReportTitle}
          placeholder="Brief description of the issue"
          class="w-full px-3 py-2 border border-brand-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-200"
        />
      </div>

      <div>
        <label for="bug-description" class="block text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">
          Description        </label>
        <textarea
          id="bug-description"
          bind:value={bugReportDescription}
          placeholder="Detailed description of the issue..."
          rows="3"
          class="w-full px-3 py-2 border border-brand-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-200 resize-none"
        ></textarea>
      </div>

      <div>
        <label for="bug-steps" class="block text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">
          Steps to Reproduce
        </label>
        <textarea
          id="bug-steps"
          bind:value={bugReportSteps}
          placeholder="1. Step one&#10;2. Step two&#10;3. Step three..."
          rows="3"
          class="w-full px-3 py-2 border border-brand-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-200 resize-none"
        ></textarea>
      </div>      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="bug-expected" class="block text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">
            Expected Behavior
          </label>
          <textarea
            id="bug-expected"
            bind:value={bugReportExpected}
            placeholder="What should have happened..."
            rows="3"
            class="w-full px-3 py-2 border border-brand-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-200 resize-none"
          ></textarea>
        </div>

        <div>
          <label for="bug-actual" class="block text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">
            Actual Behavior
          </label>
          <textarea
            id="bug-actual"
            bind:value={bugReportActual}
            placeholder="What actually happened..."
            rows="3"
            class="w-full px-3 py-2 border border-brand-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent dark:bg-gray-700 dark:text-gray-200 resize-none"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-brand-gray-700 dark:text-gray-300 mb-2">Preview</h4>
      <div class="max-h-64 overflow-y-auto bg-brand-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
        <pre class="text-xs text-brand-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">{bugReport}</pre>
      </div>
    </div>    <!-- Actions -->
    <div class="flex justify-end space-x-3 pt-4 border-t border-brand-gray-200 dark:border-gray-600">
      <Button variant="secondary" on:click={() => showBugReportModal = false}>
        Cancel
      </Button>
      <Button variant="primary" on:click={copyBugReport}>
        <Copy class="w-4 h-4 mr-2" />
        Copy Report
      </Button>
    </div>
  </div>
</Modal>
