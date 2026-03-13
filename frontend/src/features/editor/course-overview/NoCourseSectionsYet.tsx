import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useContentEditor } from '@/context/ContentEditorContext';
import { FileText, Plus } from 'lucide-react';

export default function NoCourseSectionsYet() {
  const { addSection, setCurrentSection } = useContentEditor();

  return (
    <Card>
      <CardContent className="flex min-h-75 flex-col items-center justify-between p-8">
        <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
          <FileText className="text-muted-foreground size-8" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">No sections yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
          Start building your course content by creating your first section.
        </p>
        <Button
          size="lg"
          onClick={() => {
            addSection('markdown');
            setCurrentSection(0);
          }}
        >
          <Plus className="mr-2 size-5" />
          Create First Section
        </Button>
      </CardContent>
    </Card>
  );
}
