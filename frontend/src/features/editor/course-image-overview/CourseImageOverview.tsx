import { useContentEditor } from '@/context/ContentEditorContext';
import { apiQueryOptions, useApiQuery } from '@/lib/fetch-client';
import { deleteCourseImage } from '@/lib/file-upload';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
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
        className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900"
        aria-label="Delete image"
      >
        <X className="size-3.5" />
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
