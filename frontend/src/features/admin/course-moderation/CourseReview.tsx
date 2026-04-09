import { Badge } from '@/components/ui/badge';
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
import { useApiQuery } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FileText, HelpCircle, Tag } from 'lucide-react';
import { match } from 'ts-pattern';
import MarkdownViewer from './MarkdownViewer';
import QuizViewer from './QuizViewer';
import ReviewHeader from './ReviewHeader';

dayjs.extend(relativeTime);

const reviewStatusStyles = {
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100',
  REJECTED: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
} as const;
const courseCategoryChipClass =
  'rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700';
const courseTagChipClass =
  'rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700';
const courseImageClassName = 'h-[320px] w-full object-cover md:h-[420px]';
const courseImagePlaceholderClassName =
  'flex h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 md:h-[420px]';

type ReviewSectionViewerProps = {
  section: SectionType;
};

type CourseWithCreatorMeta = {
  creatorUsername?: string;
  creator?: {
    username?: string;
  };
  createdBy?: {
    username?: string;
  };
};

function ReviewSectionViewer({ section }: ReviewSectionViewerProps) {
  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto px-6 pt-3 pb-6 md:px-8 md:pt-4 md:pb-8">
        <div className="mx-auto w-full max-w-4xl">
          {match(section)
            .with({ type: 'markdown' }, (s) => (
              <MarkdownViewer content={s.content} />
            ))
            .with({ type: 'quiz' }, (s) => <QuizViewer quiz={s.content} />)
            .exhaustive()}
        </div>
      </div>
    </div>
  );
}

export default function CourseReview() {
  const { content, currentSection, setCurrentSection, contentVersion, course } =
    useContentReview();
  const { data: versions } = useApiQuery(
    'get',
    '/api/content-versions/{courseId}',
    {
      params: {
        path: {
          courseId: course.id,
        },
      },
    },
  );
  const { data: accounts } = useApiQuery('get', '/api/account/', {});

  const sectionCount = content.length;
  const currentSectionData =
    currentSection >= 0 ? content[currentSection] : null;
  const markdownCount = content.filter((s) => s.type === 'markdown').length;
  const quizCount = content.filter((s) => s.type === 'quiz').length;
  const tags = course.tags ?? [];
  const courseWithCreatorMeta = course as typeof course & CourseWithCreatorMeta;
  const creatorFromAccounts = accounts?.find(
    (account) => account.id === course.creatorId,
  );
  const creatorLabel =
    creatorFromAccounts?.username ??
    courseWithCreatorMeta.creatorUsername ??
    courseWithCreatorMeta.creator?.username ??
    courseWithCreatorMeta.createdBy?.username ??
    'Course creator';
  const sortedVersions = [...(versions ?? [])].sort(
    (a, b) => b.versionNumber - a.versionNumber,
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100/60">
      <div className="shrink-0 px-4 py-3">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
          <nav className="relative flex h-14 min-w-0 flex-1 items-center gap-1 rounded-xl border border-slate-300/80 bg-white/60 py-1 pr-2 pl-2 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'relative z-10 flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap shadow-none transition-colors duration-200',
                currentSection === -1
                  ? 'bg-sky-500 text-white hover:bg-sky-400 hover:text-white'
                  : 'text-slate-700 hover:bg-white/80 hover:text-slate-900',
              )}
              onClick={() => setCurrentSection(-1)}
            >
              Overview
            </Button>
            <div className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max items-center gap-1 pr-1">
                {content.map((section, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="ghost"
                    className={cn(
                      'relative z-10 flex h-9 shrink-0 items-center justify-center rounded-lg px-3 text-sm font-medium whitespace-nowrap shadow-none transition-colors duration-200',
                      currentSection === index
                        ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-400 hover:border-sky-400 hover:text-white'
                        : 'text-slate-700 hover:bg-white/80 hover:text-slate-900',
                    )}
                    onClick={() => setCurrentSection(index)}
                  >
                    {section.title}
                  </Button>
                ))}
              </div>
            </div>
          </nav>
          <ReviewHeader />
        </div>
      </div>

      {currentSection === -1 || !currentSectionData ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          <div className="mx-auto w-full max-w-4xl space-y-3">
            <Card className="gap-0 border-slate-200/90 bg-white/90 py-0 shadow-sm">
              <CardContent className="space-y-3 p-4 md:p-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="min-w-0 flex-1 text-xl leading-[1.15] text-slate-900">
                      {course.title}
                    </CardTitle>
                    <div className="flex shrink-0 items-center">
                      <span className="inline-flex items-center rounded-md border border-slate-300 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-700">
                        By {creatorLabel}
                      </span>
                    </div>
                  </div>

                  <CardDescription className="text-base text-slate-600">
                    {course.description || 'No description provided.'}
                  </CardDescription>

                  {(course.category || tags.length > 0) && (
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {course.category && (
                          <span className={courseCategoryChipClass}>
                            {course.category}
                          </span>
                        )}
                        {tags.map((tag) => (
                          <span key={tag} className={courseTagChipClass}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {'imageUrl' in course && course.imageUrl ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={course.imageUrl as string}
                      alt={course.title}
                      className={courseImageClassName}
                    />
                  </div>
                ) : (
                  <div className={courseImagePlaceholderClassName}>
                    No thumbnail
                  </div>
                )}

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100/80">
                      <FileText className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Markdown</p>
                      <p className="text-2xl leading-none font-semibold">
                        {markdownCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100/80">
                      <HelpCircle className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Quizzes</p>
                      <p className="text-2xl leading-none font-semibold">
                        {quizCount}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100/80">
                      <Tag className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Total Sections
                      </p>
                      <p className="text-2xl leading-none font-semibold">
                        {sectionCount}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-300/80 bg-white/70 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-900">
                  Review Queue
                </CardTitle>
                <CardDescription className="text-slate-600">
                  See past review decisions for this course.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedVersions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No past reviews found yet.
                  </p>
                ) : (
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {sortedVersions.map((version) => (
                      <div
                        key={version.id}
                        className={cn(
                          'rounded-lg border border-slate-200 bg-white/90 px-3 py-3',
                          version.id === contentVersion.id &&
                          'border-sky-200 bg-sky-50/60',
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            Version {version.versionNumber}
                          </p>
                          <p className="text-xs text-slate-600">
                            {dayjs(version.publishedAt).format(
                              'MMM D, YYYY h:mm A',
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {dayjs(version.publishedAt).fromNow()}
                          </p>
                          <div className="ml-auto flex min-w-0 items-center gap-2">
                            {version.id === contentVersion.id && (
                              <Badge className="border border-sky-200 bg-sky-100 text-sky-700 hover:border-sky-200 hover:bg-sky-100 hover:text-sky-700">
                                Current Review
                              </Badge>
                            )}
                            <Badge
                              className={cn(
                                'border',
                                reviewStatusStyles[
                                version.status as keyof typeof reviewStatusStyles
                                ],
                              )}
                            >
                              {version.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-2 border-t border-slate-200/80 pt-2">
                          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                            Review Note
                          </p>
                          <p
                            className="mt-1 text-sm leading-relaxed break-words text-slate-700"
                            title={
                              version.description?.trim()
                                ? version.description
                                : 'No review note provided.'
                            }
                          >
                            {version.description?.trim()
                              ? version.description
                              : 'No review note provided.'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
