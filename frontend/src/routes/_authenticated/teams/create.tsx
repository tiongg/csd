import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useApiMutation } from '@/lib/fetch-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

export const Route = createFileRoute('/_authenticated/teams/create')({
  component: CreateTeamPage,
});

const teamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

function CreateTeamPage() {
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { mutateAsync: createTeam } = useApiMutation('post', '/api/teams', {
    onSuccess: (data) => {
      navigate({ to: '/teams/$teamId', params: { teamId: data.id } });
    },
  });

  async function onSubmit(data: TeamFormValues) {
    try {
      await createTeam({
        body: {
          name: data.name,
          description: data.description,
        },
      });
    } catch (error) {
      setError('root', {
        type: 'custom',
        message: 'Failed to create team',
      });
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Team</h1>
        <p className="text-muted-foreground mt-1">
          Start collaborating with others on courses
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Team Name</FieldLabel>
                <Input
                  {...field}
                  id="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g., Marketing Team"
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
                  placeholder="What is this team about?"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {errors.root && (
          <div className="text-destructive text-sm">{errors.root.message}</div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/teams' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}