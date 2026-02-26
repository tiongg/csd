import { youtubeIframePlugin } from '@/features/editor/plugins/youtube.milkdown.plugin';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import { collab } from '@milkdown/plugin-collab';
import { useEditor } from '@milkdown/react';

export default function useCrepeEditor() {
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
