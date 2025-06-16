import type { StorageData, RequestHistoryItem, TokenConfig, ApiConfig } from './types';

const STORAGE_KEY = 'ms-qa-tools-data';

// Default storage data
const defaultStorageData: StorageData = {
  apiConfigs: [],
  requestHistory: [],
  tokenConfigs: [
    {
      name: 'Default MomentScience',
      apiKey: '124a5528-6db7-4373-b278-7605c2719d0f',
      sdkId: '8c7efcd41c82b20e',
      description: 'Default API configuration for MomentScience',
      environment: 'staging'
    }
  ],
  favorites: []
};

/**
 * Get data from localStorage with fallback to defaults
 */
export function getStorageData(): StorageData {
  if (typeof window === 'undefined') return defaultStorageData;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure new properties are present
      return { ...defaultStorageData, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse stored data:', error);
  }
  
  return defaultStorageData;
}

/**
 * Save data to localStorage
 */
export function setStorageData(data: StorageData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

/**
 * Add request to history
 */
export function addToHistory(item: Omit<RequestHistoryItem, 'id' | 'timestamp'>): void {
  const data = getStorageData();
  const historyItem: RequestHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date()
  };
  
  // Keep only the latest 100 requests
  data.requestHistory.unshift(historyItem);
  data.requestHistory = data.requestHistory.slice(0, 100);
  
  setStorageData(data);
}

/**
 * Save token configuration
 */
export function saveTokenConfig(config: TokenConfig): void {
  const data = getStorageData();
  const existingIndex = data.tokenConfigs.findIndex(c => c.name === config.name);
  
  if (existingIndex >= 0) {
    data.tokenConfigs[existingIndex] = config;
  } else {
    data.tokenConfigs.push(config);
  }
  
  setStorageData(data);
}

/**
 * Delete token configuration
 */
export function deleteTokenConfig(name: string): void {
  const data = getStorageData();
  data.tokenConfigs = data.tokenConfigs.filter(c => c.name !== name);
  setStorageData(data);
}

/**
 * Save API configuration preset
 */
export function saveApiConfig(config: ApiConfig): void {
  const data = getStorageData();
  data.apiConfigs.unshift(config);
  // Keep only the latest 10 configs
  data.apiConfigs = data.apiConfigs.slice(0, 10);
  setStorageData(data);
}

/**
 * Clear request history
 */
export function clearHistory(): void {
  const data = getStorageData();
  data.requestHistory = [];
  setStorageData(data);
}

/**
 * Toggle favorite preset
 */
export function toggleFavorite(presetName: string): void {
  const data = getStorageData();
  const index = data.favorites.indexOf(presetName);
  
  if (index >= 0) {
    data.favorites.splice(index, 1);
  } else {
    data.favorites.push(presetName);
  }
  
  setStorageData(data);
}

/**
 * Check if preset is favorited
 */
export function isFavorite(presetName: string): boolean {
  const data = getStorageData();
  return data.favorites.includes(presetName);
}
