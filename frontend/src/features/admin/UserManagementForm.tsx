import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import PendingContributorsForm from './PendingContributorsForm';
import { useAuth } from '@/context/AuthContext';

type UserRole = 'LEARNER' | 'CONTRIBUTOR' | 'ADMIN';

export default function UserManagementForm() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>User Management</Heading1>
        <p className="font-subtitle">Here's what's happening today!</p>
      </div>

      <div className="text-slate-800">
        <Tabs defaultValue="pending">
          <TabsList variant="line">
            <TabsTrigger value="pending" className="cursor-pointer">
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="users" className="cursor-pointer">
              All Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingContributorsForm />
          </TabsContent>

          <TabsContent value="users">
            <AllUsers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AllUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading } = useApiQuery('get', '/api/account/', {});

  const filteredUsers = (users ?? []).filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const { mutate: updateRole, isPending: isUpdatingRole } = useApiMutation(
    'patch',
    '/api/account/{accountId}/role',
    {
      onSuccess: async () => {
        toast.success('Role updated successfully');
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: apiQueryOptions('get', '/api/account/').queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: apiQueryOptions(
              'get',
              '/api/admins/contributor-applications',
            ).queryKey,
          }),
        ]);
      },
      onError: (err) => {
        toast.error((err as any)?.message ?? 'Failed to update role');
      },
    },
  );

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRole({
      params: { path: { accountId: userId } },
      body: { role: newRole },
    });
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full items-center justify-end">
        <SearchBar placeholder="Search for Users" onSearch={setSearchQuery} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/12">Username</TableHead>
            <TableHead className="w-3/12">Email</TableHead>
            <TableHead className="w-2/12">Real Name</TableHead>
            <TableHead className="w-1/12">Role</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-8 text-center text-slate-400"
              >
                Loading users…
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-8 text-center text-slate-400"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.realname ?? '—'}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    disabled={isUpdatingRole || user.id === currentUser?.id}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as UserRole)
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEARNER">Learner</SelectItem>
                      <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
