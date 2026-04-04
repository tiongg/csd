import useCrepeEditor from '@/hooks/useCrepeEditor';
import { Milkdown, MilkdownProvider } from '@milkdown/react';
import { Badge } from '@/components/ui/badge';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

type MarkdownViewerProps = {
  content: string;
};

function MarkdownViewerInternal({ content }: MarkdownViewerProps) {
  useCrepeEditor({
    readOnly: true,
    defaultContent: content,
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">Section Content</p>
          <Badge
            variant="outline"
            className="rounded-md border-slate-300 bg-white text-[11px] tracking-wide text-slate-600 uppercase"
          >
            Markdown
          </Badge>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <Milkdown />
      </div>
    </div>
  );
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <MilkdownProvider>
      <MarkdownViewerInternal content={content} />
    </MilkdownProvider>
  );
}
