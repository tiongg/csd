import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiQueryOptions } from '@/lib/fetch-client';
import { uploadCourseImage } from '@/lib/file-upload';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

type UploadImageDialogProps = {
  courseId: string;
  isOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
};

export default function UploadImageDialog({
  courseId,
  isOpen,
  setDialogOpen,
}: UploadImageDialogProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileSizeLimit = 5 * 1024 * 1024; // 5MB

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    setDialogOpen(open);
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a PNG, JPG, or JPEG image');
      return;
    }

    // Validate file size
    if (file.size > fileSizeLimit) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    try {
      await uploadCourseImage(selectedFile, courseId);

      await queryClient.invalidateQueries({
        queryKey: apiQueryOptions('get', '/api/courses/{id}', {
          params: { path: { id: courseId } },
        }).queryKey,
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Image uploaded successfully');
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload image. Please try again.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Upload Course Image
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Add a thumbnail image for your course. Supported formats: PNG, JPG,
            JPEG (max 5MB).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition-colors hover:bg-slate-50"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-48 max-w-full object-contain"
              />
            ) : (
              <>
                <PhotoIcon
                  className="h-12 w-12 text-slate-400"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm text-slate-600">
                  Click to select an image
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG, JPEG up to 5MB
                </p>
              </>
            )}
          </div>

          {selectedFile && (
            <p className="text-sm text-slate-600">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-slate-300"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-9 rounded-lg"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
