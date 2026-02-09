import { CardWithDetails, CardWithPlusIcon } from "@/components/ui/cards";
import { Heading1 } from "@/components/ui/typography";
import { capitalizeFirst, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// placeholder
const courses = [
    {
        name: "Capital Markets in China",
        date: "9 February 2026",
        status: "approved"
    },
    {
        name: "Enterprise Solution Management",
        date: "8 February 2026",
        status: "pending"
    },
    {
        name: "Enterprise Solution Development",
        date: "5 February 2026",
    }
]

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
            <div className="grid grid-cols-3 gap-4 lg:gap-12 justify-start py-4">
                <CardWithPlusIcon title="Add New Team" />

                {
                    courses.map((course) => (
                        <CourseCard name={course.name} date={course.date} status={course.status} />
                    ))
                }
            </div>
        </div>
    )
}

type CourseCardProps = {
    name: string;
    date: string;
    status?: string;
}

function CourseCard({ name, date, status }: CourseCardProps) {
    let badgeColor;
    switch (status) {
        case "approved":
            badgeColor = "bg-slate-800";
            break;
        case "pending":
            badgeColor = "bg-amber-500";
            break;
    }

    return (
        <div className="relative">
            {
                status && <div className={cn("absolute right-0 px-2 py-1 m-4 rounded-full w-26 text-center text-white", badgeColor)}>{capitalizeFirst(status)}</div>
            }
            <CardWithDetails title={name} descriptor="Last Edited" data={date} />
        </div>
    )
}