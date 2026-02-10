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
    <>
      <div>
        <Button onClick={addSection}>Add Section</Button>
        <Button onClick={() => setCurrentSection(-1)}>Home page</Button>
        {Array.from({ length: sectionCount }, (_, i) => i).map((i) => (
          <Button
            key={i}
            variant={i === currentSection ? 'default' : 'outline'}
            onClick={() => setCurrentSection(i)}
          >
            Section {i}
          </Button>
        ))}
        <Button
          variant="destructive"
          onClick={() => deleteSection(currentSection)}
        >
          Delete Current Section
        </Button>
      </div>
      {currentSection === -1 ? (
        <EditorCourseDisplay />
      ) : (
        <MilkdownProvider>
          <CrepeEditorInternal />
        </MilkdownProvider>
      )}
    </>
  );
}
