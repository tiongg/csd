import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DiscoverCarouselCard } from './DiscoverCarouselCard';
import { type DiscoverCourse } from './types';

type DiscoverCategoryCarouselProps = {
  title: string;
  courses: DiscoverCourse[];
};

export function DiscoverCategoryCarousel({
  title,
  courses,
}: DiscoverCategoryCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSnap, setActiveSnap] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setActiveSnap(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  function goToNext() {
    if (!carouselApi || courses.length <= 1) {
      return;
    }
    const snapCount = carouselApi.scrollSnapList().length;
    if (activeSnap >= snapCount - 1) {
      carouselApi.scrollTo(0);
      return;
    }
    carouselApi.scrollNext();
  }

  function goToPrevious() {
    if (!carouselApi || courses.length <= 1) {
      return;
    }
    const snapCount = carouselApi.scrollSnapList().length;
    if (activeSnap <= 0) {
      carouselApi.scrollTo(Math.max(0, snapCount - 1));
      return;
    }
    carouselApi.scrollPrev();
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {courses.length > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={goToPrevious}
              className="inline-flex size-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100"
              aria-label={`Previous courses in ${title}`}
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex size-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100"
              aria-label={`Next courses in ${title}`}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}
      </div>
      <Carousel
        setApi={setCarouselApi}
        opts={{ align: 'start', slidesToScroll: 1, containScroll: 'trimSnaps' }}
        className="w-full"
      >
        <CarouselContent>
          {courses.map((course) => (
            <CarouselItem
              key={course.id}
              className="basis-[84%] sm:basis-1/2 lg:basis-1/2 xl:basis-1/2"
            >
              <DiscoverCarouselCard course={course} compact />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
