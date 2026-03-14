import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApiMutation } from '@/lib/fetch-client';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ReviewHeaderProps = {
  versionId: string;
};

export default function ReviewHeader({ versionId }: ReviewHeaderProps) {
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { mutate: approveVersion, isPending: isApproving } = useApiMutation(
    'post',
    '/api/content-versions/{contentVersionId}/approve',
    {
      params: {
        path: { contentVersionId: versionId },
      },
      onSuccess: () => {
        toast.success('Course approved successfully');
        navigate({ to: '/admin/course-moderation' });
      },
      onError: () => {
        toast.error('Failed to approve course');
      },
    },
  );

  const { mutateAsync: rejectVersion, isPending: isRejecting } = useApiMutation(
    'post',
    '/api/content-versions/{contentVersionId}/reject',
    {
      params: {
        path: { contentVersionId: versionId },
      },
      onSuccess: () => {
        toast.success('Course rejected');
        setRejectOpen(false);
        setRejectReason('');
        navigate({ to: '/admin/course-moderation' });
      },
      onError: () => {
        toast.error('Failed to reject course');
      },
    },
  );

  function handleReject() {
    if (!rejectReason.trim()) return;
    rejectVersion({
      params: {
        path: { contentVersionId: versionId },
      },
      body: {
        rejectedReason: rejectReason.trim(),
      },
    });
  }

  return (
    <header className="flex w-full shrink-0 items-center justify-between border-b p-4">
      <p className="text-lg font-medium">Course Review</p>
      <div className="flex items-center gap-2">
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              className="cursor-pointer rounded-full"
            >
              <XCircleIcon className="size-4" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this course version.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Reason for rejection</Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Enter your feedback..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectOpen(false)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          variant="default"
          onClick={() =>
            approveVersion({
              params: {
                path: { contentVersionId: versionId },
              },
            })
          }
          disabled={isApproving}
          className="cursor-pointer rounded-full"
        >
          <CheckCircleIcon className="size-4" />
          {isApproving ? 'Approving...' : 'Approve'}
        </Button>
      </div>
    </header>
  );
}
