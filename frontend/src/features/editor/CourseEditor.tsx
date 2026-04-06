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
import { cn } from '@/lib/utils';
import _ from 'lodash';
import { match } from 'ts-pattern';
import EditorCourseDisplay from './course-overview/EditorCourseDisplay';
import MarkdownEditor from './MarkdownEditor';
import PresenceIndicator from './PresenceIndicator';
import QuizSectionEditor from './QuizSectionEditor';
import SectionSelect from './SectionSelect';

export default function CourseEditor() {
  const { setCurrentSection, currentSection, doc, addSection, course } =
    useContentEditor();

  const sectionCount = useYArrayLength(doc.getArray('root'));
  const section = doc.getArray('root').get(currentSection);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav className="shrink-0 px-4 py-3">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
          <div className="relative flex h-14 min-w-0 flex-1 items-center gap-1 rounded-xl border border-slate-300/80 bg-white/60 py-1 pr-2 pl-2 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'relative z-10 flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-medium shadow-none transition-colors duration-200',
                currentSection === -1
                  ? 'bg-sky-500 text-white hover:bg-sky-400 hover:text-white'
                  : 'text-slate-700 hover:bg-white/80 hover:text-slate-900',
              )}
              onClick={() => setCurrentSection(-1)}
            >
              Overview
            </Button>
            <div
              className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex w-max items-center gap-1 pr-1">
                {_.range(sectionCount).map((i) => (
                  <SectionSelect
                    key={i}
                    index={i}
                    isActive={currentSection === i}
                  />
                ))}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="relative z-10 h-10 shrink-0 whitespace-nowrap rounded-lg border border-sky-300 bg-sky-100 px-4 text-sm font-medium text-sky-900 transition-colors hover:bg-sky-200"
                >
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
          <PresenceIndicator className="h-14 shrink-0 rounded-xl border-slate-300/80 bg-white/60 px-3 shadow-[0_10px_22px_-16px_rgba(15,23,42,0.45)] backdrop-blur-xl" />
        </div>
      </nav>
      <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
        <div className="flex-1">
          {currentSection === -1 || !section ? (
            <EditorCourseDisplay course={course} />
          ) : (
            <div className="flex h-full flex-col overflow-auto px-6 pt-3 pb-6 md:px-8 md:pt-4 md:pb-8">
              <div className="mx-auto w-full max-w-4xl">
                {match(section.get('type')!)
                  .with('markdown', () => <MarkdownEditor />)
                  .with('quiz', () => (
                    <QuizSectionEditor
                      quizContent={section.get('content') as EditableQuizContent}
                    />
                  ))
                  .exhaustive()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
