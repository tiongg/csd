import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import { FcGoogle } from 'react-icons/fc';
import { Heading1 } from '@/components/ui/typography';
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

    <div className='h-full w-full flex flex-row-reverse'>
      <div className='h-full w-1/2 bg-slate-200'>
        {/* image here */}
      </div>
      <div className='h-full w-1/2 flex justify-center'>
        <div className='p-18 w-8/10 min-w-[500px] flex flex-col justify-between'>
          <div>
            <div className='flex justify-center'>
              <Heading1>Log in</Heading1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="py-8 space-y-4">
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
                        className='text-slate-700 h-12'
                        aria-label='Email or Username'
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
                        className='text-slate-700 h-12'
                        aria-label='Password'
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

              <Button type="submit" className="w-full my-4" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className='flex justify-center w-8/10 mx-auto'>
              <div className='w-1/6'>
                <Separator className='inline-block bg-slate-500' />
              </div>
              <p className='font-subtitle inline-block w-2/3 px-4 text-center'>
                Other log in options
              </p>
              <div className='w-1/6'>
                <Separator className='inline-block bg-slate-500' />
              </div>
            </div>
            <div className='flex justify-center'>
              <Button variant="outline" className="size-16 m-4" size="icon-lg" asChild>
                <a href={constructAuthUrl('google')}>
                  <FcGoogle className='size-8' />
                </a>
              </Button>
            </div>
          </div>

          <div className='font-[Noto_Sans] font-bold text-slate-700 text-center'>
            Don't have an account? <Link to="/register" className='underline'>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
