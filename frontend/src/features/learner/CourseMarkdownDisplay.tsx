import useCrepeEditor from '@/hooks/useCrepeEditor';
import { Milkdown, MilkdownProvider } from '@milkdown/react';
import { useEffect } from 'react';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import './viewer.css';

type CourseMarkdownDisplayProps = {
  content: string;
};

function ViewerInternal({ content }: CourseMarkdownDisplayProps) {
  const { get: getViewer } = useCrepeEditor({
    readOnly: true,
    defaultContent: content,
  });

  useEffect(() => {
    const viewerInstance = getViewer();
    if (!viewerInstance) return;

    viewerInstance.action((ctx) => {});
  }, [getViewer]);

  return (
    <div className="px-2">
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
