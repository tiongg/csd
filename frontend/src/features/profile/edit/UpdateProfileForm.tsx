import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { uploadProfilePicture } from '@/lib/file-upload';
import { capitalizeFirst, cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or fewer')
    .regex(
      /^[A-Za-z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores',
    ),
  realName: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be 50 characters or fewer')
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z ]+$/,
      'Name can only contain letters and spaces',
    ),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be 100 characters or fewer'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function UpdateProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    control,
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      realName: user?.realname ?? '',
    },
  });

  const {
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    setError: setPasswordError,
    control: passwordControl,
    reset: resetPasswordForm,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      username: user.username ?? '',
      realName: user.realname ?? '',
    });
    setProfilePictureUrl(user.profilePictureUrl ?? null);
  }, [user, reset]);

  const { mutateAsync: updateAccount } = useApiMutation('patch', '/api/account/', {});

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

  if (!user) return null;

  async function refreshAuthUser() {
    await queryClient.invalidateQueries({
      queryKey: apiQueryOptions('get', '/api/auth/me').queryKey,
    });
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateAccount({
        body: {
          username: data.username,
          realName: data.realName,
        },
      });
      await refreshAuthUser();
      toast.success('Profile updated!');
      reset({
        username: data.username,
        realName: data.realName,
      });
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to update account',
      });
    }
  };

  const onSubmitPassword = async (data: PasswordFormValues) => {
    try {
      await updateAccount({
        body: {
          password: data.newPassword.trim(),
        },
      });
      await refreshAuthUser();
      toast.success('Password updated!');
      resetPasswordForm({
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordDialogOpen(false);
    } catch (error) {
      setPasswordError('root', {
        message: error instanceof Error ? error.message : 'Failed to update password',
      });
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a PNG or JPEG image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const publicUrl = await uploadProfilePicture(file);
      await updateAccount({
        body: { profilePictureUrl: publicUrl },
      });
      await refreshAuthUser();
      setProfilePictureUrl(publicUrl);
      setPreviewUrl(null);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image',
      );
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePicture = async () => {
    try {
      await updateAccount({
        body: { profilePictureUrl: undefined },
      });
      await refreshAuthUser();
      setProfilePictureUrl(null);
      toast.success('Profile picture removed!');
    } catch (error) {
      toast.error('Failed to remove profile picture');
    }
  };

  const displayImageUrl = previewUrl ?? profilePictureUrl;
  const primaryButtonClassName =
    'h-11 rounded-lg bg-sky-600 px-5 text-white shadow-sm hover:bg-sky-700';
  const secondaryButtonClassName =
    'h-11 rounded-lg border border-slate-300 bg-white px-4 text-slate-700 shadow-xs hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900';
  const destructiveButtonClassName =
    'h-11 rounded-lg px-4 text-white shadow-sm';
  const dialogPrimaryButtonClassName =
    'h-9 rounded-lg bg-sky-600 text-white shadow-sm hover:bg-sky-700';
  const dialogSecondaryButtonClassName =
    'h-9 rounded-lg border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900';

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="relative">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt="Profile avatar"
                className={cn(
                  'h-28 w-28 rounded-full border-2 border-slate-200 bg-slate-100 object-cover',
                  isUploading && 'opacity-50',
                )}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100">
                <User className="h-12 w-12 text-slate-500" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {user.username}
            </h2>
            <p className="text-base text-slate-600">
              {capitalizeFirst(user.role)}
            </p>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="flex flex-wrap gap-3">
              {user.role === 'LEARNER' && (
                <p
                  className="cursor-pointer text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                  onClick={() => applyContributor({})}
                >
                  Apply to be contributor
                </p>
              )}
              <Link
                to="/preference"
                className="text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
              >
                Update learning preferences
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-5 bg-slate-200/90" />

        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={secondaryButtonClassName}
          >
            {isUploading
              ? 'Uploading...'
              : profilePictureUrl
                ? 'Change profile picture'
                : 'Add profile picture'}
          </Button>
          {profilePictureUrl && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemovePicture}
              disabled={isUploading}
              className={destructiveButtonClassName}
            >
              Remove picture
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
        <h3 className="mb-1 text-3xl font-semibold tracking-tight text-slate-900">
          Edit Profile
        </h3>
        <p className="mb-5 text-sm text-slate-600">
          Update your profile information
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              control={control}
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="username" className="text-sm text-slate-700">
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    id="username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Username"
                    className="h-11 rounded-lg border-slate-300 bg-white/90 text-slate-900 focus-visible:border-slate-400 focus-visible:ring-0"
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
              name="realName"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="realName" className="text-sm text-slate-700">
                    Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="realName"
                    aria-invalid={fieldState.invalid}
                    placeholder="Name"
                    className="h-11 rounded-lg border-slate-300 bg-white/90 text-slate-900 focus-visible:border-slate-400 focus-visible:ring-0"
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
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={(open) => {
                setPasswordDialogOpen(open);
                if (!open) {
                  resetPasswordForm({
                    newPassword: '',
                    confirmPassword: '',
                  });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={secondaryButtonClassName}
                >
                  Change password
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl text-slate-900">
                    Change Password
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Enter and confirm your new password.
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handlePasswordSubmit(onSubmitPassword)}
                  className="space-y-3"
                >
                  <FieldGroup>
                    <Controller
                      control={passwordControl}
                      name="newPassword"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="newPassword">
                            New Password
                          </FieldLabel>
                          <Input
                            {...field}
                            id="newPassword"
                            type="password"
                            aria-invalid={fieldState.invalid}
                            placeholder="New password"
                            className="h-10 rounded-lg border-slate-300 bg-white/90 focus-visible:border-slate-400 focus-visible:ring-0"
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
                      control={passwordControl}
                      name="confirmPassword"
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="confirmPassword">
                            Confirm New Password
                          </FieldLabel>
                          <Input
                            {...field}
                            id="confirmPassword"
                            type="password"
                            aria-invalid={fieldState.invalid}
                            placeholder="Confirm new password"
                            className="h-10 rounded-lg border-slate-300 bg-white/90 focus-visible:border-slate-400 focus-visible:ring-0"
                          />
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>

                  {passwordErrors.root && (
                    <div className="text-destructive text-sm">
                      {passwordErrors.root.message}
                    </div>
                  )}

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPasswordDialogOpen(false)}
                      className={dialogSecondaryButtonClassName}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPasswordSubmitting}
                      className={dialogPrimaryButtonClassName}
                    >
                      {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClassName}
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
