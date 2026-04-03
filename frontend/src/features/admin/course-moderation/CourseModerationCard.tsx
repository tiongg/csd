import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CourseModerationCardProps = {
  title: string;
  creatorUsername?: string;
  versionNumber: number;
  dateLabel: string;
  description?: string | null;
  imageUrl?: string | null;
  tags?: string[];
  footerText?: string;
  onClick: () => void;
};

export function CourseModerationCard({
  title,
  creatorUsername,
  versionNumber,
  dateLabel,
  description,
  imageUrl,
  tags,
  footerText,
  onClick,
}: CourseModerationCardProps) {
  const shouldRenderTags = tags !== undefined;
  const tagsList = tags ?? [];
  const hasTags = tagsList.length > 0;

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-slate-200/80 bg-white/75 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative aspect-video w-full overflow-hidden border-b border-slate-200/80 bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
            No thumbnail
          </div>
        )}
      </div>
      <CardHeader className="space-y-2 pb-3">
        <CardTitle className="line-clamp-2 text-base text-slate-900">
          {title}
        </CardTitle>
        {creatorUsername && (
          <p className="text-sm font-medium text-slate-600">
            By {creatorUsername}
          </p>
        )}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="rounded-full border-sky-200 bg-sky-50 text-sky-700"
          >
            Version {versionNumber}
          </Badge>
          <p className="text-xs text-slate-500">{dateLabel}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="line-clamp-3 text-sm text-slate-600">
          {description || 'No description provided'}
        </p>
        {shouldRenderTags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hasTags ? (
              tagsList.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-slate-300 bg-slate-100/70 text-slate-700"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-slate-500">No tags</span>
            )}
          </div>
        )}
        {footerText && (
          <p
            className={cn(
              'text-xs font-medium text-slate-500',
              shouldRenderTags ? 'mt-3' : 'mt-2',
            )}
          >
            {footerText}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
