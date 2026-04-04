import useCrepeEditor from '@/hooks/useCrepeEditor';
import { Milkdown, MilkdownProvider } from '@milkdown/react';

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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">Section Content</p>
          <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-600 uppercase">
            Markdown
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Read-only markdown preview for this section.
        </p>
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
