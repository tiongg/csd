import { youtubeIframePlugin } from '@/features/editor/plugins/youtube.milkdown.plugin';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import { collab } from '@milkdown/plugin-collab';
import { useEditor } from '@milkdown/react';
import { toast } from 'sonner';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function useCrepeEditor() {
  return useEditor((root) => {
    const crepe = new Crepe({
      root,
      featureConfigs: {
        [CrepeFeature.ImageBlock]: {
          onUpload: async (file: File) => {
            if (file.size > MAX_SIZE_BYTES) {
              toast.error(`File size exceeds ${MAX_SIZE_MB} MB limit`);
              throw new Error(`File size exceeds ${MAX_SIZE_MB} MB limit`);
            }

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
