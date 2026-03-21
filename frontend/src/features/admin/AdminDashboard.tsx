import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading1 } from '@/components/ui/typography';
import { formatChartDay } from '@/lib/chart-date';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  UserCheck,
  Users,
  Users2,
} from 'lucide-react';
import { useState } from 'react';

// Mock data for summary cards with trends
const summaryCards = [
  {
    title: 'Total Users',
    value: 20,
    icon: Users,
    trend: 12,
    trendDirection: 'up',
    subtitle: '+12% from last month',
    color: 'blue',
  },
  {
    title: 'Active Contributors',
    value: 10,
    icon: UserCheck,
    trend: 5,
    trendDirection: 'up',
    subtitle: '+5 new this week',
    color: 'emerald',
  },
  {
    title: 'Total Courses',
    value: 12,
    icon: BookOpen,
    trend: 8,
    trendDirection: 'up',
    subtitle: `0 published`,
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
] as const;

// Mock course completion data
const courseCompletionData = [
  { name: 'JavaScript Basics', completion: 85, students: 1200 },
  { name: 'React Fundamentals', completion: 78, students: 950 },
  { name: 'Node.js Mastery', completion: 72, students: 780 },
  { name: 'TypeScript Advanced', completion: 68, students: 650 },
  { name: 'CSS for Developers', completion: 65, students: 540 },
];

// Mock weekly activity data
const weeklyActivitySeed = [
  { users: 120, contributors: 45 },
  { users: 145, contributors: 52 },
  { users: 130, contributors: 48 },
  { users: 160, contributors: 58 },
  { users: 175, contributors: 62 },
  { users: 90, contributors: 35 },
  { users: 85, contributors: 32 },
];

const weeklyActivityData = weeklyActivitySeed.map((entry, index) => {
  const daysAgo = weeklyActivitySeed.length - 1 - index;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    day: formatChartDay(date),
    users: entry.users,
    contributors: entry.contributors,
  };
});

const colorClasses = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export default function AdminDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month'>(
    'week',
  );

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                <div
                  className={cn(
                    'bg-opacity-10 flex size-8 items-center justify-center rounded-lg',
                    colorClasses[card.color],
                  )}
                >
                  <Icon
                    className={cn(
                      'size-4 text-white',
                      colorClasses[card.color],
                    )}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      card.trendDirection === 'up'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {card.trendDirection === 'up' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    {card.trend}%
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {course.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        {course.completion}%
                      </span>
                      <span className="ml-1 text-xs text-slate-500">
                        ({course.students} students)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-sky-400"
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
            <CardDescription>
              User and contributor activity over time
            </CardDescription>
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
                    className="fill-slate-500 text-right text-[8px]"
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
                  points={weeklyActivityData
                    .map(
                      (d, i) => `${50 + i * 45},${140 - (d.users / 200) * 120}`,
                    )
                    .join(' ')}
                />

                {/* Contributors line */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={weeklyActivityData
                    .map(
                      (d, i) =>
                        `${50 + i * 45},${140 - (d.contributors / 100) * 120}`,
                    )
                    .join(' ')}
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
                    className="fill-slate-500 text-center text-[8px]"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {d.day}
                  </text>
                ))}
              </svg>

              {/* Legend */}
              <div className="mt-2 flex items-center justify-center gap-6">
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
