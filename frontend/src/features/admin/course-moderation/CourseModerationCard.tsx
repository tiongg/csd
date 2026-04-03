import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

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
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-slate-300"
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
      <div className="relative h-52 w-full overflow-hidden border-b border-slate-200 bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
            No thumbnail
          </div>
        )}
        <Badge className="absolute top-3 left-3 border-slate-300 bg-white text-slate-700">
          Version {versionNumber}
        </Badge>
      </div>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="line-clamp-2 text-lg leading-snug text-slate-900">
          {title}
        </CardTitle>
        {creatorUsername && (
          <p className="text-sm font-medium text-slate-600">
            By {creatorUsername}
          </p>
        )}
        <p className="text-xs font-medium text-slate-500">{dateLabel}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {description || 'No description provided'}
        </p>
        {shouldRenderTags && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {hasTags ? (
              tagsList.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full border-slate-300 bg-slate-100/80 text-slate-700"
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
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-700">
          Review details
          <ArrowUpRight className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}
