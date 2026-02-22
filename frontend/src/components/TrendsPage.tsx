import { useEffect, useState } from "react";
import { Heading3, Paragraph } from "./ui/typography"

type TrendCardProps = {
    rank: number;
    change: "up" | "down" | "none";
    trend: string;
}

function TrendCard({ rank, change, trend }: TrendCardProps) {
    const changeIcon = {
        up: <div className="inline-block h-0 w-0 border-r-8 border-b-5 border-l-8 border-r-transparent border-b-emerald-400 border-l-transparent">
            <span className="sr-only">Up Arrow</span>
        </div>,
        down: <div className="inline-block h-0 w-0 border-r-8 border-t-5 border-l-8 border-r-transparent border-t-rose-500 border-l-transparent">
            <span className="sr-only">Down Arrow</span>
        </div>,
        none: <div className="inline-block text-slate-600 font-bold">
            <span>—</span>
            <span className="sr-only">No Change</span>
        </div>
    }

    return (
        <div className="border-slate-300 border-2 rounded-xl w-full flex justify-between px-2 sm:px-4 grow py-1 gap-x-2">
            <div className="flex gap-x-2 items-center">
                <div className="flex items-center">
                    {changeIcon[change]}
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

export default function TrendsPage() {
    const [trendsData, setTrendsData] = useState([]);
    const [loading, setLoading] = useState(true);

    async function getTrendsData() {
        try {
            const response = await fetch("/2026-02-20_130221_gen_alpha_trends.json");
            const data = await response.json();
            return data;
        } catch (e) {
            setLoading(false);
            return null;
        }
    }
    useEffect(() => {
        getTrendsData().then(data => {
            if (!data) {
                setTrendsData([]);
            } else {
                setTrendsData(data.trends);
            }
            setLoading(false);
        });
    }, []);

    return (
        <div className="border-slate-400 border-2 rounded-xl w-full h-full p-4 xl:px-8 flex flex-col">
            <div>
                <Heading3>Top Trends</Heading3>
                <p className="font-subtitle">Keep up with the latest trends</p>
            </div>

            {
                loading &&
                <div className="h-full flex flex-col justify-center items-center gap-y-2">
                    <span className="size-10 border-4 border-slate-300 border-b-sky-600 rounded-full inline-block box-border animate-spin"></span>
                    <p className="text-slate-600 italic animate-pulse">
                        Fetching the latest trends for you...
                    </p>
                </div>
            }

            {
                !loading && trendsData.length === 0 &&
                <div className="h-full flex justify-center items-center">
                    <p>
                        We couldn't find any trends right now :( Check back later!
                    </p>
                </div>
            
            }
            
            {!loading && trendsData.length > 0 &&
                <div className="grid lg:grid-cols-2 gap-x-4 lg:gap-x-8 h-full gap-y-4 py-2">
                    <div className="flex flex-col justify-between gap-y-4">
                        {
                            trendsData.map((trend, key) => (
                                key < Math.floor(trendsData.length / 2) ?
                                <TrendCard rank={trend.rank} change="up" trend={trend.name} key={key}/>
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
            }
        </div>
    )
}