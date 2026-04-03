import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useContentEditor } from '@/context/ContentEditorContext';
import { apiQueryOptions } from '@/lib/fetch-client';
import { uploadCourseContent } from '@/lib/file-upload';
import type { Course } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useBoolean } from 'usehooks-ts';

type PublishCourseProps = {
  course: Course;
};

export default function PublishCourse({ course }: PublishCourseProps) {
  const { doc, getDocAsJson } = useContentEditor();
  const queryClient = useQueryClient();
  const {
    value: open,
    setFalse: closeDialog,
    setValue: setOpen,
  } = useBoolean(false);
  const [description, setDescription] = useState('');

  const sections = doc.getArray('root');
  const sectionCount = sections.length;

  const { mutateAsync: uploadContent, isPending: isPublishing } = useMutation({
    mutationFn: async (desc: string) => {
      const docContent = await getDocAsJson();
      return uploadCourseContent(docContent, course.id, desc);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        apiQueryOptions('get', '/api/content-versions/{courseId}', {
          params: {
            path: {
              courseId: course.id,
            },
          },
        }),
      );
    },
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    await uploadContent(description.trim());
    closeDialog();
    setDescription('');
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen || !isPublishing) {
      setOpen(newOpen);
      if (!newOpen) {
        setDescription('');
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={sectionCount === 0}
          className="gap-2 bg-sky-500 text-white transition duration-300 hover:bg-sky-600 active:scale-95"
        >
          <Send className="size-4" />
          Submit for Approval
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Submit Course for Approval</DialogTitle>
            <DialogDescription>
              Describe the changes made in this version. This will help
              reviewers understand what has been updated.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="resize-none"
              placeholder="E.g., Updated lesson 3 with new examples and fixed quiz questions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!description.trim() || isPublishing}
              className="gap-2"
            >
              {isPublishing ? (
                <>Submitting…</>
              ) : (
                <>
                  <Send className="size-4" />
                  Submit for Approval
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
