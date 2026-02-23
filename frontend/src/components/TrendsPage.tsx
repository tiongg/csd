import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { P, match } from 'ts-pattern';
import { Heading3, Paragraph } from "./ui/typography"

const CHANGE_ICON = {
    up: <ChevronUpIcon className="text-emerald-400 size-5" aria-label="Up Arrow" />,
    down: <ChevronDownIcon className="text-rose-500 size-5" aria-label="Down Arrow" />,
    none: <MinusIcon className="text-slate-600 size-5" aria-label="No Change" />

} as const;

type TrendCardProps = {
    rank: number;
    change: keyof typeof CHANGE_ICON;
    trend: string;
}

function TrendCard({ rank, change, trend }: TrendCardProps) {
    return (
        <div className="border-slate-300 border-2 rounded-xl w-full flex justify-between px-2 sm:px-4 grow py-1 gap-x-2">
            <div className="flex gap-x-2 items-center">
                <div className="flex items-center">
                    {CHANGE_ICON[change]}
                </div>
                <div>
                    <Paragraph>
                        {rank}
                    </Paragraph>
                </div>
            </div>

            <div className="flex items-center">
                <Paragraph className="text-end text-sm xl:text-base">
                    {trend}
                </Paragraph>
            </div>
        </div>
    )
}

function TrendsLoading() {
    return (
        <div className="h-full flex flex-col justify-center items-center gap-y-2">
            <span className="size-10 border-4 border-slate-300 border-b-sky-600 rounded-full inline-block box-border animate-spin"></span>
            <p className="text-slate-600 italic animate-pulse">
                Fetching the latest trends for you...
            </p>
        </div>
    )
}

function TrendsError() {
    return (
        <div className="h-full flex justify-center items-center">
            <p>
                We couldn't find any trends right now :( Check back later!
            </p>
        </div>
    )
}

function TrendsColumns({ trendsData }: { trendsData: Array<{ rank: number, name: string }> }) {
    return (
        <div className="grid lg:grid-cols-2 gap-x-4 lg:gap-x-8 h-full gap-y-4 py-2">
            <div className="flex flex-col justify-between gap-y-4">
                {
                    trendsData.map((trend, key) => (
                        key < Math.floor(trendsData.length / 2) ?
                            <TrendCard rank={trend.rank} change="up" trend={trend.name} key={key} />
                            : null
                    ))
                }
            </div>
            <div className="flex flex-col justify-between gap-y-4">
                {
                    trendsData.map((trend, key) => (
                        key > Math.floor(trendsData.length / 2) - 1 ?
                            <TrendCard rank={trend.rank} change="down" trend={trend.name} key={key} />
                            : null
                    ))
                }
            </div>
        </div>
    )
}

function TrendsDisplay(
    { trendsData, loading }: { trendsData: Array<{ rank: number, name: string }> , loading: boolean }
) {
    return match([loading, trendsData])
        .with([true, P.any], () => <TrendsLoading/>)
        .with([false, P.not(undefined)], () => <TrendsColumns trendsData={trendsData}/>)
        .otherwise(() => <TrendsError/>)
}

export default function TrendsPage() {
    async function getTrendsData() {
        const response = await fetch("/2026-02-20_130221_gen_alpha_trends.json");
        const data = await response.json();
        return data.trends;
    }

    const { data: trendsData, isLoading: loading } = useQuery({
        queryKey: ["trendsData"],
        queryFn: getTrendsData,
    });

    return (
        <div className="border-slate-400 border-2 rounded-xl w-full h-full p-4 xl:px-8 flex flex-col">
            <div>
                <Heading3>Top Trends</Heading3>
                <p className="font-subtitle">Keep up with the latest trends</p>
            </div>

            <TrendsDisplay trendsData={trendsData} loading={loading}/>
        </div>
    )
}