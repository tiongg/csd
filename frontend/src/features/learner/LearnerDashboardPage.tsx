import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import Autoplay from 'embla-carousel-autoplay';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import PersonalAnalytics from './dashboard/PersonalAnalytics';
import { TopTrendsTable } from './dashboard/TopTrendsTable';
import { TrendCourseSearchDialog } from './dashboard/TrendCourseSearchDialog';

type SuggestedCourse = {
  id?: string;
  title: string;
  subtitle: string;
  summary?: string;
  image: string;
  imagePosition?: string;
};

const SUGGESTED_PREVIEW_IMAGES = [
  {
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center center',
  },
  {
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center center',
  },
  {
    image:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center 40%',
  },
  {
    image:
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center center',
  },
];

const FALLBACK_SUGGESTED_COURSES: SuggestedCourse[] = [
  {
    title: 'Corecore and Emotional Montage Edits',
    subtitle: 'By Youth Signals Desk',
    summary:
      'Learn why emotionally layered montage edits are driving saves and rewatches.',
    image: SUGGESTED_PREVIEW_IMAGES[0]!.image,
    imagePosition: SUGGESTED_PREVIEW_IMAGES[0]!.imagePosition,
  },
  {
    title: 'Street Interview Vox-Pops and Fast Cuts',
    subtitle: 'By Platform Intelligence Team',
    summary:
      'Decode how quick-question hooks and jump-cut pacing improve hold rate.',
    image: SUGGESTED_PREVIEW_IMAGES[1]!.image,
    imagePosition: SUGGESTED_PREVIEW_IMAGES[1]!.imagePosition,
  },
  {
    title: 'Clean Girl to Office Siren Style Shift',
    subtitle: 'By Culture Research Unit',
    summary:
      'Map the shift from soft-minimal style signals to sharper identity cues.',
    image: SUGGESTED_PREVIEW_IMAGES[2]!.image,
    imagePosition: SUGGESTED_PREVIEW_IMAGES[2]!.imagePosition,
  },
  {
    title: 'Underconsumption Core and No-Buy Diaries',
    subtitle: 'By Strategy Applications Team',
    summary:
      'Translate anti-haul and mindful-spending narratives into practical choices.',
    image: SUGGESTED_PREVIEW_IMAGES[3]!.image,
    imagePosition: SUGGESTED_PREVIEW_IMAGES[3]!.imagePosition,
  },
];

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const autoplay = useRef(
    Autoplay({ delay: 3400, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [leftPaneWidth, setLeftPaneWidth] = useState(56);
  const [isResizing, setIsResizing] = useState(false);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  const { data: courses } = useApiQuery('get', '/api/courses/published');
  const publishedCourses = courses ?? [];
  const suggestedCourses = useMemo<SuggestedCourse[]>(() => {
    if (publishedCourses.length <= 0) {
      return FALLBACK_SUGGESTED_COURSES;
    }
    return publishedCourses.slice(0, 5).map((course, index) => {
      const previewImage =
        SUGGESTED_PREVIEW_IMAGES[index % SUGGESTED_PREVIEW_IMAGES.length]!;
      return {
        id: course.id,
        title: course.title,
        subtitle: `Updated ${dayjs(course.updatedAt).fromNow()}`,
        image: previewImage.image,
        imagePosition: previewImage.imagePosition,
      };
    });
  }, [publishedCourses]);

  useEffect(() => {
    if (!isResizing) return;

    const onMouseMove = (event: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((event.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(63, Math.max(45, pct));
      setLeftPaneWidth(clamped);
    };

    const onMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm ring-1 shadow-slate-900/5 ring-slate-200/60 md:p-8">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Learner Dashboard
          </div>
          <Heading1 className="mt-3 text-slate-900">
            Welcome back, {user?.username}.
          </Heading1>
          <p className="mt-2 max-w-4xl text-base leading-relaxed text-slate-600">
            Monitor key trend shifts and focus on what is most relevant today.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm ring-1 shadow-slate-900/5 ring-slate-200/60 md:p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              Discover Courses
            </p>
            <Button
              className="h-9 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700"
              asChild
            >
              <Link to="/learner/discover">Explore topics</Link>
            </Button>
          </div>

          {suggestedCourses.length > 0 ? (
            <Carousel
              opts={{ loop: true, align: 'start' }}
              plugins={[autoplay.current]}
              className="mt-3 w-full"
            >
              <CarouselContent>
                {suggestedCourses.map((course) => (
                  <CarouselItem
                    key={`${course.title}-${course.id ?? 'sample'}`}
                    className="basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    {course.id ? (
                      <Link
                        to="/learner/courses/$courseId"
                        params={{ courseId: course.id }}
                        className="block h-full overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100/70 transition-colors hover:border-sky-200"
                      >
                        <div className="h-56 w-full overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition:
                                course.imagePosition ?? 'center center',
                            }}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {course.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {course.subtitle}
                          </p>
                          {course.summary && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {course.summary}
                            </p>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <Link
                        to="/learner/discover"
                        className="block h-full overflow-hidden rounded-xl border border-slate-200/70 bg-slate-100/70 transition-colors hover:border-sky-200"
                      >
                        <div className="h-56 w-full overflow-hidden">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="h-full w-full object-cover"
                            style={{
                              objectPosition:
                                course.imagePosition ?? 'center center',
                            }}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {course.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {course.subtitle}
                          </p>
                          {course.summary && (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                              {course.summary}
                            </p>
                          )}
                        </div>
                      </Link>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          ) : (
            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
              No suggested courses yet.
            </div>
          )}
        </section>

        <div
          ref={splitContainerRef}
          className="flex flex-col gap-5 lg:flex-row lg:gap-0"
          style={{ '--left-pane': `${leftPaneWidth}%` } as CSSProperties}
        >
          <TopTrendsTable
            onTrendClick={(trendName) => {
              setTrendSearch(trendName);
              setIsTrendModalOpen(true);
            }}
          />

          <div className="hidden lg:flex lg:w-5 lg:items-center lg:justify-center">
            <button
              type="button"
              aria-label="Resize dashboard panels"
              className="h-20 w-1.5 cursor-col-resize rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
              onMouseDown={(event) => {
                event.preventDefault();
                setIsResizing(true);
              }}
            />
          </div>

          <PersonalAnalytics />
        </div>

        <TrendCourseSearchDialog
          initialSearchValue={trendSearch}
          open={isTrendModalOpen}
          onOpenChange={setIsTrendModalOpen}
        />
      </div>
    </div>
  );
}
