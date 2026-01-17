import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const [emailField, updateEmailField] = useState('');
  const { data } = useApiQuery('get', '/api/account/');
  const { mutateAsync: createAccount } = useApiMutation(
    'post',
    '/api/account/',
  );
  const { mutateAsync: deleteAccount } = useApiMutation(
    'delete',
    '/api/account/{accountId}',
  );
  const queryClient = useQueryClient();

  function onCreateAccount() {
    return createAccount(
      {
        body: {
          email: emailField,
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
      <div className="w-[400px] rounded-lg border border-gray-200 p-4">
        <p>Email</p>
        <Input
          onChange={(e) => {
            updateEmailField(e.target.value);
          }}
        />
        <Button onClick={onCreateAccount}>Submit</Button>
      </div>

      <div className="flex w-[400px] flex-col gap-2 rounded-lg border border-gray-200 p-4">
        <p className="font-bold">Existing emails</p>
        {(data ?? []).map((account) => (
          <div key={account.id} className="flex justify-between">
            <p>{account.email}</p>
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
