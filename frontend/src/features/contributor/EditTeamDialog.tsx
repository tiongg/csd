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
import type { Team } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useRef } from 'react';

type EditTeamDialogProps = {
  isOpen: boolean;
  setDialogOpen: (isOpen: boolean) => void;
  team: Team;
};

const teamSchema = z.object({
  name: z.string().min(3, 'Team name must be at least 3 characters'),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function EditTeamDialog({
  isOpen,
  setDialogOpen,
  team,
}: EditTeamDialogProps) {
  const queryClient = useQueryClient();
  const teamNameInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset,
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team.name,
      description: team.description ?? '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: team.name,
        description: team.description ?? '',
      });
    }
  }, [isOpen, team, reset]);

  const { mutateAsync: updateTeam } = useApiMutation('put', '/api/teams/{teamId}', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: apiQueryOptions('get', '/api/teams/').queryKey,
      });
      await queryClient.invalidateQueries({
        queryKey: apiQueryOptions('get', '/api/teams/{teamId}', {
          params: {
            path: { teamId: team.id },
          },
        }).queryKey,
      });
      setDialogOpen(false);
    },
  });

  async function onSubmit(data: TeamFormValues) {
    try {
      await updateTeam({
        params: {
          path: { teamId: team.id },
        },
        body: {
          name: data.name,
          description: data.description,
        },
      });
    } catch (error) {
      setError('root', {
        type: 'custom',
        message: 'Failed to update team',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setDialogOpen}>
      <DialogContent
        className="sm:max-w-lg rounded-xl border-slate-200 p-5"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const input = teamNameInputRef.current;
          if (!input) {
            return;
          }

          input.focus();
          const caretPosition = input.value.length;
          input.setSelectionRange(caretPosition, caretPosition);
        }}
      >
        <DialogHeader>
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-700 uppercase">
            Team Settings
          </p>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Edit Team
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Update your team name and description.
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
                    ref={(element) => {
                      field.ref(element);
                      teamNameInputRef.current = element;
                    }}
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
