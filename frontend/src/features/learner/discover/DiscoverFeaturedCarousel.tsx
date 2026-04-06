import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { type DiscoverCourse } from './types';

type DiscoverFeaturedCarouselProps = {
  courses: DiscoverCourse[];
};

export function DiscoverFeaturedCarousel({
  courses,
}: DiscoverFeaturedCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-900">Featured</h2>
      <Carousel
        opts={{ loop: courses.length > 1 }}
        setApi={setCarouselApi}
        className="w-full"
      >
        <CarouselContent>
          {courses.map((course) => (
            <CarouselItem key={course.id} className="basis-full">
              <Link
                to="/learner/courses/$courseId"
                params={{ courseId: course.id }}
                className="group block overflow-hidden rounded-2xl border border-slate-300 bg-white"
              >
                <div className="grid min-h-[18rem] gap-0 md:grid-cols-[1.2fr_1fr]">
                  <div className="h-64 w-full overflow-hidden md:h-full">
                    {course.imageUrl ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium tracking-wide text-slate-500 uppercase">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="inline-flex w-fit rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Featured track
                      </p>
                      {course.category && (
                        <p className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {course.category}
                        </p>
                      )}
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-2xl leading-tight font-semibold text-slate-900">
                      {course.title}
                    </h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600">
                      {course.description || 'No description provided'}
                    </p>
                    {course.tags.length > 0 && (
                      <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                        {course.tags.slice(0, 4).map((tag) => (
                          <span
                            key={`${course.id}-${tag}`}
                            className="inline-flex max-w-[140px] items-center truncate rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700"
                          >
                            {tag}
                          </span>
                        ))}
                        {course.tags.length > 4 && (
                          <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                            +{course.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <p className="truncate pr-3 text-xs text-slate-500">
                        By {course.creatorLabel}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 underline-offset-4 group-hover:underline">
                        View
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {courses.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {courses.map((course, index) => (
            <button
              key={`featured-dot-${course.id}`}
              type="button"
              onClick={() => carouselApi?.scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'w-6 bg-sky-500'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to featured course ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
