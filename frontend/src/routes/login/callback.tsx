import { useApiQuery } from '@/lib/fetch-client';
import { useToken } from '@/lib/token';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/login/callback')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { code } = Route.useSearch() as { code: string };
  const [, setAccessToken] = useToken();

  const { data: exchangeData } = useApiQuery('post', '/api/auth/exchange', {
    body: { code },
  });

  useEffect(() => {
    if (!exchangeData) return;
    setAccessToken(exchangeData.accessToken);
    navigate({ to: '/' });
  }, [exchangeData, navigate, setAccessToken]);

  return <div>Redirecting...</div>;
}
