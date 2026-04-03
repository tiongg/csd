import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApiQuery } from '@/lib/fetch-client';
import {
  type ContentVersion,
  type Course,
  capitalizeFirst,
  cn,
} from '@/lib/utils';
import dayjs from 'dayjs';
import { CalendarIcon, FileTextIcon } from 'lucide-react';

type CourseVersionsProps = {
  course: Course;
};

type CourseVersionProps = {
  version: ContentVersion;
  isShown: boolean;
};

const statusVariants = {
  APPROVED: 'success',
  PENDING: 'secondary',
  REJECTED: 'destructive',
} as const;

function StatusChip({ version, isShown }: CourseVersionProps) {
  if (isShown) {
    return (
      <Badge className="border-transparent bg-sky-600 text-white hover:bg-sky-700">
        Currently Shown
      </Badge>
    );
  }

  if (version.status === 'REJECTED') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive">Rejected</Badge>
        </TooltipTrigger>

        <TooltipContent>
          <p>{version.rejectedReason || 'No reason provided'}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Badge variant={statusVariants[version.status]}>
      {capitalizeFirst(version.status)}
    </Badge>
  );
}

function CourseVersion({ version, isShown }: CourseVersionProps) {
  return (
    <div
      className={cn(
        'group flex cursor-default items-start gap-4 rounded-lg border p-4 transition-all',
        'hover:bg-accent/50 hover:border-accent',
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">Version {version.versionNumber}</h3>
          <StatusChip version={version} isShown={isShown} />
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          {version.description || 'No description provided'}
        </div>
        <div className="text-muted-foreground flex items-center gap-1 text-sm">
          <CalendarIcon className="size-3" />
          <time dateTime={version.publishedAt}>
            {dayjs(version.publishedAt).format('MMM D, YYYY')}
          </time>
        </div>
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

  // Version shown is the most recent approved version
  const versionShown = versions.find((v) => v.status === 'APPROVED');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileTextIcon className="text-muted-foreground h-5 w-5" />
          <h2 className="text-lg font-semibold">Version History</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Track changes and approval status of your course content
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96 space-y-3 overflow-y-auto pr-1">
          {versions.map((version) => (
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
