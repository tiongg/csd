import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useApiMutation } from '@/lib/fetch-client';
import { Heading1, Heading4 } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { constructAuthUrl } from '@/lib/auth-urls';

const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegistrationForm() {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset: resetForm,
    control,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();

  const { mutateAsync: createAccount } = useApiMutation(
    'post',
    '/api/account/',
    {
      onError: (error) => {
        setError('root', {
          message: error.message || 'Failed to create account',
        });
      },
      onSuccess: () => {
        resetForm();
      },
    },
  );

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { confirmPassword, ...accountData } = data;

      await createAccount({
        body: accountData,
      });
    } catch (err) {
      return;
    }
    loginWithPassword(data.username, data.password);
    navigate({ to: '/' });
  };

  return (
    <div className="flex h-full w-full">
      <div className="h-full w-1/2 bg-slate-200">{/* image here */}</div>
      <div className="flex h-full w-1/2 justify-center">
        <div className="flex w-8/10 min-w-120 flex-col justify-between p-18">
          <div>
            <div className="flex justify-center">
              <Heading1>Sign Up</Heading1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-8">
              <FieldGroup>
                <Controller
                  control={control}
                  name="username"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        id="username"
                        aria-invalid={fieldState.invalid}
                        placeholder="Username"
                        className="h-12 text-slate-700"
                        aria-label="Username"
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
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        id="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="Email address"
                        className="h-12 text-slate-700"
                        aria-label="Email"
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
                  name="password"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="Password"
                        className="h-12 text-slate-700"
                        aria-label="Password"
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
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        id="confirmPassword"
                        type="password"
                        aria-invalid={fieldState.invalid}
                        placeholder="Confirm password"
                        className="h-12 text-slate-700"
                        aria-label="Confirm password"
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

              <Button
                type="submit"
                className="my-4 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <div className="mx-auto flex w-8/10 justify-center">
              <div className="w-1/6">
                <Separator className="inline-block bg-slate-500" />
              </div>
              <p className="font-subtitle inline-block w-2/3 px-4 text-center">
                Other sign up options
              </p>
              <div className="w-1/6">
                <Separator className="inline-block bg-slate-500" />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="m-4 size-16"
                size="icon-lg"
                asChild
              >
                <a href={constructAuthUrl('google')}>
                  <FcGoogle className="size-8" />
                </a>
              </Button>
            </div>
          </div>

          <div className="text-center font-[Noto_Sans] font-bold text-slate-700">
            Already have an account?{' '}
            <Link to="/login" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
