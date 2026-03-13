import useCrepeEditor from '@/hooks/useCrepeEditor';
import { Milkdown, MilkdownProvider } from '@milkdown/react';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import '../viewer.css';

type CourseMarkdownDisplayProps = {
  content: string;
};

function ViewerInternal({ content }: CourseMarkdownDisplayProps) {
  useCrepeEditor({
    readOnly: true,
    defaultContent: content,
  });

  return (
    <div className="bg-card rounded-lg border px-8 shadow-sm">
      <Milkdown />
    </div>
  );
}

export default function CourseMarkdownDisplay({
  content,
}: CourseMarkdownDisplayProps) {
  return (
    <MilkdownProvider>
      <ViewerInternal content={content} />
    </MilkdownProvider>
  );
}
