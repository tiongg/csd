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
