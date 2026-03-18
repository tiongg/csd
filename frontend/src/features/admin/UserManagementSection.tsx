import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import {
  useApiQuery,
  useApiMutation,
  apiQueryOptions,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, Edit, Archive, Filter, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

type UserRole = 'ALL' | 'ADMIN' | 'LEARNER' | 'CONTRIBUTOR';
type UserStatus = 'ALL' | 'ACTIVE' | 'PENDING';

export default function UserManagementSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ALL');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // API queries
  const { data: allUsers, isLoading } = useApiQuery('get', '/api/account/', {});
  const { data: pendingContributors } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {}
  );

  // Role update mutation
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

  // Filtering and sorting logic
  const filteredUsers = (allUsers ?? []).filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.realname || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;

    // For pending status, we check if user is in pending contributors
    const isPending = pendingContributors?.some(p => p.id === user.id);
    const matchesStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'PENDING' && isPending) ||
      (selectedStatus === 'ACTIVE' && !isPending);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    if (key === 'name') {
      return direction === 'asc'
        ? a.username.localeCompare(b.username)
        : b.username.localeCompare(a.username);
    }
    if (key === 'role') {
      return direction === 'asc'
        ? a.role.localeCompare(b.role)
        : b.role.localeCompare(a.role);
    }
    if (key === 'lastActive') {
      return direction === 'asc'
        ? 0 : 0; // Would need real timestamp data
    }
    return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRoleChange = (userId: string, newRole: 'LEARNER' | 'CONTRIBUTOR' | 'ADMIN') => {
    updateRole({
      params: { path: { accountId: userId } },
      body: { role: newRole },
    });
  };

  const handleApprove = (userId: string, name: string) => {
    toast.success(`${name} has been approved as a contributor`);
    // In real implementation, this would call the approve API
  };

  const handleReject = (userId: string, name: string) => {
    toast.success(`${name}'s application has been rejected`);
    // In real implementation, this would call the reject API
  };

  const getAvatarInitials = (username: string) => {
    return username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (user: any) => {
    const isPending = pendingContributors?.some(p => p.id === user.id);
    if (isPending) {
      return <Badge variant="destructive">Pending</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      ADMIN: 'bg-slate-700 text-white',
      CONTRIBUTOR: 'bg-sky-600 text-white',
      LEARNER: 'bg-sky-100 text-sky-700',
    };
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || roleColors.LEARNER}>
        {role}
      </Badge>
    );
  };

  // Summary stats
  const totalUsers = allUsers?.length ?? 0;
  const activeUsers = filteredUsers.filter(u => !pendingContributors?.some(p => p.id === u.id)).length;
  const pendingUsers = pendingContributors?.length ?? 0;
  const adminCount = allUsers?.filter(u => u.role === 'ADMIN').length ?? 0;
  const learnerCount = allUsers?.filter(u => u.role === 'LEARNER').length ?? 0;
  const contributorCount = allUsers?.filter(u => u.role === 'CONTRIBUTOR').length ?? 0;

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-auto">
      {/* Header */}
      <div className="mb-2">
        <Heading1>User Management</Heading1>
        <p className="text-slate-600">Manage platform users and permissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Users</p>
                <p className="text-xl font-bold text-slate-900">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Active Users</p>
                <p className="text-xl font-bold text-slate-900">{activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending Approvals</p>
                <p className="text-xl font-bold text-slate-900">{pendingUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Filter className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Filters Active</p>
                <p className="text-sm font-semibold text-slate-700">
                  {selectedRole !== 'ALL' || selectedStatus !== 'ALL' ? 'Custom' : 'None'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <SearchBar
              placeholder="Search users by name or email..."
              onSearch={setSearchQuery}
              className="flex-1"
            />
            <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="LEARNER">Learners</SelectItem>
                <SelectItem value="CONTRIBUTOR">Contributors</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedStatus}
              onValueChange={(value: any) => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 whitespace-nowrap"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortConfig?.key === 'name' && (
                        <span className="text-slate-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Email</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 whitespace-nowrap"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      {sortConfig?.key === 'role' && (
                        <span className="text-slate-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50 whitespace-nowrap"
                    onClick={() => handleSort('lastActive')}
                  >
                    <div className="flex items-center gap-1">
                      Last Active
                      {sortConfig?.key === 'lastActive' && (
                        <span className="text-slate-400">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : sortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedUsers.map(user => (
                    <TableRow
                      key={user.id}
                      className={pendingContributors?.some(p => p.id === user.id) ? 'bg-amber-50/50' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-200 text-slate-700">
                            {getAvatarInitials(user.username)}
                          </div>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-xs text-slate-500">{user.realname || '—'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          disabled={isUpdatingRole || user.id === currentUser?.id}
                          onValueChange={(value) =>
                            handleRoleChange(user.id, value as any)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LEARNER">Learner</SelectItem>
                            <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-slate-600">—</TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {pendingContributors?.some(p => p.id === user.id) ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(user.id, user.username)}
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReject(user.id, user.username)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
