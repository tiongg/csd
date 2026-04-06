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
            <Badge className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
              <BookOpen className="h-3 w-3" />
              {course.category}
            </Badge>
          </div>
          <CardDescription>
            <div>{course.description || 'No description provided'}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(course.tags ?? []).map((tag) => (
                <Badge key={tag} variant="outline" className={learnerTagChipClass}>
                  {tag}
                </Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary rounded-lg p-2.5">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Sections</p>
                <p className="text-2xl font-semibold">{sections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Content</p>
                <p className="text-2xl font-semibold">{markdownCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Quizzes</p>
                <p className="text-2xl font-semibold">{quizCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {enrollment ? (
        <DropCourse lessonId={enrollment.lessonSessionId} />
      ) : (
        <EnrollCourse courseId={course.id} />
      )}
    </div>
  );
}
