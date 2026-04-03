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
import { useNavigate } from '@tanstack/react-router';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ReviewHeader() {
  const { contentVersion } = useContentReview();
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
        path: { contentVersionId: contentVersion.id },
      },
      body: {
        rejectedReason: rejectReason.trim(),
      },
    });
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">Course Review</p>
          <p className="text-sm text-slate-600">
            Validate content quality before publishing this version.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="h-9 rounded-lg">
                <XCircleIcon className="size-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-slate-900">
                  Reject Course
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Please provide a reason for rejecting this course version.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reject-reason">Reason for rejection</Label>
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
        </div>
      </div>
    </header>
  );
}
