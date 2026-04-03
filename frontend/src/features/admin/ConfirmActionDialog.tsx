import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  variant?: 'default' | 'destructive';
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isPending = false,
  variant = 'default',
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border-slate-200 p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900">{title}</DialogTitle>
          <DialogDescription className="text-slate-600">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-1">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-lg border-slate-300"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className={cn(
              'h-9 rounded-lg',
              variant === 'default' && 'bg-sky-600 text-white hover:bg-sky-700',
            )}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending && <Loader2Icon className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
