import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/')({
  component: App,
});

interface CoursePreviewProps {
  title: string;
  instructor: string;
}

function CoursePreview({ title, instructor }: CoursePreviewProps) {
  return (
    <div>
      <div className="lg:h-[300px] h-[100px] bg-slate-200">
        {/* image goes here */}
      </div>
      <div className="py-2">
        <h2>{title}</h2>
        <p className="subtitle">{instructor}</p>
      </div>
    </div>
  );
}

function App() {
  // placeholder courses
  const courses = [
    {
      title: "How to Muh Hee Ow - The Basics",
      instructor: "Cotton Cat"
    },
    {
      title: "Muh Hee Ow - Advanced",
      instructor: "Cotton Cat"
    },
    {
      title: "Muh Hee Ow (Extreme)",
      instructor: "Cotton Cat"
    },
    {
      title: "Collaborative Software Development",
      instructor: "Christoph Treude"
    }
  ]

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case "ADMIN":
          navigate({ to: '/admin/dashboard' });
          break;
        case "CONTRIBUTOR":
          navigate({ to: '/contributor/dashboard' });
          break;
        default:
          navigate({ to: '/learner/dashboard' });

      }
    }
  })

  return (
    <div className='flex flex-1 justify-center flex-col items-center pt-16'>
      <div className='bg-slate-200 lg:h-125 h-50 w-9/10 m-5 text-center flex items-end justify-center'>
        <div className='mb-8'>
          <h1>Get Started</h1>
        </div>
      </div>

      <Separator />

      <div className='p-5 w-9/10'>
        <div className='py-4'>
          <h1>Trending now</h1>
          <p className='subtitle text-lg'>Most popular courses</p>
        </div>

        <Carousel>
          <CarouselContent>
            {
              courses.map((course) => {
                return (
                  <CarouselItem className='basis-1/3' key={course.title}>
                    <CoursePreview title={course.title} instructor={course.instructor} />
                  </CarouselItem>
                )
              })
            }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <Separator />

      <div className='pt-6 pb-16'>
        <h2>Contact Us</h2>
      </div>
    </div>
  );
}
