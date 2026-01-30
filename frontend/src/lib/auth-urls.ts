type AuthProvider = 'google';

export function constructAuthUrl(provider: AuthProvider) {
  return `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/${provider}`;
}
