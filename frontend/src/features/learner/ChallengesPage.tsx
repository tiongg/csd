import { Heading1 } from "@/components/ui/typography"

export default function ChallengesPage() {
    return (
        <div className="p-16 w-full h-full flex flex-col gap-8">
            <div>
                <Heading1>Challenges</Heading1>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>

            <div className="h-full bg-slate-200 flex justify-center items-center">
                some gamified pathway lol
            </div>
        </div>
    )
}