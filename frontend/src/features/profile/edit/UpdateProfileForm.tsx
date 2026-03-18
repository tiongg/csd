import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import { capitalizeFirst } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const updateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

async function getGravatarUrl(email: string, size = 120) {
  const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedEmail = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `https://www.gravatar.com/avatar/${hashedEmail}?s=${size}&d=identicon`;
}

export default function UpdateProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [gravatarUrl, setGravatarUrl] = useState('');

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset,
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      username: user?.username ?? '',
    },
  });

  // Re-populate form if user data loads after mount (e.g. on page refresh)
  useEffect(() => {
    if (!user) return;
    reset({
      username: user.username ?? '',
    });
  }, [user, reset]);

  const { mutateAsync: updateAccount } = useApiMutation(
    'patch',
    '/api/account/',
    {
      onError: (error) => {
        setError('root', {
          message: error.message || 'Failed to update account',
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: apiQueryOptions('get', '/api/auth/me').queryKey,
        });
        toast.success('Profile updated!');
      },
    },
  );

  const { mutateAsync: applyContributor } = useApiMutation(
    'post',
    '/api/contributor/apply',
    {
      onError: (error) => {
        toast.error(error.message);
      },
      onSuccess: () => {
        toast.success('Request sent!');
      },
    },
  );

  useEffect(() => {
    if (!user?.email) return;
    getGravatarUrl(user.email).then((url) => setGravatarUrl(url));
  }, [user]);

  if (!user) return null;

  const onSubmit = async (data: UpdateFormValues) => {
    await updateAccount({ body: data });
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {/* Profile Header Card */}
      <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
          <div className="relative">
            <img
              src={gravatarUrl}
              alt="Profile avatar"
              className="border-muted bg-muted h-20 w-20 rounded-full border-2"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold">{user?.username}</h2>
            <p className="text-muted-foreground">
              {capitalizeFirst(user?.role)}
            </p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            {user.role === 'LEARNER' && (
              <p
                className="cursor-pointer text-sm underline"
                onClick={() => applyContributor({})}
              >
                Apply to be contributor
              </p>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        <a
          href="https://www.gravatar.com/profile/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 inline-flex items-center justify-center text-sm transition-colors"
        >
          Change profile picture on Gravatar &rarr;
        </a>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold">Edit Profile</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Update your profile information
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <FieldGroup>
            <Controller
              control={control}
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    {...field}
                    id="username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Username"
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

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                reset({
                  username: user.username ?? '',
                })
              }
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
