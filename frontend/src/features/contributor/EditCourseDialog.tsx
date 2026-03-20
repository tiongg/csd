import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import type { Course } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

type EditCourseDialogProps = {
  isOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  course: Course;
  teamId: string;
};

const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function EditCourseDialog({
  isOpen,
  setDialogOpen,
  course,
  teamId,
}: EditCourseDialogProps) {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course.title,
      description: course.description ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: course.title,
        description: course.description ?? '',
      });
    }
  }, [isOpen, course, reset]);

  const { mutateAsync: updateCourse } = useApiMutation(
    'put',
    '/api/courses/{id}',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/teams/{teamId}/courses', {
            params: { path: { teamId } },
          }).queryKey,
        });
        toast.success('Course updated');
        setDialogOpen(false);
      },
      onError: (error: any) => {
        setError('root', {
          type: 'custom',
          message:
            error?.message ?? 'Failed to update course. Please try again.',
        });
      },
    },
  );

  async function onSubmit(data: CourseFormValues) {
    try {
      await updateCourse({
        params: { path: { id: course.id } },
        body: {
          title: data.title,
          description: data.description,
        },
      });
    } catch {
      // Error handled by onError callback above
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-lg">
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Course Settings
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Edit Course
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Update your course title and description.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Course Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g., Introduction to Gen-Alpha Culture"
                    className="h-10 border-slate-300 focus-visible:border-slate-400 focus-visible:ring-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">
                    Description (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="What will students learn in this course?"
                    className="min-h-24 resize-none border-slate-300 focus-visible:border-slate-400 focus-visible:ring-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {errors.root && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errors.root.message}
            </div>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-slate-300"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
