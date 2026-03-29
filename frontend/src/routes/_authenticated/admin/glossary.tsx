import { Button } from '@/components/ui';
import { useApiMutation } from '@/lib/fetch-client';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/glossary')({
  component: AdminGlossaryPage,
});

function AdminGlossaryPage() {
  const { mutateAsync: generateGlossary } = useApiMutation(
    'post',
    '/api/glossary/',
  );

  return (
    <div>
      Admin Glossary Page
      <Button onClick={() => generateGlossary({})}>Generate Glossary</Button>
    </div>
  );
}
