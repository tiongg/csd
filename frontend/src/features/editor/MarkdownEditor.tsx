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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">Section Content</p>
          <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium tracking-wide text-slate-600 uppercase">
            Markdown
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Write and format your lesson content here.
        </p>
      </div>
      <div className="p-4 md:p-6">
        <Milkdown />
      </div>
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
