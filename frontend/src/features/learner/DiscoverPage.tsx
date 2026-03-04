import Autoplay from 'embla-carousel-autoplay';
import { useInView } from 'react-intersection-observer';
import { useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Heading1, Heading3 } from '@/components/ui/typography';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

type ReelOverlayProps = PropsWithChildren<{
  course: string;
  description?: string;
}>;

function ReelOverlay({ course, description, children }: ReelOverlayProps) {
  const { user } = useAuth();

  return (
    <div className="relative h-[calc(100vh-16rem)] w-full border-2 border-slate-300">
      <div className="absolute z-10 h-full w-full">
        <div className="flex flex-col items-center bg-linear-to-b from-slate-500 to-transparent py-4">
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

export default function DiscoverPage() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Discover</Heading1>
        <p className="font-subtitle">Take a look at what our courses offer!</p>
      </div>

      <Carousel
        className="h-full w-full"
        plugins={[
          Autoplay({
            delay: 8000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          <CarouselItem>
            <ReelOverlay course="skibidi" description="skibidi toilet">
              <ReelPlayer src="/skibidi_toilet.mp4" />
            </ReelOverlay>
          </CarouselItem>

          <CarouselItem>
            <ReelOverlay course="skibidi" description="skibidi toilet">
              <ReelPlayer src="/skibidi_toilet.mp4" />
            </ReelOverlay>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
