import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useApiMutation, useApiQuery } from '@/lib/fetch-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const Route = createFileRoute('/_authenticated/courses/$courseId')({
  component: CourseDetailPage,
});

const courseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().optional(),
  teamId: z.string().optional(),
  isPublished: z.boolean(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: course, isLoading, refetch } = useApiQuery(
    'get',
    '/api/courses/{id}',
    {
      params: { path: { id: courseId } },
    }
  );

  const { data: teams } = useApiQuery('get', '/api/teams', {});

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
      teamId: '',
      isPublished: false,
    },
  });

  // Update form when course data loads
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description || '',
        teamId: course.teamId || '',
        isPublished: course.isPublished,
      });
    }
  }, [course, reset]);

  const { mutateAsync: updateCourse } = useApiMutation(
    'put',
    '/api/courses/{id}',
    {
      onSuccess: () => refetch(),
    }
  );

  const { mutateAsync: deleteCourse } = useApiMutation(
    'delete',
    '/api/courses/{id}',
    {
      onSuccess: () => navigate({ to: '/courses' }),
    }
  );

  async function onSubmit(data: CourseFormValues) {
    try {
      await updateCourse({
        params: { path: { id: courseId } },
        body: {
          title: data.title,
          description: data.description,
          teamId: data.teamId || undefined,
          isPublished: data.isPublished,
        },
      });
    } catch (error) {
      setError('root', {
        type: 'custom',
        message: 'Failed to update course',
      });
    }
  }

  async function handleDeleteCourse() {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteCourse({ params: { path: { id: courseId } } });
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Course not found</div>
      </div>
    );
  }

  const isCreator = course.creatorId === user?.id;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">
            {isCreator ? 'Edit your course' : 'View course details'}
          </p>
        </div>
        {isCreator && (
          <Button variant="destructive" size="sm" onClick={handleDeleteCourse}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {/* Edit Form (only for creator) */}
      {isCreator ? (
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
                  <FieldLabel htmlFor="description">Description</FieldLabel>
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
                  <FieldLabel htmlFor="teamId">Team</FieldLabel>
                  <select
                    {...field}
                    id="teamId"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  >
                    <option value="">No team (Personal course)</option>
                    {teams?.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
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
              name="isPublished"
              render={({ field }) => (
                <Field>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <FieldLabel htmlFor="isPublished" className="mb-0">
                      Publish course (make it visible to others)
                    </FieldLabel>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>

          {errors.root && (
            <div className="text-destructive text-sm">
              {errors.root.message}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/courses' })}
            >
              Back to Courses
            </Button>
          </div>
        </form>
      ) : (
        // Read-only view for non-creators
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {course.description || 'No description provided'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Status</h3>
            <span
              className={`text-xs px-2 py-1 rounded ${
                course.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {course.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <Button onClick={() => navigate({ to: '/courses' })}>
            Back to Courses
          </Button>
        </div>
      )}
    </div>
  );
}