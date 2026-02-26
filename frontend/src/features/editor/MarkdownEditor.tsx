import { useContentEditor } from '@/context/ContentEditorContext';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect } from 'react';
import * as Y from 'yjs';
import { youtubeIframePlugin } from './plugins/youtube.milkdown.plugin';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import './editor.css';

export function useCrepeEditor() {
  return useEditor((root) => {
    const crepe = new Crepe({
      root,
      features: {
        [CrepeFeature.ImageBlock]: true,
      },
      featureConfigs: {
        [CrepeFeature.ImageBlock]: {
          onUpload: async (file: File) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
          },
        },
      },
    });

    return crepe.editor.use(collab).use(youtubeIframePlugin);
  });
}

function MarkdownEditorInternal() {
  const { get: getEditor } = useCrepeEditor();
  const { doc, provider, currentSection } = useContentEditor();

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
    <div className="px-2">
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
