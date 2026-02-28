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
import { apiQueryOptions, useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import PendingContributorsForm from './PendingContributorsForm';
import AllAdminsList from './AllAdminsList';

type UserRole = 'LEARNER' | 'CONTRIBUTOR' | 'ADMIN';

/**
 * ROOT CAUSE (Issue 1):
 *
 * 1. Wrong API path: '/api/account' (no trailing slash) does not match the spec
 *    which defines the route as '/api/account/'. openapi-fetch does an exact path
 *    lookup — mismatch = request 404s or TypeScript errors = empty array.
 *    Fix: '/api/account/' everywhere.
 *
 * 2. Role mutation was missing queryClient.invalidateQueries on success.
 *    The PATCH completed on the server but the table never re-fetched, so the
 *    displayed role was always stale.
 *    Fix: invalidate '/api/account/' key inside onSuccess.
 *
 * 3. SearchBar `onSearch` prop didn't exist on the component — filtering was
 *    silently broken.
 *    Fix: searchbar.tsx updated to accept onSearch.
 */
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
            <TabsTrigger value="admins" className="cursor-pointer">
              All Admins
            </TabsTrigger>
            <TabsTrigger value="users" className="cursor-pointer">
              All Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingContributorsForm />
          </TabsContent>

          <TabsContent value="admins">
            <AllAdminsList />
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

  // ✅ Fix 1: '/api/account/' — trailing slash required to match spec
  const { data: users, isLoading } = useApiQuery('get', '/api/account/', {});

  // Cross-reference pending contributor applications for the "Pending?" column
  const { data: pendingApps } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {},
  );
  const pendingSet = new Set<string>((pendingApps ?? []).map((a) => a.id));

  const filteredUsers = (users ?? []).filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ✅ Fix 2: invalidate after role change so table immediately re-renders
  const { mutate: updateRole, isPending: isUpdatingRole } = useApiMutation(
    'patch',
    '/api/account/{accountId}/role',
    {
      onSuccess: () => {
        toast.success('Role updated successfully');
        queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/account/').queryKey,
        });
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

  const getRoleColorClasses = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':       return 'bg-red-100 text-red-800 border-red-200';
      case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LEARNER':     return 'bg-green-100 text-green-800 border-green-200';
      default:            return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full items-center justify-between gap-x-2">
        <span className="text-sm text-slate-500">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
        </span>
        {/* ✅ Fix 3: onSearch wired — SearchBar updated to accept the prop */}
        <SearchBar placeholder="Search for Users" onSearch={setSearchQuery} />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/12">Username</TableHead>
            <TableHead className="w-3/12">Email</TableHead>
            <TableHead className="w-2/12">Real Name</TableHead>
            <TableHead className="w-2/12">Current Role</TableHead>
            <TableHead className="w-2/12">Pending Contributor?</TableHead>
            <TableHead className="w-1/12">Change Role</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                Loading users…
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400">
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
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                      getRoleColorClasses(user.role as UserRole),
                    )}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {pendingSet.has(user.id) ? (
                    <span className="inline-flex rounded-full border border-yellow-300 bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                      Pending
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    disabled={isUpdatingRole}
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