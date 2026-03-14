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
    <div className="p-8">
      <Milkdown />
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
