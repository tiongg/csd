import { useContentEditor } from '@/context/ContentEditorContext';
import useCrepeEditor from '@/hooks/useCrepeEditor';
import { collabServiceCtx } from '@milkdown/plugin-collab';
import { Milkdown, MilkdownProvider } from '@milkdown/react';
import { useEffect } from 'react';
import * as Y from 'yjs';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

function MarkdownEditorInternal() {
  const {
    doc,
    provider,
    currentSection,
    course: { id },
  } = useContentEditor();
  const { get: getEditor } = useCrepeEditor({
    courseId: id,
  });

  useEffect(() => {
    const editorInstance = getEditor();
    if (!editorInstance) return;

    editorInstance.action((ctx) => {
      try {
        const collabService = ctx.get(collabServiceCtx);
        collabService?.disconnect();

        // Assert doc structure, if null, it will automatically create it
        const section = doc.getArray('root').get(currentSection)!;
        if (section.get('type') !== 'markdown') {
          return;
        }

        collabService
          .bindXmlFragment(section.get('content')! as Y.XmlFragment)
          .setAwareness(provider.awareness)
          .connect();
      } catch {
        // collabServiceCtx not ready yet, will retry on next render
      }
    });
  }, [getEditor, doc, provider, currentSection]);

  return (
    <div className="p-8">
      <Milkdown />
    </div>
  );
}

export default function MarkdownEditor() {
  return (
    <MilkdownProvider>
      <MarkdownEditorInternal />
    </MilkdownProvider>
  );
}
