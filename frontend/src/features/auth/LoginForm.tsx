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
import { constructAuthUrl } from '@/lib/auth-urls';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
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
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Login</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Welcome back! Please enter your credentials to log in.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Controller
            control={control}
            name="usernameOrEmail"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email-or-username">
                  Email/Username
                </FieldLabel>
                <Input
                  {...field}
                  id="email-or-username"
                  aria-invalid={fieldState.invalid}
                  placeholder="your@email.com"
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
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  aria-invalid={fieldState.invalid}
                  placeholder="••••••••"
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <Separator />

      <Button variant="outline" className="w-full" asChild>
        <a href={constructAuthUrl('google')}>Login with Google</a>
      </Button>

      <Separator />

      <div className="text-muted-foreground text-center text-sm">
        Don't have an account?{' '}
        <a href="/register" className="text-primary hover:underline">
          Register here
        </a>
      </div>
    </div>
  );
}
