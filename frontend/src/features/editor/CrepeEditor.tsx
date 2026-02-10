import { Crepe } from '@milkdown/crepe';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { useEffect } from 'react';

function CrepeEditorInternal() {
  const { get: editor } = useEditor((root) => {
    const editor = new Crepe({ root }).editor.use(collab);

    return editor;
  });

  useEffect(() => {
    const editorInstance = editor();
    if (!editorInstance) return;

    const doc = new Y.Doc();
    const wsProvider = new WebsocketProvider(
      import.meta.env.VITE_WS_URL!,
      'roomname',
      doc,
    );
    wsProvider.awareness.setLocalStateField('user', {
      name: 'Anonymous',
      color: '#ffa500',
    });

    editorInstance.action((ctx) => {
      const collabService = ctx.get(collabServiceCtx);

      collabService
        // bind doc and awareness
        .bindDoc(doc)
        .setAwareness(wsProvider.awareness)
        // connect yjs with milkdown
        .connect();
    });
  }, [editor]);

  return <Milkdown />;
}

export default function CrepeEditor() {
  return (
    <MilkdownProvider>
      <CrepeEditorInternal />
    </MilkdownProvider>
  );
}
