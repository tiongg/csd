import { Button } from '@/components/ui/button';
import {
  useContentEditor,
  type SectionType,
} from '@/context/ContentEditorContext';
import useYArrayLength from '@/hooks/useYArrayLength';
import { Crepe } from '@milkdown/crepe';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect } from 'react';
import * as Y from 'yjs';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import './editor.css';
import EditorCourseDisplay from './EditorCourseDisplay';

function CrepeEditorInternal() {
  const { get: getEditor } = useEditor((root) => {
    return new Crepe({ root }).editor.use(collab);
  });
  const { doc, provider, currentSection } = useContentEditor();

  useEffect(() => {
    const editorInstance = getEditor();
    if (!editorInstance) return;

    editorInstance.action((ctx) => {
      try {
        const collabService = ctx.get(collabServiceCtx);
        collabService?.disconnect();

        const xmlFragment = doc
          .getArray<SectionType>('root')
          .get(currentSection)!
          .get('content') as Y.XmlFragment;

        collabService
          .bindXmlFragment(xmlFragment)
          .setAwareness(provider.awareness)
          .connect();
      } catch {
        // collabServiceCtx not ready yet, will retry on next render
      }
    });
  }, [getEditor, doc, provider, currentSection]);

  return <Milkdown />;
}

export default function CrepeEditor() {
  const { setCurrentSection, currentSection, doc, addSection, deleteSection } =
    useContentEditor();

  const sectionCount = useYArrayLength(doc.getArray<SectionType>('root'));

  return (
    <div className="flex h-full flex-col">
      <nav className="bg-muted/40 flex items-center gap-2 border-b p-2">
        <Button
          size="sm"
          variant={currentSection === -1 ? 'default' : 'ghost'}
          onClick={() => setCurrentSection(-1)}
        >
          Overview
        </Button>
        <div className="bg-border mx-2 h-6 w-px" />
        <div className="flex gap-1 overflow-x-auto">
          {Array.from({ length: sectionCount }, (_, i) => i).map((i) => (
            <Button
              key={i}
              size="sm"
              variant={i === currentSection ? 'default' : 'ghost'}
              onClick={() => setCurrentSection(i)}
            >
              Section {i + 1}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={addSection}>
            + Add
          </Button>
        </div>
        <div className="flex-1" />
        {currentSection >= 0 && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteSection(currentSection)}
          >
            Delete
          </Button>
        )}
      </nav>
      <div className="flex-1 overflow-auto">
        {currentSection === -1 ? (
          <EditorCourseDisplay />
        ) : (
          <MilkdownProvider>
            <CrepeEditorInternal />
          </MilkdownProvider>
        )}
      </div>
    </div>
  );
}
