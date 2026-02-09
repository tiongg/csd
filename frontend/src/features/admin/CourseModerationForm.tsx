import { PencilIcon } from "@heroicons/react/24/outline";
import { Heading1 } from "@/components/ui/typography"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SearchBar from "@/components/ui/searchbar";

const pending = [
    {
        name: "Algorithms and Programming",
        creator: "ZZY"
    }
]

const courses = [
    {
        name: "Programming Fundamentals II",
        creator: "ZZY"
    }
]

export default function CourseModerationForm() {
    return (
        <div className="p-16 w-full h-full flex flex-col gap-4">
            <div>
                <Heading1>Course Moderation</Heading1>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>

            <div className="text-slate-800">
                <Tabs defaultValue="pending">
                    <TabsList variant="line">
                        <TabsTrigger value="pending" className="cursor-pointer">Pending Approvals</TabsTrigger>
                        <TabsTrigger value="courses" className="cursor-pointer">All Courses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        <PendingApprovals />
                    </TabsContent>

                    <TabsContent value="courses">
                        <AllAdmins />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function PendingApprovals() {
    return (
        <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-x-2 w-full justify-end">
                <Button variant="outline" className="cursor-pointer rounded-full w-[100px]">
                    Approve
                </Button>
                <Button variant="destructive" className="cursor-pointer rounded-full w-[100px]">
                    Delete
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/6"></TableHead>
                        <TableHead className="w-3/6">Course Name</TableHead>
                        <TableHead className="w-2/6">Creator</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {pending.map(({ name, creator }, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Checkbox className="border-slate-800" />
                            </TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell>{creator}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function AllAdmins() {
    return (
        <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-x-2 w-full justify-end">
                <SearchBar placeholder="Search for Courses" />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-3/6">Course Name</TableHead>
                        <TableHead className="w-2/6">Creator</TableHead>
                        <TableHead className="w-1/6"></TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {courses.map(({ name, creator }, i) => (
                        <TableRow key={i}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{creator}</TableCell>
                            <TableCell>
                                <PencilIcon className="cursor-pointer size-5" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}