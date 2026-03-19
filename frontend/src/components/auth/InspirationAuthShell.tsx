import AnimatedGradientBackground from '@/components/ui/AnimatedGradientBackground';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface InspirationAuthShellProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  showInspiration?: boolean;
}

export default function InspirationAuthShell({
  children,
  className,
  title = 'Welcome to CSD',
  showInspiration = true,
}: InspirationAuthShellProps) {
  return (
    <>
      <AnimatedGradientBackground intensity="medium" speed="slow" />

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Floating inspirational elements */}
        {showInspiration && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Top-right corner glow */}
            <div
              className="absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
              style={{
                background: 'radial-gradient(circle, #818cf8 0%, #3b82f6 100%)',
                animation: 'pulse 8s ease-in-out infinite',
              }}
            />
            {/* Bottom-left corner glow */}
            <div
              className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full opacity-30 blur-2xl"
              style={{
                background: 'radial-gradient(circle, #c084fc 0%, #6366f1 100%)',
                animation: 'pulse 10s ease-in-out infinite reverse',
              }}
            />
            {/* Animated stars/sparkles */}
            <div
              className="absolute top-1/4 left-1/4 h-2 w-2 animate-pulse rounded-full bg-white/60 blur-sm"
              style={{ animationDelay: '2s' }}
            />
            <div
              className="absolute top-1/3 left-2/3 h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 blur-sm"
              style={{ animationDelay: '4s' }}
            />
            <div
              className="absolute top-2/3 right-1/4 h-2.5 w-2.5 animate-pulse rounded-full bg-white/40 blur-sm"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute top-1/2 right-1/3 h-1 w-1 animate-pulse rounded-full bg-white/30 blur-sm"
              style={{ animationDelay: '6s' }}
            />
            <div
              className="absolute right-1/3 bottom-1/4 h-1.5 w-1.5 animate-pulse rounded-full bg-white/50 blur-sm"
              style={{ animationDelay: '3s' }}
            />
            <div
              className="absolute bottom-1/3 left-1/4 h-2 w-2 animate-pulse rounded-full bg-white/40 blur-sm"
              style={{ animationDelay: '5s' }}
            />
          </div>
        )}

        {/* Main content card */}
        <div
          className={cn(
            'flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8',
            className,
          )}
        >
          <div className="relative w-full max-w-4xl">
            {/* Glassmorphism card */}
            <div
              className={cn(
                'relative overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-xl',
                className,
              )}
              style={{
                boxShadow: `
                  0 0 60px -30px rgba(129, 140, 248, 0.1),
                  0 0 100px -20px rgba(129, 140, 248, 0.05),
                  60px 0 30px rgba(129, 140, 248, 0.1),
                  60px 0 60px rgba(129, 140, 248, 0.05),
                  0 60px 0 rgba(129, 140, 248, 0.1),
                  0 0 60px rgba(129, 140, 248, 0.1),
                  0 0 100px rgba(129, 140, 248, 0.05)
                `,
              }}
            >
              {/* Top gradient bar */}
              <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-r from-transparent via-sky-400/50 to-transparent" />

              {/* Subtle inner glow */}
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-br from-sky-400/10 to-purple-400/10 opacity-20 blur-xl" />

              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10 md:p-12">
                {title && (
                  <div className="mb-8 text-center">
                    <h2 className="bg-linear-to-r from-sky-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                      {title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Start your journey of continuous learning and discovery
                    </p>
                  </div>
                )}
                {children}
              </div>

              {/* Bottom accent dots */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400/60" />
                <div className="h-1 w-1 rounded-full bg-sky-400/40" />
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS for additional animations */}
        <style>{`
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 0.4;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.05);
            }
          }
        `}</style>
      </div>
    </>
  );
}
