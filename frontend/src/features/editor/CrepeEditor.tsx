import { Button } from '@/components/ui/button';
import { useContentEditor } from '@/context/ContentEditorContext';
import { Crepe } from '@milkdown/crepe';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect } from 'react';
import { useY } from 'react-yjs';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

function CrepeEditorInternal() {
  const { get: getEditor } = useEditor((root) => {
    return new Crepe({ root }).editor.use(collab);
  });
  const { doc, provider } = useContentEditor();

  useEffect(() => {
    const editorInstance = getEditor();
    if (!editorInstance) return;

    editorInstance.action((ctx) => {
      try {
        const collabService = ctx.get(collabServiceCtx);
        collabService.bindDoc(doc).setAwareness(provider.awareness).connect();
      } catch {
        // collabServiceCtx not ready yet, will retry on next render
      }
    });
  }, [getEditor, doc, provider]);

  return <Milkdown />;
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
  const { doc, provider } = useContentEditor();

  return (
    <>
      <Counter />
      {doc && provider && (
        <MilkdownProvider>
          <CrepeEditorInternal />
        </MilkdownProvider>
      )}
    </>
  );
}
