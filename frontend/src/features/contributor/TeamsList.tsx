import { EllipsisVerticalIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import { Heading1, Heading3 } from "@/components/ui/typography"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// placeholders
const teams = [
    {
        name: "School of Computing and Information Systems",
        size: 4
    },
    {
        name: "School of Business",
        size: 3
    },
    {
        name: "School of Law",
        size: 1
    },
    {
        name: "School of Accountancy",
        size: 6
    },
    {
        name: "School of Economics",
        size: 2
    }
];

export default function TeamsList() {
    return (
        <div className="p-16 w-full h-full flex flex-col">
            <div>
                <Heading1>Your Teams</Heading1>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>
            <div className="grid grid-cols-3 gap-4 lg:gap-12 justify-start py-4">
                <Card className="col-span-1 border-2 cursor-pointer transition hover:border-slate-500 hover:shadow-lg">
                    <CardContent className="flex justify-center items-center flex-col h-full gap-y-8">
                        <PlusCircleIcon className="size-28" />
                        <Heading3>Add New Team</Heading3>
                    </CardContent>
                </Card>

                {
                    teams.map((team) => (
                        <TeamCard name={team.name} size={team.size} />
                    ))
                }
            </div>
        </div>
    )
}

type TeamCardProps = {
    name: string;
    size: number;
}

function TeamCard({ name, size }: TeamCardProps) {
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
                            Collaborators: {size}
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