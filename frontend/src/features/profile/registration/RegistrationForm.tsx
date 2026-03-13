import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { constructAuthUrl } from '@/lib/auth-urls';
import { useApiMutation } from '@/lib/fetch-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { z } from 'zod';

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
    <div className="w-full max-w-xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-slate-300/40 backdrop-blur-xl md:p-10">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <Heading1>Sign Up</Heading1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
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
            <div className="text-destructive text-sm">{errors.root.message}</div>
          )}

          <Button
            type="submit"
            className="mt-5 h-12 w-full text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mx-auto mt-1 flex w-8/10 justify-center">
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
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            className="h-13 w-auto px-8 text-base"
            asChild
          >
            <a href={constructAuthUrl('google')}>
              <FcGoogle className="size-5" />
              <span>Sign up with Google</span>
            </a>
          </Button>
        </div>

        <div className="pt-1 text-center font-[Noto_Sans] font-bold text-slate-700">
          Already have an account?{' '}
          <Link to="/login" className="underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
