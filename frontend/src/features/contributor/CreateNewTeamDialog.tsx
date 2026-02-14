import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

type AddNewTeamDialogProps = {
  isOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
};

const teamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function CreateNewTeamDialog({
  isOpen,
  setDialogOpen,
}: AddNewTeamDialogProps) {
  const queryClient = useQueryClient();

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

  const { mutateAsync: createTeam } = useApiMutation('post', '/api/teams/', {
    onSuccess: async () => {
      // Invalidate teams list query to refresh the data
      await queryClient.invalidateQueries({
        queryKey: apiQueryOptions('get', '/api/teams/').queryKey,
      });
      setDialogOpen(false);
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
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Team</DialogTitle>
          <DialogDescription>
            Start collaborating with others on courses
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="What is this team about?"
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
            <div className="text-destructive text-sm">
              {errors.root.message}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
