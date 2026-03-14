import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

type EnrollCourseProps = {
  courseId: string;
};

export default function EnrollCourse({ courseId }: EnrollCourseProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: enroll, isPending } = useApiMutation(
    'post',
    '/api/learner/lesson/{courseId}/enroll',
    {
      onSuccess: async () => {
        toast.success('Enrolled successfully!');
        await queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/learner/lesson/enrolled'),
        );
      },
      onError: () => {
        toast.error('Failed to enroll in course');
      },
    },
  );

  const handleEnroll = async () => {
    await enroll({
      params: {
        path: { courseId },
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary rounded-lg p-3">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Start Learning</p>
            <p className="text-muted-foreground text-sm">
              Enroll to track your progress
            </p>
          </div>
          <Button
            onClick={handleEnroll}
            size="lg"
            disabled={isPending}
          >
            {isPending ? 'Enrolling...' : 'Enroll'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
