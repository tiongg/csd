import type { components } from '@/generated/api';
import { fetchClient, useApiMutation } from '@/lib/fetch-client';
import { getToken, getTokenExpiryInMs, useToken } from '@/lib/token';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type Account = components['schemas']['Account'];

type AuthContextType = {
  user: Account | undefined;
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
  const [user, setUser] = useState<Account>();
  useRefreshTimer(
    accessToken,
    (newToken, account) => {
      setAccessToken(newToken);
      setUser(account);
    },
    () => {
      setAccessToken('');
      setUser(undefined);
    },
  );

  // On mount, check if token exists and fetch user
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (token) {
        const { data: user } = await fetchClient
          .GET('/api/auth/me')
          .catch(() => ({ data: undefined }));

        if (user) {
          setUser(user);
        }
      }
    })();
  }, []);

  const { mutateAsync: login } = useApiMutation('post', '/api/auth/login', {
    onSuccess: async (data) => {
      const { accessToken, account } = data;
      setAccessToken(accessToken);
      setUser(account);
    },
  });

  const { mutateAsync: logoutCall } = useApiMutation(
    'post',
    '/api/auth/logout',
    {
      onSuccess: () => {
        setAccessToken('');
        setUser(undefined);
      },
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
