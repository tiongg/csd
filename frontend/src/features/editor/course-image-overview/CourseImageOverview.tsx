import { useContentEditor } from '@/context/ContentEditorContext';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { apiQueryOptions, useApiQuery } from '@/lib/fetch-client';
import { deleteCourseImage } from '@/lib/file-upload';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import NoImageYet from './NoImageYet';

type ImagePreviewProps = {
  setError: (hasError: boolean) => void;
  imageUrl?: string;
  courseId: string;
};

function ImagePreview({ imageUrl, setError, courseId }: ImagePreviewProps) {
  const queryClient = useQueryClient();

  async function handleDelete() {
    try {
      await deleteCourseImage(courseId);
      await queryClient.invalidateQueries({
        queryKey: apiQueryOptions('get', '/api/courses/{id}', {
          params: { path: { id: courseId } },
        }).queryKey,
      });
      toast.success('Image deleted successfully');
    } catch {
      toast.error('Failed to delete image');
    }
  }

  return (
    <div className="relative">
      <img
        src={`${imageUrl}?t=${new Date().getTime()}`}
        alt="Course thumbnail"
        className="max-h-96 w-full rounded-lg object-cover"
        onError={() => setError(true)}
      />
      <button
        type="button"
        onClick={handleDelete}
        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-md transition-colors hover:bg-red-600"
        aria-label="Delete image"
      >
        <XCircleIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

export default function CourseImageOverview() {
  const { course } = useContentEditor();
  const [hasError, setHasError] = useState(false);

  // Fetch the latest course data to get the imageUrl
  const { data: courseData } = useApiQuery('get', '/api/courses/{id}', {
    params: { path: { id: course.id } },
  });

  const imageUrl = courseData?.imageUrl;

  if (hasError || !imageUrl) {
    return <NoImageYet courseId={course.id} />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Course Image</h3>
      <ImagePreview
        imageUrl={imageUrl}
        setError={setHasError}
        courseId={course.id}
      />
    </div>
  );
}
