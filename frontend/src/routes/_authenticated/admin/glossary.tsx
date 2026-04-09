import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import GlossaryPage from '@/features/glossary/GlossaryPage';
import EditGlossaryDialog from '@/features/glossary/components/EditGlossaryDialog';
import { normalizeGlossaryCategory } from '@/features/relations/graph-data';
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
  const allCategories =
    glossaryItems
      ?.map((item) => normalizeGlossaryCategory(item.category))
      .filter((category): category is string => Boolean(category))
      .filter((category, index, categories) => categories.indexOf(category) === index)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) ??
    [];

  const handleEditClick = (item: GlossaryItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  return (
    <PageWithNavBar className="min-h-[calc(100vh-52px)] px-4 py-6 md:px-8 md:py-10 bg-slate-100/70 flex">
      <GlossaryPage onEditClick={handleEditClick} showGenerateButton />
      <EditGlossaryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem}
        allTitles={allTitles}
        allCategories={allCategories}
      />
    </PageWithNavBar>
  );
}
