let setAccessTokenCallback: ((token: string) => void) | null = null;
let logoutCallback: (() => void) | null = null;

export const setAuthCallbacks = (setAccessToken: (token: string) => void, logout: () => void) => {
  setAccessTokenCallback = setAccessToken;
  logoutCallback = logout;
};

export const getAuthCallbacks = () => {
  if (!setAccessTokenCallback || !logoutCallback) {
    throw new Error('Auth callbacks not set. AuthProvider must be rendered.');
  }
  return { setAccessToken: setAccessTokenCallback, logout: logoutCallback };
};