import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Heading1 } from '@/components/ui/typography';
import { useAuth } from '@/context/AuthContext';
import { Link } from '@tanstack/react-router';
import Autoplay from 'embla-carousel-autoplay';
import {
  useState,
  useRef,
} from 'react';
import PersonalAnalytics from './dashboard/PersonalAnalytics';
import { TopTrendsTable } from './dashboard/TopTrendsTable';
import { TrendCourseSearchDialog } from './dashboard/TrendCourseSearchDialog';

const IN_PROGRESS_PLACEHOLDERS = [
  {
    title: 'Corecore and Emotional Montage Edits',
    subtitle: 'By Youth Signals Desk',
    summary:
      'Learn why emotionally layered montage edits are driving saves and rewatches across global youth audiences.',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center center',
  },
  {
    title: 'Street Interview Vox-Pops and Fast Cuts',
    subtitle: 'By Platform Intelligence Team',
    summary:
      'Decode how quick question hooks and jump-cut pacing improve hold rate in public interview content.',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center center',
  },
  {
    title: 'Underconsumption Core and No-Buy Diaries',
    subtitle: 'By Strategy Applications Team',
    summary:
      'Translate anti-haul and mindful-spending content into practical messaging choices for teams and educators.',
    image:
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
    imagePosition: 'center center',
  },
];

export default function LearnerDashboardPage() {
  const { user } = useAuth();
  const autoplay = useRef(
    Autoplay({ delay: 3400, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [trendSearch, setTrendSearch] = useState('');

  return (
    <div className="w-full bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-8">
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <section className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Courses In Progress
                </p>
                <p className="text-xs text-slate-500">
                  Pick up where you left off.
                </p>
              </div>
              <Button className="h-9 rounded-md px-4 text-sm font-semibold" asChild>
                <Link to="/learner/my-courses">View all</Link>
              </Button>
            </div>

            <Carousel
              opts={{ loop: true, align: 'start' }}
              plugins={[autoplay.current]}
              className="mt-3 w-full"
            >
              <CarouselContent>
                {IN_PROGRESS_PLACEHOLDERS.map((course) => (
                  <CarouselItem key={course.title} className="basis-full">
                    <Link
                      to="/learner/discover"
                      className="group block h-full overflow-hidden rounded-2xl border border-slate-300/85 bg-white/85 transition-colors hover:border-sky-300"
                    >
                      <div className="relative h-52 w-full overflow-hidden">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ objectPosition: course.imagePosition }}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 text-base font-semibold text-slate-900">
                          {course.title}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {course.subtitle}
                        </p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                          {course.summary}
                        </p>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </section>

          <TopTrendsTable
            onTrendClick={(trendName) => {
              setTrendSearch(trendName);
              setIsTrendModalOpen(true);
            }}
          />
        </div>

        <PersonalAnalytics />

        <TrendCourseSearchDialog
          initialSearchValue={trendSearch}
          open={isTrendModalOpen}
          onOpenChange={setIsTrendModalOpen}
        />
      </div>
    </div>
  );
}
