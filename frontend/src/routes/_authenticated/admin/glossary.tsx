import { Button } from '@/components/ui';
import GlossaryPage from '@/features/glossary/GlossaryPage';
import EditGlossaryDialog from '@/features/glossary/components/EditGlossaryDialog';
import { useApiMutation, useApiQuery } from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/glossary')({
  component: AdminGlossaryPage,
});

function AdminGlossaryPage() {
  const [editingItem, setEditingItem] = useState<GlossaryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: glossaryItems, refetch } = useApiQuery('get', '/api/glossary/');
  const { mutateAsync: generateGlossary } = useApiMutation(
    'post',
    '/api/glossary/',
  );

  const allTitles = glossaryItems?.map((item) => item.title) ?? [];

  const handleEditClick = (item: GlossaryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleGenerateGlossary = async () => {
    try {
      await generateGlossary({});
      toast.success('Glossary generation started');
      refetch();
    } catch {
      toast.error('Failed to generate glossary');
    }
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <Button onClick={handleGenerateGlossary}>Regenerate Glossary</Button>
      </div>
      <GlossaryPage onEditClick={handleEditClick} />
      <EditGlossaryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem}
        allTitles={allTitles}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
