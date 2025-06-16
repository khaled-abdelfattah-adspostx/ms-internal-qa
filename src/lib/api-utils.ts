import type { ApiPreset } from './types';

/**
 * Available API presets for MomentScience endpoints
 */
export const API_PRESETS: ApiPreset[] = [
  {
    name: 'Moments API',
    path: '/native/v2/offers.json',
    method: 'POST',
    requiresPubUserId: false,
    defaultBody: JSON.stringify({ country: 'US', age: 35, pub_user_id: '' }, null, 2)
  },
  {
    name: 'Perkswall API',
    path: '/native/v4/perkswall.json',
    method: 'POST',
    requiresPubUserId: false,
    defaultBody: JSON.stringify({ country: 'US', age: 35, pub_user_id: '' }, null, 2)
  },
  {
    name: 'USP Get Session Details',
    path: '/sdk/v4/usp/session/<<sessionId>>.json',
    method: 'GET',
    requiresSessionId: true,
    requiresPubUserId: true
  },
  {
    name: 'USP Select Campaign',
    path: '/sdk/v4/usp/<<sessionId>>/<<campaignId>>/select.json',
    method: 'POST',
    requiresSessionId: true,
    requiresCampaignId: true,
    requiresPubUserId: true
  },
  {
    name: 'USP Unselect Campaign',
    path: '/sdk/v4/usp/<<sessionId>>/<<campaignId>>/unselect.json',
    method: 'POST',
    requiresSessionId: true,
    requiresCampaignId: true,
    requiresPubUserId: true
  },
  {
    name: 'USP Update Session',
    path: '/sdk/v4/usp/session/<<sessionId>>.json',
    method: 'PUT',
    requiresSessionId: true,
    requiresPubUserId: true,
    defaultBody: JSON.stringify({ selected: [], unselected: [] }, null, 2)
  }
];

/**
 * Get preset by name
 */
export function getPresetByName(name: string): ApiPreset | undefined {
  return API_PRESETS.find(preset => preset.name === name);
}

/**
 * Replace placeholders in API path
 */
export function replacePlaceholders(path: string, sessionId?: string, campaignId?: string): string {
  let result = path;
  
  if (sessionId) {
    result = result.replace(/<<sessionId>>/g, encodeURIComponent(sessionId));
  }
  
  if (campaignId) {
    result = result.replace(/<<campaignId>>/g, encodeURIComponent(campaignId));
  }
  
  return result;
}

/**
 * Build full URL with base URL and path
 */
export function buildFullUrl(baseUrl: string, path: string, pubUserId?: string): string {
  // Remove trailing slash from base URL
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  
  let fullUrl = cleanBaseUrl + cleanPath;
  
  // Add pub_user_id parameter if provided
  if (pubUserId) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    fullUrl += `${separator}pub_user_id=${encodeURIComponent(pubUserId)}`;
  }
  
  return fullUrl;
}

/**
 * Validate JSON string
 */
export function validateJson(jsonString: string): { isValid: boolean; error?: string } {
  if (!jsonString.trim()) {
    return { isValid: true }; // Empty string is valid (will be treated as empty object)
  }
  
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON format'
    };
  }
}

/**
 * Format JSON string with proper indentation
 */
export function formatJson(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

/**
 * Update JSON body with pub_user_id
 */
export function updateJsonBodyWithPubUserId(body: string, pubUserId: string): string {
  if (!body.trim()) {
    return JSON.stringify({ pub_user_id: pubUserId }, null, 2);
  }
  
  try {
    const parsed = JSON.parse(body);
    parsed.pub_user_id = pubUserId;
    return JSON.stringify(parsed, null, 2);
  } catch {
    // If JSON is invalid, return the original body
    return body;
  }
}
