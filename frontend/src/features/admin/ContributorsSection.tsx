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
import { Heading1 } from '@/components/ui/typography';
import {
  useApiQuery,
  useApiMutation,
  apiQueryOptions,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X, Edit, Archive, Upload, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ContributorStatus = 'ALL' | 'ACTIVE' | 'PENDING';

export default function ContributorsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ContributorStatus>('ALL');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const queryClient = useQueryClient();

  // API queries
  const { data: allUsers, isLoading } = useApiQuery('get', '/api/account/', {});
  const { data: allCourses } = useApiQuery('get', '/api/courses/', {});
  const { data: pendingContributors } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {}
  );

  // Mutations
  const { mutate: approveContributors } = useApiMutation(
    'post',
    '/api/admins/contributor-applications/approve',
    {
      onSuccess: async () => {
        toast.success('Contributor(s) approved');
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions(
            'get',
            '/api/admins/contributor-applications',
          ).queryKey,
        });
      },
      onError: () => {
        toast.error('Failed to approve contributor(s)');
      },
    },
  );

  const { mutate: rejectContributors } = useApiMutation(
    'post',
    '/api/admins/contributor-applications/reject',
    {
      onSuccess: async () => {
        toast.success('Contributor(s) rejected');
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions(
            'get',
            '/api/admins/contributor-applications',
          ).queryKey,
        });
      },
      onError: () => {
        toast.error('Failed to reject contributor(s)');
      },
    },
  );

  // Generate mock contributor data with real pending contributors
  const contributorData = [
    ...(pendingContributors?.map((p: any) => ({
      id: p.id,
      name: p.username,
      email: p.email,
      coursesContributed: 0,
      lastActive: 'Never',
      status: 'pending',
      uploadsThisMonth: 0,
      activityTrend: [0],
    })) ?? []),
    // Add some active contributors from allUsers
    ...(allUsers?.filter(u => u.role === 'CONTRIBUTOR').slice(0, 5).map(user => ({
      id: user.id,
      name: user.username,
      email: user.email,
      coursesContributed: Math.floor(Math.random() * 15),
      lastActive: `${Math.floor(Math.random() * 24) + 1} hours ago`,
      status: 'active',
      uploadsThisMonth: Math.floor(Math.random() * 20) + 5,
      activityTrend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 30),
    })) ?? []),
  ];

  // Filtering and sorting logic
  const filteredContributors = contributorData.filter(contributor =>
    contributor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contributor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedContributors = [...filteredContributors].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    if (key === 'name') {
      return direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (key === 'courses') {
      return direction === 'asc'
        ? a.coursesContributed - b.coursesContributed
        : b.coursesContributed - a.coursesContributed;
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

  const handleApprove = (id: number, name: string) => {
    approveContributors({
      body: { learnerUuids: [id.toString()] },
    });
  };

  const handleReject = (id: number, name: string) => {
    rejectContributors({
      body: { learnerUuids: [id.toString()] },
    });
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock data for graphs
  const uploadTrendData = [
    { week: 'W1', uploads: 45 },
    { week: 'W2', uploads: 52 },
    { week: 'W3', uploads: 48 },
    { week: 'W4', uploads: 61 },
  ];

  const coursesPerContributorData = [
    { name: 'Sarah Johnson', courses: 12 },
    { name: 'Michael Chen', courses: 8 },
    { name: 'Emma Williams', courses: 15 },
    { name: 'David Wilson', courses: 6 },
    { name: 'Rachel Green', courses: 10 },
  ];

  // Summary stats
  const totalContributors = allUsers?.filter(u => u.role === 'CONTRIBUTOR').length ?? 0;
  const activeContributors = contributorData.filter(c => c.status === 'active').length;
  const pendingCount = contributorData.filter(c => c.status === 'pending').length;
  const totalUploads = contributorData.reduce((sum, c) => sum + c.uploadsThisMonth, 0);

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-auto">
      {/* Header */}
      <div className="mb-2">
        <Heading1>Contributors</Heading1>
        <p className="text-slate-600">Manage contributor applications and content</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Contributors</p>
                <p className="text-xl font-bold text-slate-900">{totalContributors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Active Contributors</p>
                <p className="text-xl font-bold text-slate-900">{activeContributors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pending Approvals</p>
                <p className="text-xl font-bold text-slate-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Uploads This Month</p>
                <p className="text-xl font-bold text-slate-900">{totalUploads}</p>
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
              placeholder="Search contributors by name or email..."
              onSearch={setSearchQuery}
              className="flex-1"
            />
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Contributors Table */}
        <Card className="lg:col-span-2">
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
                      onClick={() => handleSort('courses')}
                    >
                      <div className="flex items-center gap-1">
                        Courses Contributed
                        {sortConfig?.key === 'courses' && (
                          <span className="text-slate-400">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Last Active</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-slate-400">
                        Loading contributors...
                      </TableCell>
                    </TableRow>
                  ) : sortedContributors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-slate-400">
                        No contributors found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedContributors.map(contributor => (
                      <TableRow
                        key={contributor.id}
                        className={contributor.status === 'pending' ? 'bg-amber-50/50' : ''}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                              contributor.status === 'active'
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {getAvatarInitials(contributor.name)}
                            </div>
                            <div>
                              <div className="font-medium">{contributor.name}</div>
                              <div className="text-xs text-slate-500">{contributor.uploadsThisMonth} uploads this month</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{contributor.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-sky-500"
                                style={{ width: `${Math.min(100, contributor.coursesContributed * 8)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {contributor.coursesContributed}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">{contributor.lastActive}</TableCell>
                        <TableCell>
                          <Badge
                            variant={contributor.status === 'active' ? 'default' : 'secondary'}
                            className={
                              contributor.status === 'pending'
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                : ''
                            }
                          >
                            {contributor.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {contributor.status === 'pending' ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(contributor.id, contributor.name)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(contributor.id, contributor.name)}
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

        {/* Optional Graphs */}
        <div className="flex flex-col gap-4">
          {/* Upload Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Trend</CardTitle>
              <CardDescription>Weekly content creation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-36">
                <svg className="h-full w-full" viewBox="0 0 300 130">
                  {/* Grid lines */}
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={i}
                      x1={35}
                      y2={i * 28 + 15}
                      y1={i * 28 + 15}
                      x2={290}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Y-axis labels */}
                  {[0, 1, 2, 3].map((i) => (
                    <text
                      key={i}
                      x={30}
                      y={i * 28 + 19}
                      className="text-[8px] fill-slate-500 text-right"
                      fontSize="8"
                      textAnchor="end"
                    >
                      {75 - i * 18}
                    </text>
                  ))}

                  {/* Upload line */}
                  <polyline
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={uploadTrendData.map((d, i) =>
                      `${50 + i * 70},${118 - (d.uploads / 75) * 98}`
                    ).join(' ')}
                  />

                  {/* Data points */}
                  {uploadTrendData.map((d, i) => (
                    <circle
                      key={i}
                      cx={50 + i * 70}
                      cy={118 - (d.uploads / 75) * 98}
                      r="4"
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* X-axis labels */}
                  {uploadTrendData.map((d, i) => (
                    <text
                      key={i}
                      x={50 + i * 70}
                      y={126}
                      className="text-[8px] fill-slate-500 text-center"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {d.week}
                    </text>
                  ))}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Courses per Contributor */}
          <Card>
            <CardHeader>
              <CardTitle>Courses per Contributor</CardTitle>
              <CardDescription>Top contributors by output</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coursesPerContributorData.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-200 text-slate-700">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-900 max-w-28">
                        {contributor.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Upload className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-900">
                        {contributor.courses}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
