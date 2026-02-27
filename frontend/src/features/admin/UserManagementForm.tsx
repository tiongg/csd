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
import { useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import PendingContributorsForm from './PendingContributorsForm';
import AllAdminsList from './AllAdminsList';

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

  const { data: users } = useApiQuery('get', '/api/account', {});

  const filteredUsers = (users ?? []).filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { mutate: updateRole, isPending } = useApiMutation(
    'patch',
    '/api/account/{accountId}/role',
    {
      onSuccess: () => {
        toast.success('User role updated successfully');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update user role');
      },
    },
  );

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRole({
      params: { path: { accountId: userId } },
      body: { role: newRole },
    });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'CONTRIBUTOR':
        return 'bg-blue-100 text-blue-800';
      case 'LEARNER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <SearchBar
          placeholder="Search for Users"
          onSearch={setSearchQuery}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/6">Name</TableHead>
            <TableHead className="w-2/6">Email</TableHead>
            <TableHead className="w-2/6">Role</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.realname || user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  disabled={isPending}
                >
                  <SelectTrigger className={cn('w-32', getRoleColor(user.role as UserRole))}>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
