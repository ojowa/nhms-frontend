const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const stripApiSuffix = (value: string): string => value.replace(/\/api\/?$/, '');

const isProduction = process.env.NODE_ENV === 'production';

const defaultBackendApiUrl = isProduction
  ? 'https://nhms-backend.vercel.app/api'
  : 'http://localhost:4001/api';

const defaultLabApiUrl = isProduction
  ? 'https://nhms-lab-service-backend.vercel.app/api'
  : 'http://localhost:4002/api';

export const backendApiUrl = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    defaultBackendApiUrl
);

export const labApiUrl = stripTrailingSlash(
  process.env.NEXT_PUBLIC_LAB_API_URL || defaultLabApiUrl
);

export const socketOrigin = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SOCKET_URL || (!isProduction ? stripApiSuffix(backendApiUrl) : '')
);
