import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useCourseViewer from '@/context/CourseViewingContext';
import { capitalizeFirst } from '@/lib/utils';
import { BookOpen, Clock, FileText } from 'lucide-react';

export default function CourseOverview() {
  const { course, sections } = useCourseViewer();

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
              <p className="text-muted-foreground">
                {course.description ?? 'No description provided'}
              </p>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <BookOpen className="h-3 w-3" />
              Course
            </Badge>
          </div>
        </CardHeader>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Course Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {sections.map((section, index) => (
              <div key={index}>
                <div className="hover:bg-muted/50 group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors">
                  <div className="bg-muted text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{section.title}</p>
                  </div>
                  <Badge
                    variant={section.type === 'quiz' ? 'default' : 'outline'}
                    className="shrink-0 text-xs"
                  >
                    {capitalizeFirst(section.type)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
