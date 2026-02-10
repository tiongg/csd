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
import { useY } from 'react-yjs';
import * as Y from 'yjs';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

function CrepeEditorInternal() {
  const { get: getEditor } = useEditor((root) => {
    return new Crepe({ root }).editor.use(collab);
  });
  const { doc, provider, currentSection, getDocAsJson } = useContentEditor();

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

  return (
    <>
      <Button
        onClick={() => {
          const markdown = getDocAsJson();
          console.log(markdown);
        }}
      >
        Get MD
      </Button>
      <Milkdown />
    </>
  );
}

function Counter() {
  const { doc } = useContentEditor();
  const count = useY(doc.getMap<number>('counter'));

  const increment = () => {
    doc.transact(() => {
      const counterMap = doc.getMap<number>('counter');
      const current = counterMap.get('count') ?? 0;
      counterMap.set('count', current + 1);
    });
  };

  const decrement = () => {
    doc.transact(() => {
      const counterMap = doc.getMap<number>('counter');
      const current = counterMap.get('count') ?? 0;
      counterMap.set('count', current - 1);
    });
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <Button onClick={decrement}>-</Button>
      <span>Count: {count['count']}</span>
      <Button onClick={increment}>+</Button>
    </div>
  );
}

export default function CrepeEditor() {
  const {
    setCurrentSection,
    currentSection,
    getDocAsJson,
    doc,
    addSection,
    deleteSection,
  } = useContentEditor();

  const sectionCount = useYArrayLength(doc.getArray<SectionType>('root'));

  return (
    <>
      {/* <Counter /> */}
      <div>
        <Button onClick={addSection}>Add Section</Button>
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
      {sectionCount === 0 ? (
        <p>No sections yet. Click "Add Section" to create one.</p>
      ) : (
        <MilkdownProvider>
          <CrepeEditorInternal />
        </MilkdownProvider>
      )}
    </>
  );
}
