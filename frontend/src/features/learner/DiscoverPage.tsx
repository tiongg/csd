import Autoplay from "embla-carousel-autoplay";
import type { PropsWithChildren } from 'react';
import { Heading1, Heading3 } from '@/components/ui/typography';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";


type ReelOverlayProps = PropsWithChildren<{
  course: string;
  description?: string;
}>

function ReelOverlay({ course, description, children }: ReelOverlayProps) {
  const { user } = useAuth();

  return (
    <div className="h-[calc(100vh-16rem)] w-full relative border-2 border-slate-300">
      <div className="h-full w-full absolute z-1">
        <div className="flex items-center py-4 flex-col">
          <Button className="mb-4 cursor-pointer" size="lg">View Course</Button>
          <Heading3>{course}</Heading3>
          <p className="font-subtitle">{description}</p>
        </div>

        <div className="bottom-4 right-4 absolute text-slate-300">
          @{user?.username}
        </div>
      </div>

      <div className="h-full w-full absolute">
        {children}
      </div>

    </div>
  )
}

function ReelPlayer() {
  return (
    <div className="h-full w-full">
      reel video here
    </div>
  )
}

export default function DiscoverPage() {

  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Discover</Heading1>
        <p className="font-subtitle">Take a look at what our courses offer!</p>
      </div>


      <Carousel className="w-full h-full"
        plugins={[
          Autoplay({
            delay: 4000, stopOnInteraction: true
          })
        ]}
      >
        <CarouselContent>
          <CarouselItem>
            <ReelOverlay course="skibidi" description="aaa">
              <ReelPlayer />
            </ReelOverlay>
          </CarouselItem>

          <CarouselItem>
            <ReelOverlay course="skibidi" description="aaa">
              <ReelPlayer />
            </ReelOverlay>
          </CarouselItem>
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
