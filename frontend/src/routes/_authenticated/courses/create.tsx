import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/_authenticated/courses/create')({
  component: CreateCoursePage,
});

const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().optional(),
  teamId: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

function CreateCoursePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: teams } = useApiQuery('get', '/api/teams', {});

  // Filter teams to only show those where user is a member
  const userTeams = teams?.filter((team) =>
    team.members?.some((member) => member.accountId === user?.id)
  );

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      teamId: '',
    },
  });

  const { mutateAsync: createCourse } = useApiMutation('post', '/api/courses', {
    onSuccess: (data) => {
      navigate({ to: '/courses/$courseId', params: { courseId: data.id } });
    },
    onError: (error: any) => {
      setError('root', {
        type: 'custom',
        message: error?.message || 'Failed to create course',
      });
    },
  });

  async function onSubmit(data: CourseFormValues) {
    try {
      await createCourse({
        body: {
          title: data.title,
          description: data.description,
          teamId: data.teamId || undefined,
        },
      });
    } catch (error: any) {
      // Error handled by onError callback
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-1">
          Share your knowledge with the community
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
                <textarea
                  {...field}
                  id="description"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  placeholder="What will students learn in this course?"
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
            name="teamId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="teamId">Team (Optional)</FieldLabel>
                <select
                  {...field}
                  id="teamId"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  <option value="">No team (Personal course)</option>
                  {userTeams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Only teams you are a member of are shown
                </p>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {errors.root && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
            {errors.root.message}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/courses' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}