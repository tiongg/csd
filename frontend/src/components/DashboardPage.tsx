import { match } from "ts-pattern";
import { Heading1 } from "./ui/typography";
import useActiveRole from "@/hooks/useActiveRole";
import { cn } from "@/lib/utils";

function CardsByRole() {
    const dir = useActiveRole() ?? "LEARNER";

    return match(dir)
        .with("ADMIN", () => (
            <>
                <InfoCard title="Pending Approvals" value="4" color="red" />
                <InfoCard title="Total Learners" value="10,000" color="black" />
                <InfoCard title="Total Courses" value="1000" color="black" />
            </>
        ))
        .with("CONTRIBUTOR", () => (
            <>
                <InfoCard title="Awaiting Approvals" value="4" color="orange" />
                <InfoCard title="Total Learners" value="10,000" color="black" />
                <InfoCard title="Total Courses" value="1000" color="black" />
            </>
        ))
        .with("LEARNER", () => (
            <>
                <InfoCard title="Daily streak" value="4" color="red" />
                <InfoCard title="Current Rank" value="Top 10%" color="black" />
                <InfoCard title="Total Courses" value="1000" color="black" />
            </>
        ))
        .exhaustive();
}

function ContentByRole() {
    const dir = useActiveRole() ?? "LEARNER";

    return match(dir)
        .with("ADMIN", () => (
            <>
                admin placeholder
            </>
        ))
        .with("CONTRIBUTOR", () => (
            <>
                contributor placeholder
            </>
        ))
        .with("LEARNER", () => (
            <>
                learner placeholder
            </>
        ))
        .exhaustive();
}

export default function Dashboard() {
    return (
        <div className="p-16 w-full h-full flex flex-col gap-8">
            <div>
                <Heading1>Dashboard Overview</Heading1>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>

            <div className="flex gap-4 lg:gap-12 justify-between">
                <CardsByRole />
            </div>

            <div className="bg-slate-200 h-full flex justify-center items-center">
                {/* something goes here depending on role (not designed yet) */}
                <ContentByRole/>
            </div>
        </div>
    )
}

type InfoCardProps = {
    title: string;
    value: string;
    color: "red" | "orange" | "black";
}

function InfoCard({ title, value, color }: InfoCardProps) {
    let textColorClassName;
    let borderColorClassName;
    switch (color) {
        case "red":
            textColorClassName = "text-rose-400";
            borderColorClassName = "border-rose-400";
            break;
        case "orange":
            textColorClassName = "text-amber-500";
            borderColorClassName = "border-amber-500";
            break;
        case "black":
            textColorClassName = "text-slate-800";
            borderColorClassName = "border-slate-400";
            break;
    }
    return (
        <div className={cn("w-0 grow rounded-lg text-center border-2 p-8 flex flex-col gap-4", textColorClassName, borderColorClassName)}>
            <div className="font-bold text-lg">
                {title}
            </div>
            <div className="font-bold text-2xl">
                {value}
            </div>
        </div>
    )
}