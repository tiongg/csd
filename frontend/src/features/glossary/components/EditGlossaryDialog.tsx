import { Button } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiQueryOptions, useApiMutation } from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export type EditFormData = {
  title: string;
  description: string;
  context: string;
  example: string;
  category: string;
  relationships: string[];
};

type EditGlossaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GlossaryItem | null;
  allTitles: string[];
  allCategories: string[];
};

export default function EditGlossaryDialog({
  open,
  onOpenChange,
  item,
  allTitles,
  allCategories,
}: EditGlossaryDialogProps) {
  const queryClient = useQueryClient();
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    title: '',
    description: '',
    context: '',
    example: '',
    category: '',
    relationships: [],
  });

  const { mutateAsync: updateGlossary, isPending } = useApiMutation(
    'put',
    '/api/glossary/',
    {
      onSuccess: () => {
        queryClient.invalidateQueries(apiQueryOptions('get', '/api/glossary/'));
      },
    },
  );

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        context: item.context,
        example: item.example,
        category: item.category ?? '',
        relationships: item.relationships ?? [],
      });
    }
  }, [item]);

  const availableRelationships = allTitles.filter((t) => t !== formData.title);

  const handleSave = async () => {
    if (!item) return;

    try {
      await updateGlossary({
        body: {
          name: formData.title,
          description: formData.description,
          usedInContext: formData.context,
          usedInConversationExample: formData.example,
          category: formData.category || undefined,
          relationships: formData.relationships,
        },
      });
      toast.success('Glossary term updated successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update glossary term');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          const input = titleInputRef.current;
          if (!input) {
            return;
          }

          input.focus();
          const caretPosition = input.value.length;
          input.setSelectionRange(caretPosition, caretPosition);
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Glossary Term</DialogTitle>
          <DialogDescription>
            Update the glossary term details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <input
              ref={titleInputRef}
              id="title"
              type="text"
              className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="context">Context</Label>
            <textarea
              id="context"
              rows={2}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.context}
              onChange={(e) =>
                setFormData({ ...formData, context: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="example">Example</Label>
            <textarea
              id="example"
              rows={2}
              className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.example}
              onChange={(e) =>
                setFormData({ ...formData, example: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={formData.category || undefined}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              disabled={allCategories.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an existing category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allCategories.length === 0 ? (
              <p className="text-xs text-slate-500">
                No existing categories yet. Regenerate the glossary to create
                AI-generated categories first.
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label>Relationships</Label>
            <div className="flex flex-wrap gap-2 rounded-md border border-slate-200 p-2">
              {formData.relationships.map((rel) => (
                <span
                  key={rel}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600"
                >
                  {rel}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        relationships: formData.relationships.filter(
                          (r) => r !== rel,
                        ),
                      })
                    }
                    className="ml-1 rounded-full hover:bg-slate-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Select
              onValueChange={(value) => {
                if (!formData.relationships.includes(value)) {
                  setFormData({
                    ...formData,
                    relationships: [...formData.relationships, value],
                  });
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add relationship" />
              </SelectTrigger>
              <SelectContent>
                {availableRelationships
                  .filter((t) => !formData.relationships.includes(t))
                  .map((title) => (
                    <SelectItem key={title} value={title}>
                      {title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending} className='hover:bg-sky-700'>
            {isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
