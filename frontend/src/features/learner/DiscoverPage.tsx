import { useInView } from 'react-intersection-observer';
import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Heading1, Heading3 } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';

type ReelOverlayProps = PropsWithChildren<{
  course: string;
  description?: string;
}>;

function ReelOverlay({ course, description, children, onClick }: ReelOverlayProps & { onClick?: () => void }) {
  const { user } = useAuth();

  return (
    <div className="relative h-[calc(100vh-16rem)] w-full border-2 border-slate-300 group cursor-pointer" onClick={onClick}>
      <div className="absolute z-10 h-full w-full">
        <div className="flex flex-col items-center bg-linear-to-b from-slate-500/80 to-transparent py-4">
          <Button className="mb-4" size="lg">
            View Course
          </Button>
          <Heading3>{course}</Heading3>
          <p className="font-subtitle">{description}</p>
        </div>

        <div className="absolute right-4 bottom-4 text-slate-300">
          @{user?.username}
        </div>
      </div>

      <div className="absolute h-full w-full">{children}</div>
    </div>
  );
}

function ReelPlayer({ src }: { src: string }) {
  const { ref, inView } = useInView();
  const vidRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!vidRef.current) {
      return;
    }
    if (inView) {
      vidRef.current.play();
    } else {
      vidRef.current.pause();
    }
  }, [inView, vidRef]);

  return (
    <div className="flex h-full w-full items-center justify-center" ref={ref}>
      {!hasError ? (
        <video
          loop
          muted
          className="max-h-full max-w-full"
          aria-label="Course preview video"
          ref={vidRef}
          onError={() => {
            setHasError(true);
          }}
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : (
        <ReelError />
      )}
    </div>
  );
}

function ReelError() {
  return (
    <div className="text-slate-500 italic">
      Reel could not be played. Please check your connection.
    </div>
  );
}

type CourseCardProps = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
};

function CourseCard({ id, title, description }: CourseCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({
      to: '/learner/courses/$courseId',
      params: { courseId: id },
    });
  };

  return (
    <ReelOverlay
      course={title}
      description={description ?? 'No description'}
      onClick={handleClick}
    >
      <ReelPlayer src="/course-preview-placeholder.mp4" />
    </ReelOverlay>
  );
}

export default function DiscoverPage() {
  const { data: courses } = useApiQuery('get', '/api/courses/', {});

  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Discover</Heading1>
        <p className="font-subtitle">Take a look at what our courses offer!</p>
      </div>

      {(courses ?? []).length === 0 ? (
        <div className="flex h-64 w-full items-center justify-center text-slate-500">
          <div className="text-center">
            <p className="text-lg font-semibold">No courses available</p>
            <p className="text-sm">Check back later for new content!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(courses ?? []).map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description ?? null}
              createdAt={course.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}