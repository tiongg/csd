import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Star, StarOff } from 'lucide-react';

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
  isFeatured?: boolean;
  onToggleFeatured?: (e: React.MouseEvent) => void;
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
  isFeatured,
  onToggleFeatured,
}: CourseModerationCardProps) {
  const shouldRenderTags = tags !== undefined;
  const tagsList = tags ?? [];
  const hasTags = tagsList.length > 0;

  return (
    <Card
      className="group flex h-full min-h-40 flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-slate-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
            No thumbnail
          </div>
        )}
        <Badge
          variant="outline"
          className="pointer-events-none absolute top-3 left-3 border-slate-300 bg-white/95 text-slate-700"
        >
          Version {versionNumber}
        </Badge>
        {isFeatured && (
          <Badge
            variant="outline"
            className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 border-amber-300 bg-amber-50 text-amber-700"
          >
            Featured
          </Badge>
        )}
        {creatorUsername && (
          <Badge
            variant="outline"
            className="pointer-events-none absolute right-3 bottom-3 border-slate-300 bg-white/95 text-slate-700"
          >
            By {creatorUsername}
          </Badge>
        )}
      </div>
      <CardHeader className="space-y-1.5 p-4 pb-1">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-lg font-bold text-slate-900">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onToggleFeatured && (
              <button
                type="button"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured(e);
                }}
                aria-label={isFeatured ? 'Unfeature course' : 'Feature course'}
              >
                {isFeatured ? (
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                ) : (
                  <StarOff className="h-5 w-5 text-slate-400" />
                )}
              </button>
            )}
            <span className="shrink-0 text-xs font-medium text-slate-500">
              {dateLabel}
            </span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
          {description || 'No description provided'}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col p-4 pt-2">
        <div className="space-y-3">
          {shouldRenderTags && (
            <div className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1">
              {hasTags ? (
                tagsList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex shrink-0 items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-1 text-xs font-medium text-sky-700"
                  >
                    {tag}
                  </span>
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
                shouldRenderTags ? 'mt-1' : 'mt-0',
              )}
            >
              {footerText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
