import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import type { Team } from '@/lib/utils';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

/**
 * ROOT CAUSE (Issue 5):
 *
 * 1. The form was never reset after a successful submission. `useForm` exposes
 *    a `reset()` function — it was not destructured and therefore not called.
 *    After the dialog closed, re-opening it showed the previous values.
 *    Fix: destructure `reset` and call it inside onSuccess before closing.
 *
 * 2. The success toast message was correct in the prior version, but the
 *    form-level feedback (clearing fields + closing the dialog) was missing.
 *    Fix: `reset()` then `setDialogOpen(false)` in onSuccess.
 *
 * 3. Error feedback relied on `setError('root', ...)` which only appears if
 *    the JSX block for errors.root is rendered — it was, so that part was fine.
 *    No change needed there beyond the existing pattern.
 */

type CreateCourseDialogProps = {
  team: Team;
  isOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
};

const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CreateCourseDialog({
  team,
  isOpen,
  setDialogOpen,
}: CreateCourseDialogProps) {
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset, // ✅ Fix 1: destructure reset
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const { mutateAsync: createCourse } = useApiMutation(
    'post',
    '/api/courses/',
    {
      onSuccess: async () => {
        // ✅ Fix 2: invalidate courses list
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/teams/{teamId}/courses', {
            params: { path: { teamId: team.id } },
          }).queryKey,
        });

        // ✅ Fix 3: clear form fields so next open starts fresh
        reset();

        // ✅ Fix 4: explicit success feedback
        toast.success('Course submitted for approval', {
          description: 'Admins will review your course shortly.',
        });

        setDialogOpen(false);
      },
      onError: (error: any) => {
        setError('root', {
          type: 'custom',
          message: error?.message ?? 'Failed to create course. Please try again.',
        });
      },
    },
  );

  async function onSubmit(data: CourseFormValues) {
    try {
      await createCourse({
        body: {
          title: data.title,
          description: data.description,
          teamId: team.id,
        },
      });
    } catch {
      // Error handled by onError callback above
    }
  }

  // Also reset form when dialog is closed manually
  function handleOpenChange(open: boolean) {
    if (!open) reset();
    setDialogOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <div className="mb-3">
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground mt-1">
            Share your knowledge with your team
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                    className="resize-none"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {errors.root && (
            <div className="bg-destructive/10 border-destructive text-destructive rounded border p-3 text-sm">
              {errors.root.message}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit for Approval'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}