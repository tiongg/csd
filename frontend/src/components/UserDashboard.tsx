import { match } from "ts-pattern";
import { Heading1 } from "./ui/typography";
import useActiveRole from "@/hooks/useActiveRole";
import { cn } from "@/lib/utils";

function CardsByRole() {
    const dir = useActiveRole() ?? "LEARNER";

    return match(dir)
        .with("ADMIN", () => (
            <>
                <InfoCard title="Pending Approvals" value="4" variant="danger" />
                <InfoCard title="Total Learners" value="10,000" variant="default" />
                <InfoCard title="Total Courses" value="1000" variant="default" />
            </>
        ))
        .with("CONTRIBUTOR", () => (
            <>
                <InfoCard title="Awaiting Approvals" value="4" variant="warning" />
                <InfoCard title="Total Learners" value="10,000" variant="default" />
                <InfoCard title="Total Courses" value="1000" variant="default" />
            </>
        ))
        .with("LEARNER", () => (
            <>
                <InfoCard title="Daily streak" value="4" variant="danger" />
                <InfoCard title="Current Rank" value="Top 10%" variant="default" />
                <InfoCard title="Total Courses" value="1000" variant="default" />
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
        <div className="p-16 w-full h-full flex flex-col gap-4">
            <div>
                <Heading1>Dashboard Overview</Heading1>
                <p className="font-subtitle">Here's what's happening today!</p>
            </div>

            <div className="flex gap-4 justify-between">
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
    variant: "danger" | "warning" | "default";
}

function InfoCard({ title, value, variant }: InfoCardProps) {
    const INFO_CARD_STYLES = {
        danger: "text-rose-400 border-rose-400",
        warning: "text-amber-500 border-amber-500",
        default: "text-slate-800 border-slate-400"
    }
    return (
        <div className={cn("w-0 grow rounded-lg text-center border-2 p-8 flex flex-col gap-4", INFO_CARD_STYLES[variant])}>
            <div className="font-bold text-lg">
                {title}
            </div>
            <div className="font-bold text-2xl">
                {value}
            </div>
        </div>
    )
}