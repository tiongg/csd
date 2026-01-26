import type { components } from '@/generated/api';
import {
  apiQueryOptions,
  fetchClient,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { getTokenExpiryInMs, useToken } from '@/lib/token';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from 'react';

export type Account = components['schemas']['Account'];

export type AuthContextType = {
  user: Account | undefined;
  isLoggedIn: boolean;
  loginWithPassword: (
    usernameOrEmail: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = PropsWithChildren<{}>;

function useRefreshTimer(
  accessToken: string,
  onTokenRefresh: (accessToken: string, account: Account) => void,
  onTokenRefreshFail: () => void,
) {
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  function clearRefreshTimer() {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }

  function scheduleTokenRefresh(token: string) {
    clearRefreshTimer();

    const timeUntilExpiry = getTokenExpiryInMs(token);

    // Refresh 5 minutes before expiry
    const refreshThreshold = 5 * 60 * 1000;
    const refreshDelay = Math.max(
      timeUntilExpiry - refreshThreshold,
      1000, // At least 1 second
    );

    refreshTimerRef.current = setTimeout(async () => {
      const { data: tokenData } = await fetchClient.POST('/api/auth/refresh');
      if (tokenData) {
        const { accessToken, account } = tokenData;
        scheduleTokenRefresh(accessToken);
        onTokenRefresh(accessToken, account);
      } else {
        onTokenRefreshFail();
      }
    }, refreshDelay);
  }

  // Set up refresh timer when token changes
  useEffect(() => {
    if (accessToken) {
      scheduleTokenRefresh(accessToken);
    } else {
      clearRefreshTimer();
    }

    return () => clearRefreshTimer();
  }, [accessToken, scheduleTokenRefresh]);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useToken();
  const queryClient = useQueryClient();

  const { data: user, isPending: isLoggingIn } = useApiQuery(
    'get',
    '/api/auth/me',
    {},
    {
      enabled: !!accessToken,
    },
  );

  function clearAuthData() {
    setAccessToken('');
    queryClient.removeQueries({
      queryKey: apiQueryOptions('get', '/api/auth/me').queryKey,
    });
  }

  useRefreshTimer(
    accessToken,
    (newToken) => {
      setAccessToken(newToken);
      // TODO: For some reason set query data doesnt work here?
      queryClient.invalidateQueries({
        queryKey: apiQueryOptions('get', '/api/auth/me').queryKey,
      });
    },
    clearAuthData,
  );

  const { mutateAsync: login } = useApiMutation('post', '/api/auth/login', {
    onSuccess: async (data) => {
      const { accessToken, account } = data;
      setAccessToken(accessToken);
      queryClient.setQueryData(
        apiQueryOptions('get', '/api/auth/me').queryKey,
        account,
      );
    },
  });

  const { mutateAsync: logoutCall } = useApiMutation(
    'post',
    '/api/auth/logout',
    {
      onSuccess: clearAuthData,
    },
  );

  async function loginWithPassword(usernameOrEmail: string, password: string) {
    // TODO: This loses error information. Improve it later.
    try {
      await login({
        body: {
          usernameOrEmail,
          password,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithPassword,
        logout: () => logoutCall({}),
        isLoggedIn: !!user || (isLoggingIn && !!accessToken),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('Auth context missing!');
  }
  return context;
}
