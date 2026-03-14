import AuthSplitShell from '@/components/auth/AuthSplitShell';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { constructAuthUrl } from '@/lib/auth-urls';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import z from 'zod';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { loginWithPassword } = useAuth();
  const navigate = useNavigate();

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset: resetForm,
    control,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormValues) {
    const success = await loginWithPassword(
      data.usernameOrEmail,
      data.password,
    );
    if (!success) {
      setError('root', { type: 'custom', message: 'Invalid credentials' });
    } else {
      navigate({ to: '/' });
      resetForm();
    }
  }

  return (
    <AuthSplitShell
      tags={['Gen-Alpha', 'Pro Learning', 'Insights']}
      title="Welcome back"
      description="Continue with concise, credible Gen-Alpha insights you can apply in real work."
      benefits={[
        {
          title: 'Insight Snapshot',
          description: 'Review the latest youth behavior patterns in minutes.',
          icon: 'insight',
        },
        {
          title: 'Action-Ready Guidance',
          description: 'Translate trends into classroom, team, or content decisions.',
          icon: 'strategy',
        },
        {
          title: 'Progress Continuity',
          description: 'Pick up from saved modules, notes, and completed lessons.',
          icon: 'progress',
        },
      ]}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <Heading1>Login</Heading1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FieldGroup>
            <Controller
              control={control}
              name="usernameOrEmail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="email-or-username"
                    aria-invalid={fieldState.invalid}
                    placeholder="Email or Username"
                    className="h-12 text-slate-700"
                    aria-label="Email or Username"
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

          {errors.root && (
            <div className="text-destructive text-sm">{errors.root.message}</div>
          )}

          <Button
            type="submit"
            className="mt-5 h-12 w-full text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mx-auto flex w-8/10 items-center justify-center">
          <div className="w-2/5">
            <Separator className="inline-block bg-slate-500" />
          </div>
          <p className="font-subtitle inline-block w-1/5 px-2 text-center">OR</p>
          <div className="w-2/5">
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
              <span>Sign in with Google</span>
            </a>
          </Button>
        </div>

        <div className="pt-1 text-center font-[Noto_Sans] font-bold text-slate-700">
          Don't have an account?{' '}
          <Link to="/register" className="underline">
            Sign up
          </Link>
        </div>
      </div>
    </AuthSplitShell>
  );
}
