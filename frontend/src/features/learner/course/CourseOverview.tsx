import CourseMetricsGrid, {
  type CourseMetric,
} from '@/components/CourseMetricsGrid';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SectionType } from '@/lib/content.type';
import { type Course, type EnrolledCourse } from '@/lib/utils';
import { BookOpen, Clock, FileText } from 'lucide-react';
import DropCourse from './DropCourse';
import EnrollCourse from './EnrollCourse';

type CourseOverviewProps = {
  course: Course;
  sections: SectionType[];
  enrollment?: EnrolledCourse;
};

const learnerTagChipClass =
  'border-sky-200 bg-sky-100 text-sky-700 hover:border-sky-200 hover:bg-sky-100 hover:text-sky-700';

export default function CourseOverview({
  course,
  sections,
  enrollment,
}: CourseOverviewProps) {
  const markdownCount = sections.filter((s) => s.type === 'markdown').length;
  const quizCount = sections.filter((s) => s.type === 'quiz').length;
  const metrics: CourseMetric[] = [
    {
      label: 'Total Sections',
      value: sections.length,
      icon: FileText,
    },
    {
      label: 'Content',
      value: markdownCount,
      icon: BookOpen,
    },
    {
      label: 'Quizzes',
      value: quizCount,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl font-bold">
                {course.title}
              </CardTitle>
            </div>
            {enrollment?.status === 'COMPLETED' && (
              <Badge variant="success">Complete</Badge>
            )}
          </div>
          <CardDescription>
            <div>{course.description || 'No description provided'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                {course.category}
              </Badge>
              {(course.tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className={learnerTagChipClass}>
                  {tag}
                </Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {'imageUrl' in course && course.imageUrl ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="h-[320px] w-full object-cover md:h-[420px]"
              />
            </div>
          ) : (
            <div className="flex h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 md:h-[420px]">
              No thumbnail
            </div>
          )}

          <CourseMetricsGrid metrics={metrics} />
        </CardContent>
      </Card>

      {enrollment ? (
        <DropCourse lessonId={enrollment.lessonSessionId} />
      ) : (
        <EnrollCourse courseId={course.id} />
      )}
    </div>
  );
}
