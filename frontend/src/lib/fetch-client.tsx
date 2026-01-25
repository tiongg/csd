import type { paths } from '@/generated/api';
import createFetchClient, { type Middleware } from 'openapi-fetch';
import createClient from 'openapi-react-query';
import { getToken } from './token';

export const fetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  credentials: 'include',
});

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set('Authorization', `Bearer ${getToken()}`);
    return request;
  },
};

fetchClient.use(authMiddleware);

const $api = createClient(fetchClient);

export const useApiQuery = $api.useQuery;
export const useApiMutation = $api.useMutation;
export const useApiInfiniteQuery = $api.useInfiniteQuery;
export const useApiSuspenseQuery = $api.useSuspenseQuery;
export const apiQueryOptions = $api.queryOptions;
