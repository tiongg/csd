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
import { uploadProfilePicture } from '@/lib/file-upload';
import { capitalizeFirst, cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

export default function UpdateProfileForm() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setProfilePictureUrl(user.profilePictureUrl ?? null);
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

  if (!user) return null;

  const onSubmit = async (data: UpdateFormValues) => {
    await updateAccount({ body: data });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a PNG or JPEG image');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const publicUrl = await uploadProfilePicture(file);

      // Update account with new profile picture URL
      await updateAccount({
        body: { profilePictureUrl: publicUrl },
      });

      setProfilePictureUrl(publicUrl);
      setPreviewUrl(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload image',
      );
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
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
      setProfilePictureUrl(null);
      toast.success('Profile picture removed!');
    } catch (error) {
      toast.error('Failed to remove profile picture');
    }
  };

  const displayImageUrl = previewUrl ?? profilePictureUrl;

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {/* Profile Header Card */}
      <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
          <div className="relative">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt="Profile avatar"
                className={cn(
                  'border-muted bg-muted h-20 w-20 rounded-full border-2 object-cover',
                  isUploading && 'opacity-50',
                )}
              />
            ) : (
              <div className="border-muted bg-muted flex h-20 w-20 items-center justify-center rounded-full border-2">
                <User className="text-muted-foreground h-10 w-10" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold">{user.username}</h2>
            <p className="text-muted-foreground">
              {capitalizeFirst(user.role)}
            </p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
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
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
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
              variant="ghost"
              size="sm"
              onClick={handleRemovePicture}
              disabled={isUploading}
            >
              Remove picture
            </Button>
          )}
        </div>
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
