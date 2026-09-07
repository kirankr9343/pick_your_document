// API Configuration and Base URL Resolver for Local and Production Deployments

const getEnvApiUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // On Vercel, localhost, and single-domain hosting, relative /api paths work natively via vercel.json rewrites & Vite proxy
  return '';
};

export const API_BASE_URL = getEnvApiUrl();

export const getApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
