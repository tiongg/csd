import type { components } from '@/generated/api';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { useToken } from '@/lib/token';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext } from 'react';

type AuthContextType = {
  user: components['schemas']['Account'] | undefined;
  loginWithPassword: (
    usernameOrEmail: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = PropsWithChildren<{}>;

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useToken();
  const queryClient = useQueryClient();

  const { mutateAsync: login } = useApiMutation('post', '/api/auth/login', {
    onSuccess: async (data) => {
      const { accessToken, account } = data;
      setAccessToken(accessToken);
      // Optimistically set the user data
      await queryClient.setQueryData(
        apiQueryOptions('get', '/api/auth/me').queryKey,
        account,
      );
    },
  });
  const { mutateAsync: logoutCall } = useApiMutation(
    'post',
    '/api/auth/logout',
    {
      onSuccess: () => {
        setAccessToken('');
        queryClient.removeQueries(apiQueryOptions('get', '/api/auth/me'));
      },
    },
  );

  const { data: user } = useApiQuery(
    'get',
    '/api/auth/me',
    {},
    {
      enabled: !!accessToken,
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
