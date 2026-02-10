import {
  useContentEditor,
  type SectionType,
} from '@/context/ContentEditorContext';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useY } from 'react-yjs';
import * as Y from 'yjs';

type SectionSelectProps = {
  index: number;
};

export default function SectionSelect({ index }: SectionSelectProps) {
  const { setCurrentSection, currentSection, deleteSection, doc } =
    useContentEditor();
  const [isEditing, setIsEditing] = useState(false);
  const title = useY(
    doc.getArray<SectionType>('root').get(index)!.get('title') as Y.Text,
  );
  const [editedTitle, setEditedTitle] = useState(title);

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      doc.transact(() => {
        const sections = doc.getArray<SectionType>('root');
        const section = sections.get(index);
        if (section) {
          const titleText = section.get('title') as Y.Text;
          titleText.delete(0, titleText.length);
          titleText.insert(0, editedTitle);
        }
      });
    }
    setIsEditing(false);
  };

  return (
    // Opting to use default input compoents for greater control over styling and behavior
    <div
      className={cn(
        'group relative flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors',
        index === currentSection
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted',
      )}
      onClick={() => !isEditing && setCurrentSection(index)}
    >
      {isEditing ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSaveTitle();
            } else if (e.key === 'Escape') {
              setEditedTitle(title);
              setIsEditing(false);
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
            setIsEditing(true);
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
          'absolute -top-2 -right-2 z-50 flex size-5 items-center justify-center rounded-full',
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
