import { Heading1 } from '@/components/ui/typography';

export default function ChallengesPage() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Challenges</Heading1>
        <p className="font-subtitle">Here's what's happening today!</p>
      </div>

      <div className="flex h-full items-center justify-center bg-slate-200">
        some gamified pathway lol
      </div>
    </div>
  );
}
