import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { Heading1, Heading2 } from '@/components/ui/typography';

export const Route = createFileRoute('/')({
  component: App,
});

type CoursePreviewProps = {
  title: string;
  instructor: string;
}

function CoursePreview({ title, instructor }: CoursePreviewProps) {
  return (
    <div>
      <div className="h-[100px] bg-slate-200 lg:h-[300px]">
        {/* image goes here */}
      </div>
      <div className="py-2">
        <Heading2>{title}</Heading2>
        <p className="font-subtitle">{instructor}</p>
      </div>
    </div>
  );
}

function App() {
  // placeholder courses
  const courses = [
    {
      title: 'How to Muh Hee Ow - The Basics',
      instructor: 'Cotton Cat',
    },
    {
      title: 'Muh Hee Ow - Advanced',
      instructor: 'Cotton Cat',
    },
    {
      title: 'Muh Hee Ow (Extreme)',
      instructor: 'Cotton Cat',
    },
    {
      title: 'Collaborative Software Development',
      instructor: 'Christoph Treude',
    },
  ];

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
    <div className="flex flex-1 flex-col items-center justify-center pt-16">
      <div className="m-5 flex h-50 w-9/10 items-end justify-center bg-slate-200 text-center lg:h-125">
        <div className="mb-8">
          <Heading1>Get Started</Heading1>
        </div>
      </div>

      <Separator />

      <div className="w-9/10 p-5">
        <div className="py-4">
          <Heading1>Trending now</Heading1>
          <p className="font-subtitle text-lg">Most popular courses</p>
        </div>

        <Carousel>
          <CarouselContent>
            {courses.map((course) =>
              <CarouselItem className="basis-1/3" key={course.title}>
                <CoursePreview
                  title={course.title}
                  instructor={course.instructor}
                />
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Separator />

      <div className="pt-6 pb-16">
        <Heading2>Contact Us</Heading2>
      </div>
    </div>
  );
}
