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
      <DialogContent className="sm:max-w-lg rounded-xl border-slate-200 p-5">
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Team Setup
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Create New Team
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Set up a team workspace to manage members and courses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    placeholder="What is this team about?"
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
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
