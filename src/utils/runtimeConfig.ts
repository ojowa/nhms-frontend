const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const stripApiSuffix = (value: string): string => value.replace(/\/api\/?$/, '');

const defaultBackendApiUrl = '/api';
const defaultLabApiUrl = defaultBackendApiUrl;

export const backendApiUrl = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    defaultBackendApiUrl
);

export const labApiUrl = stripTrailingSlash(defaultLabApiUrl);

export const socketOrigin = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SOCKET_URL || stripApiSuffix(backendApiUrl)
);
