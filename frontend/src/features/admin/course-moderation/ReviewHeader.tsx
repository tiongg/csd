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
import { useContentReview } from '@/context/ContentReviewContext';
import { useApiMutation } from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ReviewHeaderProps = {
  className?: string;
};

export default function ReviewHeader({ className }: ReviewHeaderProps) {
  const { contentVersion } = useContentReview();
  const isPending = contentVersion.status === 'PENDING';
  const isApproved = contentVersion.status === 'APPROVED';
  const canReject = isPending || isApproved;
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { mutate: approveVersion, isPending: isApproving } = useApiMutation(
    'post',
    '/api/content-versions/{contentVersionId}/approve',
    {
      params: {
        path: { contentVersionId: contentVersion.id },
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
        path: { contentVersionId: contentVersion.id },
      },
      onSuccess: () => {
        toast.success(isApproved ? 'Course taken down' : 'Course rejected');
        setRejectOpen(false);
        setRejectReason('');
        navigate({ to: '/admin/course-moderation' });
      },
      onError: () => {
        toast.error(isApproved ? 'Failed to take down course' : 'Failed to reject course');
      },
    },
  );

  function handleReject() {
    if (!rejectReason.trim()) return;
    rejectVersion({
      params: {
        path: { contentVersionId: contentVersion.id },
      },
      body: {
        rejectedReason: rejectReason.trim(),
      },
    });
  }

  return (
    <div
      className={cn(
        'h-14 shrink-0 rounded-xl border border-slate-300/80 bg-white/60 px-3 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="flex h-full items-center gap-2">
        {canReject && (
          <>
            {isPending && (
              <Button
                variant="default"
                onClick={() =>
                  approveVersion({
                    params: {
                      path: { contentVersionId: contentVersion.id },
                    },
                  })
                }
                disabled={isApproving}
                className="h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
              >
                <CheckCircleIcon className="size-4" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
            )}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="h-9 rounded-lg">
                  <XCircleIcon className="size-4" />
                  {isApproved ? 'Take Down' : 'Reject'}
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl text-slate-900">
                    {isApproved ? 'Take Down Course' : 'Reject Course'}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    {isApproved
                      ? 'Please provide a reason for taking this course version down.'
                      : 'Please provide a reason for rejecting this course version.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reject-reason">
                      {isApproved ? 'Reason for takedown' : 'Reason for rejection'}
                    </Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="Enter your feedback..."
                      className="border-slate-300 bg-white/90 focus-visible:border-slate-400 focus-visible:ring-0"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="h-9 rounded-lg border-slate-300"
                    onClick={() => setRejectOpen(false)}
                    disabled={isRejecting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-9 rounded-lg"
                    onClick={handleReject}
                    disabled={isRejecting || !rejectReason.trim()}
                  >
                    {isRejecting
                      ? isApproved
                        ? 'Taking down...'
                        : 'Rejecting...'
                      : isApproved
                        ? 'Take Down'
                        : 'Reject'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        {!canReject && (
          <p className="text-sm font-medium text-slate-500">
            Already {contentVersion.status.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}
