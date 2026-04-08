import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApiQuery } from '@/lib/fetch-client';
import {
  type ContentVersion,
  type Course,
  cn,
} from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

type CourseVersionsProps = {
  course: Course;
};

type CourseVersionProps = {
  version: ContentVersion;
  isShown: boolean;
};

dayjs.extend(relativeTime);

const reviewStatusStyles = {
  APPROVED:
    'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  PENDING: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100',
  REJECTED: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
} as const;

function StatusChip({ version, isShown }: CourseVersionProps) {
  if (isShown) {
    return (
      <Badge className="border border-sky-200 bg-sky-100 text-sky-700 hover:border-sky-200 hover:bg-sky-100 hover:text-sky-700">
        Currently Shown
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        'border',
        reviewStatusStyles[version.status as keyof typeof reviewStatusStyles],
      )}
    >
      {version.status}
    </Badge>
  );
}

function CourseVersion({ version, isShown }: CourseVersionProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white/90 px-3 py-3',
        isShown && 'border-sky-200 bg-sky-50/60',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-sm font-semibold text-slate-900">
            Version {version.versionNumber}
          </p>
          <p className="text-xs text-slate-600">
            {dayjs(version.publishedAt).format('MMM D, YYYY h:mm A')}
          </p>
          <p className="text-xs text-slate-500">
            {dayjs(version.publishedAt).fromNow()}
          </p>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <StatusChip version={version} isShown={isShown} />
          </div>
        </div>

        <div className="mt-2 border-t border-slate-200/80 pt-2">
          <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
            Submission Note
          </p>
          <p
            className="mt-1 text-sm leading-relaxed break-words text-slate-700"
            title={
              version.description?.trim()
                ? version.description
                : 'No submission note provided.'
            }
          >
            {version.description?.trim()
              ? version.description
              : 'No submission note provided.'}
          </p>
        </div>

        {version.status === 'REJECTED' && version.rejectedReason?.trim() ? (
          <div className="mt-2 border-t border-slate-200/80 pt-2">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Review Feedback
            </p>
            <p className="mt-1 text-sm leading-relaxed break-words text-slate-700">
              {version.rejectedReason}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CourseVersions({ course }: CourseVersionsProps) {
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

  if (!versions || versions.length === 0) {
    return null;
  }

  const sortedVersions = [...versions].sort(
    (a, b) => b.versionNumber - a.versionNumber,
  );
  const versionShown = sortedVersions.find((v) => v.status === 'APPROVED');

  return (
    <Card className="border-slate-300/80 bg-white/70 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-slate-900">
          Version History
        </CardTitle>
        <CardDescription className="text-slate-600">
          Track submissions, approval status, and review feedback across course
          versions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
          {sortedVersions.map((version) => (
            <CourseVersion
              key={version.id}
              version={version}
              isShown={version.id === versionShown?.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
