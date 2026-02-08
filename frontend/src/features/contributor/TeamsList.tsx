import { Heading1 } from "@/components/ui/typography"
import { CardWithDetails, CardWithPlusIcon } from "@/components/ui/cards";

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
                <CardWithPlusIcon title="Add New Team"/>

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
        <CardWithDetails title={name} descriptor="Collaborators" data={size.toString()}/>
    )
}