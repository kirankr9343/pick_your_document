// API Configuration and Base URL Resolver for Local and Production Deployments

const getEnvApiUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return ''; // Use relative /api proxy configured in vite.config.ts
  }

  // Fallback production backend URL
  return 'https://pick-your-document-backend.onrender.com';
};

export const API_BASE_URL = getEnvApiUrl();

export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
