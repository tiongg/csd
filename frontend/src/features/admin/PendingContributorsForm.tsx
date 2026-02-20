import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

function PendingApplicationRows({
  isSelectedUuid,
  setSelected,
}: {
  isSelectedUuid: (uuid: string) => boolean;
  setSelected: (uuid: string, checked: boolean) => void;
}) {
  const { data: applications, isLoading: isLoadingApplications } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
  );
  //console.log(applications);

  if (isLoadingApplications) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          No pending applications.
        </TableCell>
      </TableRow>
    );
  }

  return applications.map(({ username, email, id }) => (
    <TableRow key={email}>
      <TableCell>
        <Checkbox
          className="border-slate-800"
          checked={isSelectedUuid(id)}
          onCheckedChange={(value) => setSelected(id, value === true)}
        />
      </TableCell>
      <TableCell>{username}</TableCell>
      <TableCell>{email}</TableCell>
    </TableRow>
  ));
}

export default function PendingContributorsForm() {
  const [selectedUuids, setSelectedUuids] = React.useState<Set<string>>(
    () => new Set(),
  );
  const isSelectedUuid = (uuid: string) => selectedUuids.has(uuid);
  const setSelected = (uuid: string, checked: boolean) => {
    setSelectedUuids((prev) =>
      checked
        ? new Set([...prev, uuid])
        : new Set([...prev].filter((x) => x !== uuid)),
    );
  };
  async function approveContributors() {
    const learnerUuids = Array.from(selectedUuids);
    if (learnerUuids.length == 0) return;
    //console.log(learnerUuids);
    await approveContributorsAsync({
      body: { learnerUuids },
    });
  }

  async function rejectContributors() {
    const learnerUuids = Array.from(selectedUuids);
    if (learnerUuids.length == 0) return;
    //console.log(learnerUuids);
    await rejectContributorsAsync({
      body: { learnerUuids },
    });
  }

  const queryClient = useQueryClient();
  const { mutateAsync: approveContributorsAsync } = useApiMutation(
    'post',
    '/api/admins/contributor-applications/approve',
    {
      onSuccess: async () => {
        toast.success('Approved contributor');
        setSelectedUuids(new Set());
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions(
            'get',
            '/api/admins/contributor-applications',
          ).queryKey,
        });
      },
      onError: () => {
        toast.error('Failed to approve contributor');
      },
    },
  );

  const { mutateAsync: rejectContributorsAsync } = useApiMutation(
    'post',
    '/api/admins/contributor-applications/reject',
    {
      onSuccess: async () => {
        toast.success('Rejected contributor');
        setSelectedUuids(new Set());
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions(
            'get',
            '/api/admins/contributor-applications',
          ).queryKey,
        });
      },
      onError: () => {
        toast.error('Failed to reject contributor');
      },
    },
  );

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <Button
          variant="outline"
          className="w-24 cursor-pointer rounded-full"
          onClick={approveContributors}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          className="w-24 cursor-pointer rounded-full"
          onClick={rejectContributors}
        >
          Delete
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6"></TableHead>
            <TableHead className="w-2/6">Name</TableHead>
            <TableHead className="w-3/6">Email</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <PendingApplicationRows
            isSelectedUuid={isSelectedUuid}
            setSelected={setSelected}
          />
        </TableBody>
      </Table>
    </div>
  );
}
