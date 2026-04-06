import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  category: string;
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
  category,
  footerText,
  onClick,
  isFeatured,
  onToggleFeatured,
}: CourseModerationCardProps) {
  const shouldRenderTags = tags !== undefined;
  const tagsList = tags ?? [];
  const visibleTags = tagsList.slice(0, 8);
  const hiddenTagsCount = tagsList.length - visibleTags.length;

  return (
    <Card
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
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
      <div className="flex gap-3 p-3">
        <div className="relative w-56 shrink-0 self-stretch overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                {category}
              </span>
              <Badge
                variant="outline"
                className="border-slate-300 bg-white/95 text-slate-700"
              >
                Version {versionNumber}
              </Badge>
              {creatorUsername && (
                <Badge
                  variant="outline"
                  className="max-w-full border-slate-300 bg-white/95 text-slate-700"
                >
                  <span className="truncate">By {creatorUsername}</span>
                </Badge>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
              <span className="shrink-0 whitespace-nowrap text-xs font-medium text-slate-500">
                {dateLabel}
              </span>
            </div>
          </div>

          <h3 className="line-clamp-1 text-base font-bold text-slate-900">{title}</h3>

          <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
            {description || 'No description provided'}
          </p>

          {shouldRenderTags && (
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {visibleTags.length > 0 ? (
                <>
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700"
                    >
                      {tag}
                    </span>
                  ))}
                  {hiddenTagsCount > 0 && (
                    <span className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                      +{hiddenTagsCount} more
                    </span>
                  )}
                </>
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
      </div>
    </Card>
  );
}
