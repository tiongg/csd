import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useApiQuery } from '@/lib/fetch-client';
import { ArrowUp, ArrowDown, Users, UserCheck, BookOpen, Users2, Check, X, Edit, Archive } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // API queries
  const { data: allUsers } = useApiQuery('get', '/api/account/', {});
  const { data: allCourses } = useApiQuery('get', '/api/courses/', {});
  const { data: pendingContributors } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {}
  );

  // Mock data for summary cards with trends
  const summaryCards = [
    {
      title: 'Total Users',
      value: allUsers?.length ?? 0,
      icon: Users,
      trend: 12,
      trendDirection: 'up',
      subtitle: '+12% from last month',
      color: 'blue',
    },
    {
      title: 'Active Contributors',
      value: allUsers?.filter(u => u.role === 'CONTRIBUTOR').length ?? 0,
      icon: UserCheck,
      trend: 5,
      trendDirection: 'up',
      subtitle: '+5 new this week',
      color: 'emerald',
    },
    {
      title: 'Total Courses',
      value: allCourses?.length ?? 0,
      icon: BookOpen,
      trend: 8,
      trendDirection: 'up',
      subtitle: `${allCourses?.filter(c => c.isPublished).length ?? 0} published`,
      color: 'purple',
    },
    {
      title: 'Total Teams',
      value: 4,
      icon: Users2,
      trend: 1,
      trendDirection: 'down',
      subtitle: '-1 from last month',
      color: 'orange',
    },
  ];

  // Mock contributor data with activity
  const contributorData = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      coursesContributed: 12,
      lastActive: '2 hours ago',
      status: 'active',
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael@example.com',
      coursesContributed: 8,
      lastActive: '5 hours ago',
      status: 'active',
      avatar: 'MC',
    },
    {
      id: 3,
      name: 'Emma Williams',
      email: 'emma@example.com',
      coursesContributed: 15,
      lastActive: '1 day ago',
      status: 'active',
      avatar: 'EW',
    },
    {
      id: 4,
      name: 'James Brown',
      email: 'james@example.com',
      coursesContributed: 3,
      lastActive: '3 days ago',
      status: 'pending',
      avatar: 'JB',
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      coursesContributed: 0,
      lastActive: '1 week ago',
      status: 'pending',
      avatar: 'LA',
    },
    {
      id: 6,
      name: 'David Wilson',
      email: 'david@example.com',
      coursesContributed: 6,
      lastActive: '4 hours ago',
      status: 'active',
      avatar: 'DW',
    },
    {
      id: 7,
      name: 'Rachel Green',
      email: 'rachel@example.com',
      coursesContributed: 10,
      lastActive: '6 hours ago',
      status: 'active',
      avatar: 'RG',
    },
  ];

  // Mock course completion data
  const courseCompletionData = [
    { name: 'JavaScript Basics', completion: 85, students: 1200 },
    { name: 'React Fundamentals', completion: 78, students: 950 },
    { name: 'Node.js Mastery', completion: 72, students: 780 },
    { name: 'TypeScript Advanced', completion: 68, students: 650 },
    { name: 'CSS for Developers', completion: 65, students: 540 },
  ];

  // Mock weekly activity data
  const weeklyActivityData = [
    { day: 'Mon', users: 120, contributors: 45 },
    { day: 'Tue', users: 145, contributors: 52 },
    { day: 'Wed', users: 130, contributors: 48 },
    { day: 'Thu', users: 160, contributors: 58 },
    { day: 'Fri', users: 175, contributors: 62 },
    { day: 'Sat', users: 90, contributors: 35 },
    { day: 'Sun', users: 85, contributors: 32 },
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
    toast.success(`${name} has been approved as a contributor`);
  };

  const handleReject = (id: number, name: string) => {
    toast.success(`${name}'s application has been rejected`);
  };

  const colorClasses = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Heading1>Admin Dashboard</Heading1>
          <p className="text-slate-600">Overview and contributor management</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedTimeRange}
            onValueChange={(value: any) => setSelectedTimeRange(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg ${colorClasses[card.color]} bg-opacity-10 flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${colorClasses[card.color]}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                  <div className={`flex items-center gap-1 text-sm ${
                    card.trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {card.trendDirection === 'up' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {card.trend}%
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contributors Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Contributors</CardTitle>
              <CardDescription>Manage contributor applications and activity</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <SearchBar
                placeholder="Search contributors..."
                onSearch={setSearchQuery}
                className="flex-1 md:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('name')}
                  >
                    Name
                    {sortConfig?.key === 'name' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => handleSort('courses')}
                  >
                    Courses Contributed
                    {sortConfig?.key === 'courses' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContributors.map((contributor) => (
                  <TableRow
                    key={contributor.id}
                    className={contributor.status === 'pending' ? 'bg-amber-50/50' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          contributor.status === 'active'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {contributor.avatar}
                        </div>
                        {contributor.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{contributor.email}</TableCell>
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
                    <TableCell className="text-slate-600">{contributor.lastActive}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Graphs */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Course Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rates</CardTitle>
            <CardDescription>Top 5 courses by completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courseCompletionData.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-900">{course.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-900">{course.completion}%</span>
                      <span className="text-xs text-slate-500 ml-1">({course.students} students)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-sky-400 to-sky-600 transition-all duration-500"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Trend</CardTitle>
            <CardDescription>User and contributor activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <svg className="h-full w-full" viewBox="0 0 350 150">
                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1={40}
                    y2={i * 35 + 15}
                    y1={i * 35 + 15}
                    x2={340}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Y-axis labels */}
                {[0, 1, 2, 3].map((i) => (
                  <text
                    key={i}
                    x={35}
                    y={i * 35 + 19}
                    className="text-[8px] fill-slate-500 text-right"
                    fontSize="8"
                    textAnchor="end"
                  >
                    {200 - i * 50}
                  </text>
                ))}

                {/* Users line */}
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyActivityData.map((d, i) =>
                    `${50 + i * 45},${140 - (d.users / 200) * 120}`
                  ).join(' ')}
                />

                {/* Contributors line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyActivityData.map((d, i) =>
                    `${50 + i * 45},${140 - (d.contributors / 100) * 120}`
                  ).join(' ')}
                />

                {/* Data points for users */}
                {weeklyActivityData.map((d, i) => (
                  <circle
                    key={`u-${i}`}
                    cx={50 + i * 45}
                    cy={140 - (d.users / 200) * 120}
                    r="3"
                    fill="#0284c7"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}

                {/* Data points for contributors */}
                {weeklyActivityData.map((d, i) => (
                  <circle
                    key={`c-${i}`}
                    cx={50 + i * 45}
                    cy={140 - (d.contributors / 100) * 120}
                    r="3"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}

                {/* X-axis labels */}
                {weeklyActivityData.map((d, i) => (
                  <text
                    key={i}
                    x={50 + i * 45}
                    y={148}
                    className="text-[8px] fill-slate-500 text-center"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                ))}
              </svg>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-sky-600" />
                  <span className="text-xs text-slate-600">Users</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-600">Contributors</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
