import { CardWithDetails, CardWithPlusIcon } from "@/components/ui/custom-cards";
import { Heading1 } from "@/components/ui/typography";
import { capitalizeFirst, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type StatusType = "approved" | "pending";

// placeholder
const courses = [
    {
        name: "Capital Markets in China",
        date: "9 February 2026",
        status: "approved" as StatusType
    },
    {
        name: "Enterprise Solution Management",
        date: "8 February 2026",
        status: "pending" as StatusType
    },
    {
        name: "Enterprise Solution Development",
        date: "5 February 2026",
    }
];

export default function CoursesList() {
    return (
        <div className="p-16 w-full h-full flex flex-col gap-y-2">
            <div className="flex justify-between">
                <div>
                    <Heading1>Team Name</Heading1>
                    <p className="font-subtitle">Collaborators: 3</p>
                </div>

                <div>
                    <Button size="lg" className="cursor-pointer">Collaborators</Button>
                </div>
            </div>
            <div>
                <Button variant="destructive" className="rounded-full cursor-pointer">Delete Team</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 justify-start py-4">
                <CardWithPlusIcon title="Add New Team" />

                {
                    courses.map(({ name, date, status }, i) => (
                        <CourseCard name={name} date={date} status={status} key={i} />
                    ))
                }
            </div>
        </div>
    )
}

type CourseCardProps = {
    name: string;
    date: string;
    status?: "approved" | "pending";
}

function CourseCard({ name, date, status }: CourseCardProps) {
    const BADGE_STYLES = {
        approved: "bg-slate-800",
        pending: "bg-amber-500",
    };

    return (
        <div className="relative">
            {
                status && <div className={cn("absolute top-4 right-4 px-2 py-1 rounded-full w-26 text-center text-white", BADGE_STYLES[status])}>{capitalizeFirst(status)}</div>
            }
            <CardWithDetails title={name} descriptor="Last Edited" data={date} />
        </div>
    );
}