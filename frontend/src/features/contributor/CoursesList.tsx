import { Button } from '@/components/ui/button';
import {
  CardWithDetails,
  CardWithPlusIcon,
} from '@/components/ui/custom-cards';
import { Heading1 } from '@/components/ui/typography';
import { useApiQuery } from '@/lib/fetch-client';
import { capitalizeFirst, cn, type Course, type Team } from '@/lib/utils';

type StatusType = 'approved' | 'pending';

type CourseListProps = {
  team: Team;
};

export default function CoursesList({ team }: CourseListProps) {
  const { data: courses } = useApiQuery('get', '/api/teams/{teamId}/courses', {
    params: {
      path: {
        teamId: team.id,
      },
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-y-2 p-16">
      <div className="flex justify-between">
        <div>
          <Heading1>{team.name}</Heading1>
          <p className="font-subtitle">Collaborators: {team.members.length}</p>
        </div>

        <div>
          <Button size="lg" className="cursor-pointer">
            Collaborators
          </Button>
        </div>
      </div>
      <div>
        <Button variant="destructive" className="cursor-pointer rounded-full">
          Delete Team
        </Button>
      </div>
      <div className="grid grid-cols-3 justify-start gap-4 py-4">
        <CardWithPlusIcon title="Create New Course" />

        {(courses ?? []).map((course, i) => (
          <CourseCard course={course} key={i} />
        ))}
      </div>
    </div>
  );
}

type CourseCardProps = {
  course: Course;
  status?: StatusType;
};

const BADGE_STYLES = {
  approved: 'bg-slate-800',
  pending: 'bg-amber-500',
} satisfies Record<StatusType, string>;

function CourseCard({ course, status }: CourseCardProps) {
  return (
    <div className="relative">
      {status && (
        <div
          className={cn(
            'absolute top-4 right-4 w-26 rounded-full px-2 py-1 text-center text-white',
            BADGE_STYLES[status],
          )}
        >
          {capitalizeFirst(status)}
        </div>
      )}
      <CardWithDetails
        title={course.title}
        descriptor="Last Edited"
        data={course.updatedAt}
      />
    </div>
  );
}
