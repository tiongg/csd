import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

type DropCourseProps = {
  lessonId: string;
};

export default function DropCourse({ lessonId }: DropCourseProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: dropCourse, isPending } = useApiMutation(
    'post',
    '/api/learner/lesson/{lessonId}/drop',
    {
      onSuccess: async () => {
        toast.success('Course dropped successfully');
        await queryClient.invalidateQueries(
          apiQueryOptions('get', '/api/learner/lesson/enrolled'),
        );
      },
      onError: () => {
        toast.error('Failed to drop course');
      },
    },
  );

  const handleDrop = async () => {
    await dropCourse({
      params: {
        path: { lessonId },
      },
    });
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="bg-destructive/10 text-destructive rounded-lg p-3">
            <LogOut className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Leave Course</p>
            <p className="text-muted-foreground text-sm">
              Your progress will be lost
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className='hover:bg-red-700' disabled={isPending}>
                {isPending ? 'Dropping...' : 'Drop Course'}
              </Button>
            </DialogTrigger>
            <DialogContent showCloseButton>
              <DialogHeader>
                <DialogTitle>Drop Course</DialogTitle>
                <DialogDescription>
                  Are you sure you want to drop this course? Your progress
                  will be lost.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button
                  variant="destructive"
                  onClick={handleDrop}
                  disabled={isPending}
                  className='hover:bg-red-700'
                >
                  {isPending ? 'Dropping...' : 'Drop Course'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
