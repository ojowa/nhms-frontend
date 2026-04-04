export const MAIN_API_PREFIX = '/api';
export const LAB_API_PREFIX = '/api/lab';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');
const stripApiSuffix = (value: string): string => value.replace(/\/api\/?$/, '');

const withDefault = (value: string | undefined, fallback: string): string =>
  trimTrailingSlash(value && value.trim() ? value : fallback);

export const backendOrigin = withDefault(
  process.env.NHMS_BACKEND_ORIGIN ||
    process.env.NEXT_PRIVATE_BACKEND_ORIGIN ||
    (process.env.NEXT_PUBLIC_BACKEND_API_URL
      ? stripApiSuffix(process.env.NEXT_PUBLIC_BACKEND_API_URL)
      : undefined),
  'http://localhost:4001'
);
