import { backendOrigin, LAB_API_PREFIX, MAIN_API_PREFIX } from './constants';

export interface ApiTarget {
  origin: string;
  upstreamPath: string;
  scope: 'main' | 'lab';
}

export const resolveApiTarget = (pathname: string): ApiTarget => {
  if (pathname === LAB_API_PREFIX || pathname.startsWith(`${LAB_API_PREFIX}/`)) {
    const upstreamPath = pathname.replace(LAB_API_PREFIX, MAIN_API_PREFIX) || MAIN_API_PREFIX;
    return { origin: backendOrigin, upstreamPath, scope: 'lab' };
  }

  return {
    origin: backendOrigin,
    upstreamPath: pathname.startsWith(MAIN_API_PREFIX) ? pathname : `${MAIN_API_PREFIX}${pathname}`,
    scope: 'main',
  };
};
