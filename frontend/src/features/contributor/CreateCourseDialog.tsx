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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/ui/tag-input';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORY_OPTIONS } from '@/features/preference/constants';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import type { Team } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { Dispatch, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type CreateCourseDialogProps = {
  team: Team;
  isOpen: boolean;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
};

const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must not exceed 1000 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z
    .array(z.string().max(50, 'Tag must not exceed 50 characters'))
    .min(1, 'At least 1 tag is required')
    .max(8, 'Maximum 8 tags allowed'),
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
    reset,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      category: CATEGORY_OPTIONS[0],
      tags: [],
    },
  });

  const { mutateAsync: createCourse } = useApiMutation(
    'post',
    '/api/courses/',
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/teams/{teamId}/courses', {
            params: { path: { teamId: team.id } },
          }).queryKey,
        });

        reset();
        toast.success('Course created');
        setDialogOpen(false);
      },
      onError: (error: any) => {
        setError('root', {
          type: 'custom',
          message:
            error?.message ?? 'Failed to create course. Please try again.',
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
          category: data.category,
          teamId: team.id,
          tags: data.tags,
        },
      });
    } catch {
      // Error handled by onError callback above
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset();
    setDialogOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-lg">
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Course Setup
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Create New Course
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Create a course for this team workspace.
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
              name="category"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category">Category</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="category"
                      className="h-10 border-slate-300 focus-visible:border-slate-400 focus-visible:ring-0"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    Description
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

          <FieldGroup>
            <Controller
              control={control}
              name="tags"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tags">Tags</FieldLabel>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add tags... (max 8)"
                    className="border-slate-300"
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
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
