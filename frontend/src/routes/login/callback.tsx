import { useToken } from '@/lib/token';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
export const Route = createFileRoute('/login/callback')({
  component: RouteComponent,
});

function RouteComponent() {
  const naviagte = useNavigate();
  const { accessToken } = Route.useSearch() as { accessToken: string };
  const [, setAccessToken] = useToken();
  useEffect(() => {
    if (!accessToken) return;
    setAccessToken(accessToken);
    naviagte({
      to: '/',
    });
  }, [accessToken, naviagte, setAccessToken]);

  return <div>Redirecting...</div>;
}
