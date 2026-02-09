import { EllipsisVerticalIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Heading3 } from "./typography";
import { Separator } from "./separator";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function CardWithPlusIcon({ title }: { title: string }) {
    return (
        <Card className="col-span-1 border-2 cursor-pointer transition hover:border-slate-500 hover:shadow-lg">
            <CardContent className="flex justify-center items-center flex-col h-full gap-y-8">
                <PlusCircleIcon className="size-28" />
                <Heading3>{title}</Heading3>
            </CardContent>
        </Card>
    )
}

type CardWithDetailsProps = {
    title: string;
    descriptor: string;
    data: string;
}

export function CardWithDetails({ title, descriptor, data }: CardWithDetailsProps) {
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
                                {title}
                            </div>
                            <Heading3 className="w-full truncate">
                                {title}
                            </Heading3>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        <p className="text-slate-600">
                            {descriptor}: {data}
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