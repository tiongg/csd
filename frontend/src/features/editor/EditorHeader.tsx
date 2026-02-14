import { useContentEditor } from '@/context/ContentEditorContext';
import PresenceIndicator from './PresenceIndicator';

export default function EditorHeader() {
  const { course } = useContentEditor();

  return (
    <header className="flex w-full shrink-0 items-center justify-between border-b p-4">
      <p className="max-w-lg truncate text-lg font-medium">{course.title}</p>
      <PresenceIndicator />
    </header>
  );
}
