import { youtubeIframePlugin } from '@/features/editor/plugins/youtube.milkdown.plugin';
import { uploadFile } from '@/lib/file-upload';
import { Crepe, CrepeFeature } from '@milkdown/crepe';
import { collab } from '@milkdown/plugin-collab';
import { useEditor } from '@milkdown/react';
import { toast } from 'sonner';

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type UseCrepeEditorProps = {
  courseId?: string;
  readOnly?: boolean;
  defaultContent?: string;
};

export default function useCrepeEditor({
  courseId,
  readOnly = false,
  defaultContent = '',
}: UseCrepeEditorProps = {}) {
  return useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue: defaultContent,
      featureConfigs: {
        [CrepeFeature.ImageBlock]: {
          onUpload: async (file: File) => {
            if (!courseId) {
              toast.error('Course ID is required for image uploads');
              throw new Error('Course ID is required for image uploads');
            }

            if (file.size > MAX_SIZE_BYTES) {
              toast.error(`File size exceeds ${MAX_SIZE_MB} MB limit`);
              throw new Error(`File size exceeds ${MAX_SIZE_MB} MB limit`);
            }

            return uploadFile(file, courseId);
          },
        },
      },
    });

    crepe.setReadonly(readOnly);

    return crepe.editor.use(collab).use(youtubeIframePlugin);
  });
}
