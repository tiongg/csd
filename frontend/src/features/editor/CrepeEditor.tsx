import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useContentEditor } from '@/context/ContentEditorContext';
import useYArrayLength from '@/hooks/useYArrayLength';
import { Crepe } from '@milkdown/crepe';
import { collab, collabServiceCtx } from '@milkdown/plugin-collab';
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react';
import { useEffect } from 'react';
import * as Y from 'yjs';

import EditorCourseDisplay from './EditorCourseDisplay';
import SectionSelect from './SectionSelect';

import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';
import { match } from 'ts-pattern';
import './editor.css';
import QuizSectionEditor from './QuizSectionEditor';

function MarkdownEditor() {
  const { get: getEditor } = useEditor((root) => {
    return new Crepe({ root }).editor.use(collab);
  });
  const { doc, provider, currentSection } = useContentEditor();

  useEffect(() => {
    const editorInstance = getEditor();
    if (!editorInstance) return;

    editorInstance.action((ctx) => {
      try {
        const collabService = ctx.get(collabServiceCtx);
        collabService?.disconnect();

        // Assert doc structure, if null, it will automatically create it
        const section = doc.getArray('root').get(currentSection)!;
        if (section.get('type') !== 'markdown') {
          return;
        }

        collabService
          .bindXmlFragment(section.get('content')! as Y.XmlFragment)
          .setAwareness(provider.awareness)
          .connect();
      } catch {
        // collabServiceCtx not ready yet, will retry on next render
      }
    });
  }, [getEditor, doc, provider, currentSection]);

  return (
    <div className="px-2">
      <Milkdown />
    </div>
  );
}

export default function CrepeEditor() {
  const { setCurrentSection, currentSection, doc, addSection, course } =
    useContentEditor();

  const sectionCount = useYArrayLength(doc.getArray('root'));
  const section = doc.getArray('root').get(currentSection);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="bg-muted/40 flex shrink-0 items-center gap-2 overflow-x-auto border-b p-2">
        <Button
          size="sm"
          variant={currentSection === -1 ? 'default' : 'ghost'}
          onClick={() => setCurrentSection(-1)}
        >
          Overview
        </Button>
        <div className="bg-border mx-2 h-6 w-px shrink-0" />
        <div className="flex gap-1">
          {Array.from({ length: sectionCount }, (_, i) => i).map((i) => (
            <SectionSelect key={i} index={i} />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                + Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => addSection('markdown')}>
                  Section
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => addSection('quiz')}>
                  Quiz
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {currentSection === -1 || !section ? (
          <EditorCourseDisplay course={course} />
        ) : (
          match(section.get('type')!)
            .with('markdown', () => (
              <MilkdownProvider>
                <MarkdownEditor />
              </MilkdownProvider>
            ))
            .with('quiz', () => <QuizSectionEditor />)
            .exhaustive()
        )}
      </div>
    </div>
  );
}
