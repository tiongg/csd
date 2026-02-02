import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
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
  
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  const { data } = useApiQuery(
    'get',
    '/api/account/',
    {},
    {
      // enabled: !!user,
    },
  );
  const { mutateAsync: deleteAccount } = useApiMutation(
    'delete',
    '/api/account/{accountId}',
  );

  function onDeleteAccount(accountId: string) {
    return deleteAccount(
      {
        params: {
          path: { accountId },
        },
      },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: apiQueryOptions('get', '/api/account/').queryKey,
          });
        },
      },
    );
  }

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
                  <CarouselItem className='basis-1/3'>
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
    // <div className="flex flex-1 flex-col items-center justify-center">
    //   {user ? (
    //     <div className="mb-4 flex items-center gap-4">
    //       <p>Logged in as {user.username}</p>
    //       <Button onClick={logout}>Logout</Button>
    //     </div>
    //   ) : (
    //     <>
    //       <Link to="/login" className="mb-4 text-blue-500 underline">
    //         Go to Login Page
    //       </Link>
    //       <Link to="/register" className="mb-4 text-blue-500 underline">
    //         Go to Register Page
    //       </Link>
    //     </>
    //   )}

    //   <div className="flex w-[400px] flex-col gap-2 rounded-lg border border-gray-200 p-4">
    //     <p className="font-bold">Existing emails</p>
    //     {(data ?? []).map((account) => (
    //       <div key={account.id} className="flex justify-between">
    //         <p>{account.email}</p>
    //         <p>{account.username}</p>
    //         <Button
    //           variant="destructive"
    //           onClick={() => onDeleteAccount(account.id)}
    //         >
    //           Delete
    //         </Button>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
}
