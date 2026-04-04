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

function isOptionCorrect(answer: number, index: number): boolean {
  return (answer & (1 << index)) !== 0;
}

function toggleOptionCorrect(answer: number, index: number): number {
  return isOptionCorrect(answer, index)
    ? answer & ~(1 << index)
    : answer | (1 << index);
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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
        <p className="text-sm font-semibold text-slate-800">Quiz Builder</p>
        <p className="text-xs text-slate-500">
          Add your question, options, and mark the correct answers.
        </p>
      </div>
      <div className="space-y-5 p-4 md:p-6">
        <div className="space-y-2">
          <Label
            htmlFor={`${currentSection}-question`}
            className="text-base font-semibold"
          >
            Question
          </Label>
          <Textarea
            ref={questionAreaRef}
            id={`${currentSection}-question`}
            placeholder="Enter your question..."
            className="min-h-24 resize-none border-slate-200 bg-slate-50/60"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Options</Label>
            <Button onClick={addOption} size="sm" variant="outline">
              + Add option
            </Button>
          </div>

          <div className="space-y-3">
            {content.options.length === 0 ? (
              <div className="text-muted-foreground flex items-center justify-center rounded-lg border border-dashed py-8 text-sm">
                No options yet.
              </div>
            ) : (
              content.options.map((_option, index) => (
                <div
                  key={index}
                  className="group hover:bg-muted/50 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-colors"
                >
                  <Checkbox
                    id={`${currentSection}-option-${index}-correct`}
                    checked={isOptionCorrect(currentAnswer, index)}
                    onCheckedChange={() => {
                      const newAnswer = toggleOptionCorrect(currentAnswer, index);
                      quizContent.set('answer', newAnswer);
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`${currentSection}-option-${index}-correct`}
                      className="text-muted-foreground text-xs"
                    >
                      Correct answer
                    </Label>
                    <Textarea
                      ref={getOptionRef(index)}
                      id={`${currentSection}-option-${index}`}
                      className="min-h-16 resize-none border-slate-200 bg-slate-50/60"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteOption(index)}
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
