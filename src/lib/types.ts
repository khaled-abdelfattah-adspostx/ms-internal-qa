// API Configuration Types
export interface ApiConfig {
  globalPubUserId: string;
  environment: 'staging' | 'production';
  stagingUrl: string;
  productionUrl: string;
  sdkId: string;
  apiKey: string;
}

// API Request Types
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: string;
  sessionId?: string;
  campaignId?: string;
}

// API Preset Types
export interface ApiPreset {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiresSessionId?: boolean;
  requiresCampaignId?: boolean;
  requiresPubUserId?: boolean;
  defaultBody?: string;
}

// API Response Types
export interface ApiResponseTiming {
  total: number;
  dns: number;
  connect: number;
  ttfb: number; // Time to first byte
  download: number;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  data: unknown;
  timestamp: Date;
  timing?: ApiResponseTiming;
  error?: string;
  headers?: Record<string, string>;
}

// Request History Types
export interface RequestHistoryItem {
  id: string;
  timestamp: Date;
  config: ApiConfig;
  request: ApiRequest;
  response: ApiResponse;
  url: string;
}

// Token Management Types
export interface TokenConfig {
  name: string;
  apiKey: string;
  sdkId: string;
  description?: string;
  environment: 'staging' | 'production';
}

// Storage Types
export interface StorageData {
  apiConfigs: ApiConfig[];
  requestHistory: RequestHistoryItem[];
  tokenConfigs: TokenConfig[];
  favorites: string[]; // API preset names
}
