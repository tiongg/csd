import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useContentEditor } from '@/context/ContentEditorContext';
import { useYArrayTextBindings } from '@/hooks/useYArrayTextBindings';
import type { EditableQuizContent, QuizContent } from '@/lib/content.type';
import { generateColorFromString, hexToRgb } from '@/lib/utils';
import { TextAreaBinding, type TextAreaBindingOptions } from '@/lib/y-textarea';
import { XIcon } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useY } from 'react-yjs';
import * as Y from 'yjs';

type QuizSectionEditorProps = {
  quizContent: EditableQuizContent;
};

const MAX_OPTIONS = 6;

function isOptionCorrect(answer: number, index: number): boolean {
  return (answer & (1 << index)) !== 0;
}

function toggleOptionCorrect(answer: number, index: number): number {
  return isOptionCorrect(answer, index)
    ? answer & ~(1 << index)
    : answer | (1 << index);
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export default function QuizSectionEditor({
  quizContent,
}: QuizSectionEditorProps) {
  const { provider, currentSection, doc } = useContentEditor();
  const { user } = useAuth();
  const questionAreaRef = useRef<HTMLTextAreaElement>(null);
  const quizOptions = useMemo(() => quizContent.get('options')!, [quizContent]);

  // useY returns a Y.Map converted to plain JS object, but the types don't reflect that, so we need to cast it
  const content = useY(quizContent) as unknown as QuizContent;

  // Binding config for question and option textareas
  const bindingConfig = useMemo<TextAreaBindingOptions>(
    () => ({
      awareness: provider.awareness,
      clientName: user?.username ?? 'Anonymous',
      color: hexToRgb(generateColorFromString(user?.username ?? 'Anonymous')),
    }),
    [provider, user],
  );

  // Question area binding
  useEffect(() => {
    if (!questionAreaRef.current) return;
    const textArea = questionAreaRef.current;

    const questionAreaBinding = new TextAreaBinding(
      quizContent.get('question')!,
      textArea,
      bindingConfig,
    );

    return () => {
      questionAreaBinding.destroy();
    };
  }, [quizContent, bindingConfig]);

  const { getRef: getOptionRef } = useYArrayTextBindings(
    quizOptions,
    bindingConfig,
  );

  function addOption() {
    if (quizOptions.length >= MAX_OPTIONS) return;
    doc.transact(() => {
      quizOptions.push([new Y.Text()]);
    });
  }

  function deleteOption(index: number) {
    doc.transact(() => {
      quizOptions.delete(index, 1);
    });
  }

  const currentAnswer = content['answer'] ?? 0;
  const correctOptionCount = content.options.reduce(
    (count, _option, index) =>
      isOptionCorrect(currentAnswer, index) ? count + 1 : count,
    0,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Quiz Builder</p>
            <p className="text-xs text-slate-500">
              Add your question, options, and mark the correct answers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              {content.options.length} option
              {content.options.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800">
              {correctOptionCount} correct
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3 md:p-4">
        <div className="space-y-1.5">
          <Label
            htmlFor={`${currentSection}-question`}
            className="text-sm font-semibold text-slate-900"
          >
            Question
          </Label>
          <Textarea
            ref={questionAreaRef}
            id={`${currentSection}-question`}
            placeholder="Type the quiz question..."
            className="min-h-16 resize-none border-slate-200 bg-white"
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-900">
              Answer Options
            </Label>
            <Button
              onClick={addOption}
              size="sm"
              variant="outline"
              disabled={content.options.length >= MAX_OPTIONS}
              className="h-8 border-slate-300 bg-white px-2.5 text-xs hover:bg-slate-50"
            >
              {content.options.length >= MAX_OPTIONS
                ? `Max ${MAX_OPTIONS} options`
                : '+ Add option'}
            </Button>
          </div>

          <div className="space-y-2">
            {content.options.length === 0 ? (
              <div className="text-muted-foreground flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 py-6 text-sm">
                Add options to start building this quiz.
              </div>
            ) : (
              content.options.map((_option, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-700">
                    {getOptionLabel(index)}
                  </div>

                  <Textarea
                    ref={getOptionRef(index)}
                    id={`${currentSection}-option-${index}`}
                    rows={1}
                    className="h-9 min-h-9 flex-1 resize-none border-slate-200 bg-slate-50/60"
                  />

                  <label
                    htmlFor={`${currentSection}-option-${index}-correct`}
                    className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Checkbox
                      id={`${currentSection}-option-${index}-correct`}
                      checked={isOptionCorrect(currentAnswer, index)}
                      className="mr-2"
                      onCheckedChange={() => {
                        const newAnswer = toggleOptionCorrect(currentAnswer, index);
                        quizContent.set('answer', newAnswer);
                      }}
                    />
                    Correct
                  </label>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteOption(index)}
                    className="size-8 shrink-0 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <XIcon />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
