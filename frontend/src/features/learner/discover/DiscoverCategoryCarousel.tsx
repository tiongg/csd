import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
  if (courses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <Carousel opts={{ align: 'start' }} className="w-full">
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
        <CarouselPrevious className="top-[-2.7rem] left-auto right-10 size-7 border-slate-300 bg-white text-slate-700 hover:bg-slate-100" />
        <CarouselNext className="top-[-2.7rem] right-0 size-7 border-slate-300 bg-white text-slate-700 hover:bg-slate-100" />
      </Carousel>
    </section>
  );
}
