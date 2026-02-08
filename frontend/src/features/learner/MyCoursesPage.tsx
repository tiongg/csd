import { FireIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Heading1 } from "@/components/ui/typography"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CardWithDetails, CardWithPlusIcon } from "@/components/ui/cards";

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
                        <FireIcon height="2em" />
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
                            <div className="relative">
                                <Input placeholder="Search for Courses" className="pl-8 placeholder:text-slate-400" />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon height="1em" className="inline-block text-slate-400" />
                                </div>
                            </div>
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