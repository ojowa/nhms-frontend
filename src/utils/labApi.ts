import { createApi } from './createApi';
import { labApiUrl } from './runtimeConfig';

export const labApi = createApi({
  baseURL: labApiUrl,
});

export default labApi;
