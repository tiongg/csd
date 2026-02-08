import { EllipsisVerticalIcon, FireIcon, MagnifyingGlassIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Heading1, Heading3, Paragraph } from "@/components/ui/typography"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

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
            <Card className="col-span-1 border-2 cursor-pointer transition hover:border-slate-500 hover:shadow-lg">
                <CardContent className="flex justify-center items-center flex-col h-full gap-y-8">
                    <PlusCircleIcon className="size-28" />
                    <Heading3>Start New Course</Heading3>
                </CardContent>
            </Card>

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
    return (
        <Card className="flex flex-col justify-between col-span-1 overflow-hidden pt-0 border-2 cursor-pointer transition hover:border-slate-500 hover:shadow-lg">
            <div className="h-50 bg-sky-200 flex flex-col justify-between">
                <CardContent>
                    {/* image (if any) goes here, otherwise just do solid colour bg */}
                </CardContent>
                <Separator />
            </div>
            <CardHeader className="flex justify-between items-end">
                <div className="w-8/10">
                    <CardTitle>
                        <div className="relative group">
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 text-center w-full px-2 py-1 text-sm text-white bg-slate-800 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition">
                                {name}
                            </div>
                            <Heading3 className="w-full truncate">
                                {name}
                            </Heading3>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        <p className="text-slate-600">
                            {
                                status === "in-progress" ?
                                    `Last accessed: ${date}` :
                                    `Completed on: ${date}`
                            }
                        </p>
                    </CardDescription>
                </div>

                <div className="w-1/10">
                    <EllipsisVerticalIcon className="size-10 text-slate-600" />
                </div>
            </CardHeader>
        </Card>
    )
}