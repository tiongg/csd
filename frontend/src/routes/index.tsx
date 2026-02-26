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
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: App,
});

type CoursePreviewProps = {
  name: string;
  creator: string;
  imageSrc: string;
};

function CoursePreview({ name, creator, imageSrc }: CoursePreviewProps) {
  return (
    <div>
      <div className="h-48 bg-slate-200 lg:h-72">
        <img src={imageSrc} alt={name} className='h-full w-full object-cover' />
      </div>
      <div className="py-2">
        <Heading2>{name}</Heading2>
        <p className="font-subtitle">{creator}</p>
      </div>
    </div>
  );
}

function App() {
  // placeholder courses
  const courses = [
    {
      name: 'How to say Six Seven',
      creator: 'Christoph Treude',
      imageSrc: '/assets/landing_page/six_seven.jpg'
    },
    {
      name: 'Hawk Tuah for Chinese New Year',
      creator: 'Pius Lee',
      imageSrc: '/assets/landing_page/hawk_tuah.png'

    },
    {
      name: 'What NOT to say at festive gatherings',
      creator: 'Wang Jiwei',
      imageSrc: '/assets/landing_page/festive_gatherings.jpg'
    },
    {
      name: 'Know the latest trends',
      creator: 'Zhang Zhiyuan',
      imageSrc: '/assets/landing_page/latest_trends.jpg'
    }
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
      <div className="m-5 relative h-50 w-9/10 justify-center text-center lg:h-125">
        <div className="bottom-8 absolute z-10 p-4 sm:px-10 sm:py-6 rounded-md bg-white left-0 right-0 mx-auto w-fit">
          <Heading1>Get Started</Heading1>
        </div>
        <img src="/assets/landing_page/get_started.jpg" alt="Adult learners in a classroom" className='w-full h-full object-cover rounded-md absolute -z-10' />
      </div>

      <Separator />

      <div className="w-9/10 p-5 flex flex-col items-center">
        <div className="py-4 w-full">
          <Heading1>Trending now</Heading1>
          <p className="font-subtitle text-lg">Most popular courses</p>
        </div>

        <div className='w-9/10'>
          <Carousel>
            <CarouselContent>
              {courses.map(({ name, creator, imageSrc }, i) => (
                <CarouselItem className="sm:basis-1/2 md:basis-1/3" key={i}>
                  <CoursePreview name={name} creator={creator} imageSrc={imageSrc} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>

      <Separator />

      <div className="pt-6 pb-16">
        <Button asChild variant="link">
          <a
            href="mailto:tg.tan.2024@computing.smu.edu.sg"
          >
            <Heading2>
              Contact Us
            </Heading2>
          </a>
        </Button>
      </div>
    </div>
  );
}
