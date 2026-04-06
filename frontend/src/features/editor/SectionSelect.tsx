import { useContentEditor } from '@/context/ContentEditorContext';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useY } from 'react-yjs';
import { useBoolean } from 'usehooks-ts';
import * as Y from 'yjs';

type SectionSelectProps = {
  index: number;
  isActive: boolean;
};

export default function SectionSelect({ index, isActive }: SectionSelectProps) {
  const { setCurrentSection, deleteSection, doc } = useContentEditor();
  const title = useY(doc.getArray('root').get(index)!.get('title')!);
  const {
    value: isEditing,
    setTrue: startEditing,
    setFalse: stopEditing,
  } = useBoolean(false);

  function handleSaveTitle(newTitle: string) {
    if (!newTitle) return;
    doc.transact(() => {
      const sections = doc.getArray('root');
      const section = sections.get(index);
      if (section) {
        const titleText = section.get('title') as Y.Text;
        titleText.delete(0, titleText.length);
        titleText.insert(0, newTitle);
      }
    });
  }

  return (
    // Opting to use default input compoents for greater control over styling and behavior
    <div
      className={cn(
        'group relative z-10 flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors duration-200',
        isActive
          ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-400'
          : 'border-transparent bg-transparent text-slate-700 hover:bg-white/80 hover:text-slate-900',
      )}
      onClick={() => !isEditing && setCurrentSection(index)}
    >
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => handleSaveTitle(e.target.value)}
          onBlur={stopEditing}
          onKeyDown={(e) => {
            if (['Enter', 'Escape'].includes(e.key)) {
              e.preventDefault();
              stopEditing();
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="field-sizing-content h-5 rounded-sm bg-white p-0 px-1 text-black ring-0"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditing();
          }}
          className="cursor-pointer px-1"
        >
          {title}
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteSection(index);
        }}
        className={cn(
          'absolute -top-1 -right-1 z-50 flex size-5 items-center justify-center rounded-full',
          'border-border bg-background text-muted-foreground border opacity-0 shadow-sm',
          'transition-opacity group-hover:opacity-100 hover:bg-gray-100',
        )}
        aria-label="Delete section"
      >
        <XMarkIcon className="size-3" />
      </button>
    </div>
  );
}
