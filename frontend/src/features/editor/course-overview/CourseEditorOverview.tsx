import {
  Badge,
} from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import type { Course } from '@/lib/utils';
import CourseImageOverview from '../course-image-overview/CourseImageOverview';
import PublishCourse from './PublishCourse';

type CourseEditorOverviewProps = {
  course: Course;
};

export default function CourseEditorOverview({
  course,
}: CourseEditorOverviewProps) {
  const tags = (course as { tags?: string[] }).tags ?? [];

  return (
    <Card className="gap-0 border-slate-200/90 bg-white/90 py-0 shadow-sm">
      <CardContent className="space-y-3 p-4 md:p-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="min-w-0 flex-1 text-xl leading-[1.15] text-slate-900">
              {course.title}
            </CardTitle>
            <div className="flex shrink-0 items-center">
              <PublishCourse course={course} />
            </div>
          </div>

          <CardDescription className="text-base">
            {course.description || 'No description provided.'}
          </CardDescription>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <CourseImageOverview
          className="min-h-[300px]"
          imageClassName="h-[300px] w-full object-cover md:h-[420px]"
        />
      </CardContent>
    </Card>
  );
}
