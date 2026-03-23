import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useContentReview } from '@/context/ContentReviewContext';
import { type SectionType } from '@/lib/content.type';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { match } from 'ts-pattern';
import MarkdownViewer from './MarkdownViewer';
import QuizViewer from './QuizViewer';

dayjs.extend(relativeTime);

type ReviewSectionViewerProps = {
  section: SectionType;
};

function ReviewSectionViewer({ section }: ReviewSectionViewerProps) {
  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-8">
          {match(section)
            .with({ type: 'markdown' }, (s) => (
              <MarkdownViewer content={s.content} />
            ))
            .with({ type: 'quiz' }, (s) => (
              <div className="p-4">
                <QuizViewer quiz={s.content} />
              </div>
            ))
            .exhaustive()}
        </div>
      </div>
    </div>
  );
}

export default function CourseReview() {
  const { content, currentSection, setCurrentSection, contentVersion, course } =
    useContentReview();

  const sectionCount = content.length;
  const currentSectionData =
    currentSection >= 0 ? content[currentSection] : null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="bg-muted/40 flex shrink-0 items-center gap-2 overflow-x-auto border-b p-2">
        <Button
          size="sm"
          variant={currentSection === -1 ? 'default' : 'ghost'}
          onClick={() => setCurrentSection(-1)}
        >
          Overview
        </Button>
        <div className="bg-border mx-2 h-6 w-px shrink-0" />
        <div className="flex gap-1">
          {content.map((section, index) => (
            <Button
              key={index}
              size="sm"
              variant={currentSection === index ? 'default' : 'ghost'}
              onClick={() => setCurrentSection(index)}
            >
              {section.title}
            </Button>
          ))}
        </div>
      </nav>
      {currentSection === -1 || !currentSectionData ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription>
                  {course.description || 'No description'}
                </CardDescription>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  {(course.tags ?? []).length > 0
                    ? (course.tags ?? []).map((tag) => (
                        <span
                          key={tag}
                          className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))
                    : 'No tags'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium">
                      v{contentVersion.versionNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Published:</span>
                    <span className="font-medium">
                      {dayjs(contentVersion.publishedAt).fromNow()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Version Description</CardTitle>
              </CardHeader>
              <CardContent>
                {contentVersion.description ? (
                  <p className="text-sm">{contentVersion.description}</p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No description provided for this version.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Overview</CardTitle>
                <CardDescription>
                  This course contains {sectionCount}{' '}
                  {sectionCount === 1 ? 'section' : 'sections'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {content.map((section, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left"
                      onClick={() => setCurrentSection(index)}
                    >
                      <span className="truncate">
                        {index + 1}. {section.title}
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <ReviewSectionViewer section={currentSectionData} />
      )}
    </div>
  );
}
