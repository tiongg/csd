import { FireIcon } from "@heroicons/react/24/outline";
import { Heading1 } from "@/components/ui/typography"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { CardWithDetails, CardWithPlusIcon } from "@/components/ui/cards";
import SearchBar from "@/components/ui/searchbar";

// placeholder
const courses = [
    {
        name: "Web Application Development II",
        date: "8 February 2026"
    },
    {
        name: "Foundations of Cybersecurity",
        date: "31 December 2025"
    }
]

export default function MyCoursesPage() {
    return (
        <div className="p-16 w-full h-full flex flex-col gap-8">
            <div>
                <div className="flex items-center gap-6">
                    <div>
                        <Heading1>My Courses</Heading1>
                    </div>
                    <div className="flex items-center text-rose-500">
                        <div className="text-xl font-bold">4</div>
                        <FireIcon className="size-8" />
                    </div>
                </div>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>

            <div className="text-slate-800">
                <Tabs defaultValue="in-progress">
                    <div className="flex justify-between">
                        <div>
                            <TabsList variant="line">
                                <TabsTrigger value="in-progress" className="cursor-pointer">In Progress</TabsTrigger>
                                <TabsTrigger value="completed" className="cursor-pointer">Completed</TabsTrigger>
                            </TabsList>
                        </div>

                        <div>
                            <SearchBar placeholder="Search for Courses"/>
                        </div>
                    </div>

                    <TabsContent value="in-progress">
                        <InProgress />
                    </TabsContent>

                    <TabsContent value="completed">
                        <Completed />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function InProgress() {
    return (
        <div className="grid grid-cols-3 gap-4 lg:gap-12 justify-start py-4">
            <CardWithPlusIcon title="Start New Course" />

            {
                courses.map((course) => (
                    <CourseCard name={course.name} date={course.date} status="in-progress" />
                ))
            }
        </div>
    )
}

function Completed() {
    return (
        <div className="grid grid-cols-3 gap-4 lg:gap-12 justify-start py-4">
            {
                courses.map((course) => (
                    <CourseCard name={course.name} date={course.date} status="completed" />
                ))
            }
        </div>
    )
}

type CourseCardProps = {
    name: string;
    date: string;
    status: "in-progress" | "completed";
}

function CourseCard({ name, date, status }: CourseCardProps) {
    const descriptor = status === "in-progress" ? "Last accessed" : "Completed on"
    return ( 
        <CardWithDetails title={name} descriptor={descriptor} data={date} />
    )
}