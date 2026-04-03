import { Button } from '@/components/ui';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import UploadImageDialog from './UploadImageDialog';

type NoImageYetProps = {
  courseId: string;
};

export default function NoImageYet({ courseId }: NoImageYetProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <PhotoIcon className="h-12 w-12 text-slate-400" aria-hidden="true" />
        <h3 className="mt-4 text-sm font-semibold text-slate-900">
          No course image yet
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Add a thumbnail to make your course stand out
        </p>
        <div className="mt-6">
          <Button
            type="button"
            className="bg-sky-500 text-white hover:bg-sky-600"
            onClick={() => setIsDialogOpen(true)}
          >
            Add Image
          </Button>
        </div>
      </div>

      <UploadImageDialog
        isOpen={isDialogOpen}
        setDialogOpen={setIsDialogOpen}
        courseId={courseId}
      />
    </>
  );
}
