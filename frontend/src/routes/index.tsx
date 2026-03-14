import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const autoplay = useRef(
    Autoplay({ delay: 3200, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const weeklyCompletion = [42, 51, 57, 63, 68, 74, 79];
  const coursePreviews = [
    {
      title: 'Corecore and Emotional Montage Edits',
      instructor: 'By Youth Signals Desk',
      image:
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
      imagePosition: 'center center',
      summary:
        'Learn why emotionally layered montage edits are driving saves and rewatches across global youth audiences.',
    },
    {
      title: 'Street Interview Vox-Pops and Fast Cuts',
      instructor: 'By Platform Intelligence Team',
      image:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
      imagePosition: 'center center',
      summary:
        'Decode how quick question hooks and jump-cut pacing improve hold rate in public interview content.',
    },
    {
      title: 'Clean Girl to Office Siren Style Shift',
      instructor: 'By Culture Research Unit',
      image:
        'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80',
      imagePosition: 'center 40%',
      summary:
        'Map the shift from soft-minimal beauty culture to sharper workwear-coded identity signaling across feeds.',
    },
    {
      title: 'Underconsumption Core and No-Buy Diaries',
      instructor: 'By Strategy Applications Team',
      image:
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80',
      imagePosition: 'center center',
      summary:
        'Translate anti-haul and mindful-spending content into practical messaging choices for teams and educators.',
    },
  ];
  const chartWidth = 620;
  const chartHeight = 240;
  const chartPadding = 24;
  const chartMin = Math.min(...weeklyCompletion);
  const chartMax = Math.max(...weeklyCompletion);
  const chartRange = Math.max(1, chartMax - chartMin);
  const chartPoints = weeklyCompletion.map((value, index) => {
    const x =
      chartPadding +
      (index * (chartWidth - chartPadding * 2)) / (weeklyCompletion.length - 1);
    const y =
      chartHeight -
      chartPadding -
      ((value - chartMin) / chartRange) * (chartHeight - chartPadding * 2);
    return { x, y, value };
  });
  const chartLinePoints = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${chartPoints[0]!.x} ${chartHeight - chartPadding} L ${chartLinePoints.replaceAll(' ', ' L ')} L ${chartPoints[chartPoints.length - 1]!.x} ${chartHeight - chartPadding} Z`;

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'ADMIN':
          navigate({ to: '/admin/dashboard' });
          break;
        case 'CONTRIBUTOR':
          navigate({ to: '/contributor/dashboard' });
          break;
        default:
          navigate({ to: '/learner/dashboard' });
      }
    }
  }, [user, navigate]);

  return (
    <main className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_#ffffff,_#f8fafc_40%,_#e2e8f0)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 md:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-2xl shadow-slate-300/35">
          <div className="pointer-events-none absolute -top-20 -left-16 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-slate-200/70 blur-3xl" />

          <div className="relative grid gap-7 p-6 md:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-6">
              <div className="inline-flex rounded-full border border-sky-300/80 bg-sky-50 px-4 py-1 text-xs font-semibold tracking-[0.12em] text-sky-700 uppercase">
                Professional Gen-Alpha Learning
              </div>
              <h1 className="max-w-3xl text-3xl leading-tight font-semibold text-slate-900 md:text-5xl">
                Build real-world Gen-Alpha fluency without the noise.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                Structured insights, practical frameworks, and collaborative
                workflows for educators, creators, and modern teams.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="h-11 px-6 text-base font-semibold" asChild>
                  <Link to="/register">
                    Start learning
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-slate-300 px-6 text-base font-semibold text-slate-700"
                  asChild
                >
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Analytics preview
                </p>
                <span className="rounded-full border border-sky-300/80 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                  Capability cue
                </span>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-slate-600">
                Monitor learning momentum, contributor output, and course quality
                trends in one place.
              </p>
              <div className="h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-3 md:h-60">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
                    </linearGradient>
                  </defs>
                  {[0, 1, 2, 3].map((i) => {
                    const y =
                      chartPadding + (i * (chartHeight - chartPadding * 2)) / 3;
                    return (
                      <line
                        key={i}
                        x1={chartPadding}
                        x2={chartWidth - chartPadding}
                        y1={y}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 6"
                      />
                    );
                  })}
                  <path d={areaPath} fill="url(#trendFill)" />
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartLinePoints}
                  />
                  {chartPoints.map((point) => (
                    <circle
                      key={`${point.x}-${point.y}`}
                      cx={point.x}
                      cy={point.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-300 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5">
            <p className="text-sm font-semibold tracking-[0.1em] text-slate-500 uppercase">
              Course Preview
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              Featured learning tracks
            </h2>
          </div>

          <Carousel
            opts={{ loop: true, align: 'start' }}
            plugins={[autoplay.current]}
            className="w-full"
          >
            <CarouselContent>
              {coursePreviews.map((course) => (
                <CarouselItem
                  key={course.title}
                  className="basis-full sm:basis-1/2"
                >
                  <Link
                    to="/login"
                    className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-sky-300"
                  >
                    <div className="relative h-64 w-full overflow-hidden">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ objectPosition: course.imagePosition }}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl leading-snug font-semibold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {course.instructor}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {course.summary}
                      </p>
                      <p className="mt-4 text-sm font-semibold text-sky-700 underline-offset-4 group-hover:underline">
                        View course
                      </p>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </section>

        <section className="pb-6 text-center">
          <p className="text-sm text-slate-600">
            Need help or partnership details?
          </p>
          <Button asChild variant="link" className="text-base font-semibold">
            <a href="mailto:tg.tan.2024@computing.smu.edu.sg">Contact Us</a>
          </Button>
        </section>
      </div>
    </main>
  );
}
