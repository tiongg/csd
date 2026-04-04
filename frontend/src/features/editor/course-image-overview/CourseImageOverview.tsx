import { useContentEditor } from '@/context/ContentEditorContext';
import { apiQueryOptions, useApiQuery } from '@/lib/fetch-client';
import { deleteCourseImage } from '@/lib/file-upload';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NoImageYet from './NoImageYet';

type ImagePreviewProps = {
  setError: (hasError: boolean) => void;
  imageUrl?: string;
  courseId: string;
  className?: string;
  imageClassName?: string;
};

function ImagePreview({
  imageUrl,
  setError,
  courseId,
  className,
  imageClassName,
}: ImagePreviewProps) {
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
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50',
        className,
      )}
    >
      <img
        src={`${imageUrl}?t=${new Date().getTime()}`}
        alt="Course thumbnail"
        className={cn(
          'max-h-96 w-full rounded-lg object-cover',
          imageClassName,
        )}
        onError={() => setError(true)}
      />
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-2 right-2 rounded-full bg-rose-500 p-2 text-white shadow-md transition-colors hover:bg-rose-600"
        aria-label="Delete image"
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  );
}

type CourseImageOverviewProps = {
  className?: string;
  imageClassName?: string;
};

export default function CourseImageOverview({
  className,
  imageClassName,
}: CourseImageOverviewProps) {
  const { course } = useContentEditor();
  const [hasError, setHasError] = useState(false);

  // Fetch the latest course data to get the imageUrl
  const { data: courseData } = useApiQuery('get', '/api/courses/{id}', {
    params: { path: { id: course.id } },
  });

  const imageUrl = courseData?.imageUrl;

  if (hasError || !imageUrl) {
    return <NoImageYet courseId={course.id} className={className} />;
  }

  return (
    <ImagePreview
      imageUrl={imageUrl}
      setError={setHasError}
      courseId={course.id}
      className={className}
      imageClassName={imageClassName}
    />
  );
}
