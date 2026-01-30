import { useLocalStorage } from 'usehooks-ts';

const TOKEN_KEY = 'accessToken';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) ?? '';
};

export const useToken = () =>
  useLocalStorage<string>(TOKEN_KEY, '', {
    serializer: (value) => value,
    deserializer: (value) => value,
  });

type JwtPayload = {
  exp: number;
  sub: string;
};

export function getTokenExpiry(token: string) {
  if (!token) return;

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return;
    const [_header, payload, _signature] = parts;

    // Decode payload (base64url)
    if (!payload) return;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const decoded = JSON.parse(jsonPayload) as JwtPayload;

    return decoded.exp * 1000; // Convert to milliseconds
  } catch {}
}

export function getTokenExpiryInMs(token: string) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return 0;
  return expiry - Date.now();
}
