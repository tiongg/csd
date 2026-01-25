import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const { data } = useApiQuery(
    'get',
    '/api/account/',
    {},
    {
      enabled: !!user,
    },
  );
  const { mutateAsync: deleteAccount } = useApiMutation(
    'delete',
    '/api/account/{accountId}',
  );

  function onDeleteAccount(accountId: string) {
    return deleteAccount(
      {
        params: {
          path: { accountId },
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: apiQueryOptions('get', '/api/account/').queryKey,
          });
        },
      },
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {user ? (
        <div className="mb-4 flex items-center gap-4">
          <p>Logged in as {user.username}</p>
          <Button onClick={logout}>Logout</Button>
        </div>
      ) : (
        <>
          <Link to="/login" className="mb-4 text-blue-500 underline">
            Go to Login Page
          </Link>
          <Link to="/register" className="mb-4 text-blue-500 underline">
            Go to Register Page
          </Link>
        </>
      )}

      <div className="flex w-[400px] flex-col gap-2 rounded-lg border border-gray-200 p-4">
        <p className="font-bold">Existing emails</p>
        {(data ?? []).map((account) => (
          <div key={account.id} className="flex justify-between">
            <p>{account.email}</p>
            <p>{account.username}</p>
            <Button
              variant="destructive"
              onClick={() => onDeleteAccount(account.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
