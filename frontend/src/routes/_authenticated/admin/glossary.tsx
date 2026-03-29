import GlossaryPage from '@/features/glossary/GlossaryPage';
import EditGlossaryDialog from '@/features/glossary/components/EditGlossaryDialog';
import { useApiQuery } from '@/lib/fetch-client';
import type { GlossaryItem } from '@/lib/utils';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/admin/glossary')({
  component: AdminGlossaryPage,
});

function AdminGlossaryPage() {
  const [editingItem, setEditingItem] = useState<GlossaryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: glossaryItems } = useApiQuery('get', '/api/glossary/');

  const allTitles = glossaryItems?.map((item) => item.title) ?? [];

  const handleEditClick = (item: GlossaryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <GlossaryPage onEditClick={handleEditClick} showGenerateButton />
      <EditGlossaryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem}
        allTitles={allTitles}
      />
    </div>
  );
}
