import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
  useContentEditor,
  type QuizContentMap,
} from '@/context/ContentEditorContext';
import { useYArrayTextBindings } from '@/hooks/useYArrayTextBindings';
import useYArrayObserver from '@/hooks/useYObserver';
import { generateColorFromString, hexToRgb } from '@/lib/utils';
import { TextAreaBinding, type TextAreaBindingOptions } from '@/lib/y-textarea';
import { useEffect, useMemo, useRef } from 'react';
import { useY } from 'react-yjs';
import * as Y from 'yjs';

type QuizSectionEditorProps = {
  quizContent: QuizContentMap;
};

// Same as QuizContentMap but with plain JS types
// useY Hook converts into json types for us
type QuizContent = {
  question: string;
  options: string[];
  answer: number; // Bit flags for correct options
};

export default function QuizSectionEditor({
  quizContent,
}: QuizSectionEditorProps) {
  const { provider, currentSection } = useContentEditor();
  const { user } = useAuth();
  const questionAreaRef = useRef<HTMLTextAreaElement>(null);

  // useY returns a Y.Map converted to plain JS object, but the types don't reflect that, so we need to cast it
  const content = useY(quizContent) as unknown as QuizContent;
  const options = useYArrayObserver(
    quizContent.get('options')!,
    (option) => option,
  );

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

  // Options bindings using custom hook
  const { getRef: getOptionRef } = useYArrayTextBindings(
    quizContent.get('options')!,
    bindingConfig,
  );

  return (
    <div>
      <p>Quiz editor</p>
      <Textarea ref={questionAreaRef} id={`${currentSection}-question`} />
      <p>Options</p>
      <Button
        onClick={() => {
          const options = quizContent.get('options')!;
          options.push([new Y.Text()]);
        }}
      >
        + Add option
      </Button>
      {options.map((_option, index: number) => {
        const currentAnswer = content['answer'] ?? 0;
        const isCorrect = (currentAnswer & (1 << index)) !== 0;

        return (
          <div key={index} className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={isCorrect}
              className="mt-2"
              onChange={() => {
                const newAnswer = isCorrect
                  ? currentAnswer & ~(1 << index)
                  : currentAnswer | (1 << index);
                quizContent.set('answer', newAnswer);
              }}
            />
            <Textarea
              ref={getOptionRef(index)}
              id={`${currentSection}-option-${index}`}
            />
            <Button
              variant="destructive"
              onClick={() => {
                quizContent.get('options')!.delete(index, 1);
              }}
            >
              Delete
            </Button>
          </div>
        );
      })}
    </div>
  );
}
