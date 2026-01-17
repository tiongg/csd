import type { paths } from '@/generated/api';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

const fetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
});

// When we do auth
// const authMiddleware: Middleware = {
//   async onRequest({ request, options }) {
//     request.headers.set('Authentication', 'bar');
//     return request;
//   },
// };

// fetchClient.use(authMiddleware);

const $api = createClient(fetchClient);

export const useApiQuery = $api.useQuery;
export const useApiMutation = $api.useMutation;
export const useApiInfiniteQuery = $api.useInfiniteQuery;
export const useApiSuspenseQuery = $api.useSuspenseQuery;
