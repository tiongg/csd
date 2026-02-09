import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Heading1 } from "@/components/ui/typography";
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

// placeholders
const pending = [
    {
        name: "Cotton",
        email: "cottoncat@email.com"
    },
    {
        name: "Riley",
        email: "rileylee.2024@computing.smu.edu.sg"
    }
];

const admins = [
    {
        name: "Tiong Guan",
        email: "tiong@email.com"
    }
];

const users = [
    {
        name: "Joey",
        email: "joey@email.com"
    }
];

export default function UserManagementForm() {
    return (
        <div className="p-16 w-full h-full flex flex-col gap-8">
            <div>
                <Heading1>User Management</Heading1>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>

            <div className="text-slate-800">
                <Tabs defaultValue="pending">
                    <TabsList variant="line">
                        <TabsTrigger value="pending" className="cursor-pointer">Pending Approvals</TabsTrigger>
                        <TabsTrigger value="admins" className="cursor-pointer">All Admins</TabsTrigger>
                        <TabsTrigger value="users" className="cursor-pointer">All Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending">
                        <PendingApprovals />
                    </TabsContent>

                    <TabsContent value="admins">
                        <AllAdmins />
                    </TabsContent>

                    <TabsContent value="users">
                        <AllUsers />
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
                        <TableHead className="w-2/6">Name</TableHead>
                        <TableHead className="w-3/6">Email</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {pending.map(({ name, email }) => (
                        <TableRow key={email}>
                            <TableCell>
                                <Checkbox className="border-slate-800" />
                            </TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell>{email}</TableCell>
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
                <SearchBar placeholder="Search for Admins" />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/6">Name</TableHead>
                        <TableHead className="w-3/6">Email</TableHead>
                        <TableHead className="w-1/6"></TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {admins.map(({ name, email }) => (
                        <TableRow key={email}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{email}</TableCell>
                            <TableCell>
                                <XMarkIcon className="cursor-pointer size-5" color="red" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function AllUsers() {
    return (
        <div className="flex flex-col gap-4 py-4">
            <div className="flex gap-x-2 w-full justify-end">
                <SearchBar placeholder="Search for Users" />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/6">Name</TableHead>
                        <TableHead className="w-3/6">Email</TableHead>
                        <TableHead className="w-1/6"></TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {users.map(({ name, email }) => (
                        <TableRow key={email}>
                            <TableCell>{name}</TableCell>
                            <TableCell>{email}</TableCell>
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