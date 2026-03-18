import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, Users, UserCheck, BookOpen, Users2, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface AdminDashboardContentProps {
  allUsers?: Array<any>;
  allCourses?: Array<any>;
}

export default function AdminDashboardContent({ allUsers, allCourses }: AdminDashboardContentProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month'>('week');

  // Mock data for KPI cards with trends
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

  // Mock courses started vs completed
  const coursesProgressData = [
    { week: 'Week 1', started: 150, completed: 95 },
    { week: 'Week 2', started: 162, completed: 102 },
    { week: 'Week 3', started: 148, completed: 88 },
    { week: 'Week 4', started: 185, completed: 125 },
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {card.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${colorClasses[card.color]} bg-opacity-10 flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${colorClasses[card.color]}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl font-bold text-slate-900">{card.value}</div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    card.trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {card.trendDirection === 'up' ? (
                      <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5" />
                    )}
                    {card.trend}%
                  </div>
                </div>
                <p className="text-sm text-slate-500">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphs Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Course Completion Rates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Course Completion Rates</CardTitle>
            <CardDescription>Top 5 courses by completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courseCompletionData.map((course, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-900 max-w-36">{course.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{course.completion}%</span>
                      <span className="text-xs text-slate-500">({course.students} students)</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-slate-400 to-slate-600 transition-all duration-500"
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
            <CardDescription>Users vs Contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <svg className="h-full w-full" viewBox="0 0 350 160">
                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1={40}
                    y2={i * 38 + 15}
                    y1={i * 38 + 15}
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
                    y={i * 38 + 19}
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
                  stroke="#475569"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyActivityData.map((d, i) =>
                    `${50 + i * 45},${148 - (d.users / 200) * 128}`
                  ).join(' ')}
                />

                {/* Contributors line */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyActivityData.map((d, i) =>
                    `${50 + i * 45},${148 - (d.contributors / 100) * 128}`
                  ).join(' ')}
                />

                {/* Data points for users */}
                {weeklyActivityData.map((d, i) => (
                  <circle
                    key={`u-${i}`}
                    cx={50 + i * 45}
                    cy={148 - (d.users / 200) * 128}
                    r="3.5"
                    fill="#475569"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}

                {/* Data points for contributors */}
                {weeklyActivityData.map((d, i) => (
                  <circle
                    key={`c-${i}`}
                    cx={50 + i * 45}
                    cy={148 - (d.contributors / 100) * 128}
                    r="3.5"
                    fill="#059669"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                ))}

                {/* X-axis labels */}
                {weeklyActivityData.map((d, i) => (
                  <text
                    key={i}
                    x={50 + i * 45}
                    y={156}
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
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-slate-700" />
                  <span className="text-xs text-slate-600">Users</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span className="text-xs text-slate-600">Contributors</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Started vs Completed */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Courses Engagement</CardTitle>
            <CardDescription>Started vs Completed trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <svg className="h-full w-full" viewBox="0 0 700 140">
                {/* Grid lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1={70}
                    y2={i * 30 + 15}
                    y1={i * 30 + 15}
                    x2={680}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Y-axis labels */}
                {[0, 1, 2, 3].map((i) => (
                  <text
                    key={i}
                    x={65}
                    y={i * 30 + 19}
                    className="text-[8px] fill-slate-500 text-right"
                    fontSize="8"
                    textAnchor="end"
                  >
                    {200 - i * 50}
                  </text>
                ))}

                {/* Started bars */}
                {coursesProgressData.map((d, i) => (
                  <rect
                    key={`started-${i}`}
                    x={120 + i * 140}
                    y={128 - (d.started / 200) * 108}
                    width={40}
                    height={(d.started / 200) * 108}
                    fill="#475569"
                    rx="1"
                  />
                ))}

                {/* Completed bars */}
                {coursesProgressData.map((d, i) => (
                  <rect
                    key={`completed-${i}`}
                    x={165 + i * 140}
                    y={128 - (d.completed / 200) * 108}
                    width={40}
                    height={(d.completed / 200) * 108}
                    fill="#059669"
                    rx="1"
                  />
                ))}

                {/* X-axis labels */}
                {coursesProgressData.map((d, i) => (
                  <text
                    key={i}
                    x={142.5 + i * 140}
                    y={136}
                    className="text-[8px] fill-slate-500 text-center"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {d.week}
                  </text>
                ))}
              </svg>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-5 rounded-sm bg-slate-700" />
                  <span className="text-xs text-slate-600">Started</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-5 rounded-sm bg-emerald-600" />
                  <span className="text-xs text-slate-600">Completed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
