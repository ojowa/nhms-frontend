import { createApi } from './createApi';
import { backendApiUrl } from './runtimeConfig';

export const backendApi = createApi({
  baseURL: backendApiUrl,
});

export default backendApi;
