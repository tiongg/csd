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
import type { EditableQuizContent } from '@/lib/content.type';
import _ from 'lodash';
import { match } from 'ts-pattern';
import EditorCourseDisplay from './course-overview/EditorCourseDisplay';
import MarkdownEditor from './MarkdownEditor';
import QuizSectionEditor from './QuizSectionEditor';
import SectionSelect from './SectionSelect';

export default function CourseEditor() {
  const { setCurrentSection, currentSection, doc, addSection, course } =
    useContentEditor();

  const sectionCount = useYArrayLength(doc.getArray('root'));
  const section = doc.getArray('root').get(currentSection);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="bg-muted/40 flex shrink-0 items-center gap-2 overflow-x-auto border-b p-2">
        <div></div>
        <Button
          size="sm"
          variant={currentSection === -1 ? 'default' : 'ghost'}
          onClick={() => setCurrentSection(-1)}
        >
          Overview
        </Button>
        <div className="bg-border mx-2 h-6 w-px shrink-0" />
        <div className="flex gap-1">
          {_.range(sectionCount).map((i) => (
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
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
        <div className="flex-1">
          <div className="mx-auto max-w-4xl p-8">
            {currentSection === -1 || !section ? (
              <EditorCourseDisplay course={course} />
            ) : (
              match(section.get('type')!)
                .with('markdown', () => <MarkdownEditor />)
                .with('quiz', () => (
                  <QuizSectionEditor
                    quizContent={section.get('content') as EditableQuizContent}
                  />
                ))
                .exhaustive()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
