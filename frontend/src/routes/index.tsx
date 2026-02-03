import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CoursePreview from '@/components/CoursePreview';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  // placeholder courses
  const courses = [
    {
      title: "How to Muh Hee Ow - The Basics",
      instructor: "Cotton Cat",
      rating: 5
    },
    {
      title: "Muh Hee Ow - Advanced",
      instructor: "Cotton Cat",
      rating: 5
    },
    {
      title: "Muh Hee Ow (Extreme)",
      instructor: "Cotton Cat",
      rating: 4
    },
    {
      title: "Collaborative Software Development",
      instructor: "Christoph Treude",
      rating: 5
    }
  ]
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "ADMIN") {
        navigate({ to: '/admin/dashboard' });
      } else if (user.role === "CONTRIBUTOR") {
        navigate({ to: '/contributor/dashboard' });
      } else {
        navigate({ to: '/learner/dashboard' });
      }
    }
  })

  return (
    <div className='flex flex-1 justify-center flex-col items-center'>
      <div className='bg-slate-200 lg:h-[500px] h-[200px] w-9/10 m-5 text-center flex items-end justify-center'>
        <div className='mb-8'>
          <h1>Get Started</h1>
        </div>
      </div>

      <div className='h-1 w-full p-4'>
        <hr />
      </div>

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
                    <CoursePreview title={course.title} instructor={course.instructor} rating={course.rating}/>
                  </CarouselItem>
                )
              })
            }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <div className='h-1 w-full p-4'>
        <hr />
      </div>


      <div className='pt-6 pb-16'>
        <h2>Contact Us</h2>
      </div>
    </div>
  );
}
