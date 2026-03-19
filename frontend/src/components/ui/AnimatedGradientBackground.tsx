import { cn } from '@/lib/utils';

type AnimatedGradientBackgroundProps = {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'vibrant';
  speed?: 'slow' | 'medium' | 'fast';
}

export default function AnimatedGradientBackground({
  className,
  intensity = 'medium',
  speed = 'slow',
}: AnimatedGradientBackgroundProps) {
  const gradientConfig = {
    subtle: {
      from: '#f8fafc',
      via: '#e0f2fe',
      to: '#f1f5f9',
      opacity: '0.6',
    },
    medium: {
      from: '#dbeafe',
      via: '#bfdbfe',
      to: '#e0e7ff',
      opacity: '0.7',
    },
    vibrant: {
      from: '#818cf8',
      via: '#c084fc',
      to: '#93c5fd',
      opacity: '0.8',
    },
  };

  const speedConfig = {
    slow: '15s',
    medium: '10s',
    fast: '6s',
  };

  const config = gradientConfig[intensity];
  const animationDuration = speedConfig[speed];

  return (
    <div
      className={cn('fixed inset-0 -z-50 pointer-events-none', className)}
      style={{
        background: `linear-gradient(-45deg, ${config.from}, ${config.via}, ${config.to})`,
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${animationDuration} infinite ease-in-out alternate,
            30% 20% ${config.to} 0%,
            70% 80% ${config.via} 50%,
            30% 20% ${config.from} 100%
          )`,
          opacity: config.opacity,
        }}
      />

      {/* Flowing gradient orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          animation: `float ${animationDuration} ease-in-out infinite`,
        }}
      >
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${config.from} 0%, ${config.to} 100%)`,
            opacity: '0.3',
            animation: `float-slow ${animationDuration} ease-in-out infinite`,
            left: '10%',
            top: '10%',
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${config.to} 0%, ${config.from} 100%)`,
            opacity: '0.2',
            animation: `float ${animationDuration} ease-in-out infinite reverse`,
            right: '20%',
            bottom: '20%',
            animationDelay: '5s',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${config.via} 0%, ${config.to} 100%)`,
            opacity: '0.25',
            animation: `float-slow ${animationDuration} ease-in-out infinite`,
            left: '60%',
            top: '60%',
            animationDelay: '10s',
          }}
        />
      </div>

      {/* Subtle animated border glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(45deg, transparent 40%, ${config.from} 50%, transparent 60%)`,
          opacity: '0.1',
          animation: `shimmer ${animationDuration} ease-in-out infinite`,
        }}
      />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(15px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
}
