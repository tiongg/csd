import { FireIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Heading1 } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CardWithDetails,
  CardWithPlusIcon,
} from '@/components/ui/custom-cards';
import SearchBar from '@/components/ui/searchbar';
import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

type Course = {
  id: string;
  title: string;
  creatorId: string;
  teamId: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function MyCoursesPage() {
  const { data: courses } = useApiQuery('get', '/api/courses', {});
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter courses based on search
  const filteredCourses = (courses ?? []).filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.creatorId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Since learners can only see published courses, filter for isPublished
  const publishedCourses = filteredCourses.filter((c) => c.isPublished === true);

  const handleStartNew = () => {
    // Navigate to discover page to start exploring courses
    navigate({ to: '/learner/discover' });
  };

  const handleViewCourse = (courseId: string) => {
    navigate({
      to: '/learner/courses/$courseId',
      params: { courseId },
    });
  };

  type CourseCardProps = {
    name: string;
    date: string;
    onClick?: () => void;
  };

  function CourseCard({ name, date, onClick }: CourseCardProps) {
    return (
      <div
        className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-card shadow-sm transition-all hover:border-slate-300 hover:shadow-md cursor-pointer"
        onClick={onClick}
      >
        <div className="flex h-full flex-col justify-between p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <ClockIcon className="size-4" />
              <span>Last updated: {dayjs(date).fromNow()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <Heading1>My Courses</Heading1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-rose-500">
              <div className="text-xl font-bold">{publishedCourses.length}</div>
              <FireIcon className="size-8 ml-2" />
            </div>
            <SearchBar placeholder="Search for Courses" onSearch={setSearchQuery} />
          </div>
        </div>
        <p className="font-subtitle">Track your learning progress</p>
      </div>

      <div className="text-slate-800">
        <Tabs defaultValue="all">
          <TabsList variant="line">
            <TabsTrigger value="all" className="cursor-pointer">
              All Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {publishedCourses.length === 0 ? (
              <div className="flex h-64 w-full items-center justify-center text-slate-500">
                <div className="text-center">
                  <p className="text-lg font-semibold">No courses yet</p>
                  <p className="text-sm mb-4">
                    Explore our course catalog to start learning!
                  </p>
                  <button
                    onClick={handleStartNew}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition-colors"
                  >
                    <CheckCircleIcon className="size-5" />
                    Explore Courses
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {publishedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    name={course.title}
                    date={course.updatedAt}
                    onClick={() => handleViewCourse(course.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
