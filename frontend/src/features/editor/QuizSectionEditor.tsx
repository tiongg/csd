import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import {
  useContentEditor,
  type QuizContentMap,
} from '@/context/ContentEditorContext';
import useYArrayObserver from '@/hooks/useYObserver';
import { generateColorFromString, hexToRgb } from '@/lib/utils';
import { TextAreaBinding } from '@/lib/y-textarea';
import { useCallback, useEffect, useRef } from 'react';
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

  // Use a Map to store refs and their corresponding bindings
  const optionRefsMap = useRef<Map<number, HTMLTextAreaElement>>(new Map());
  const bindingsRef = useRef<Map<number, TextAreaBinding>>(new Map());

  const getOptionRef = useCallback((index: number) => {
    return (element: HTMLTextAreaElement | null) => {
      if (element) {
        optionRefsMap.current.set(index, element);
      } else {
        optionRefsMap.current.delete(index);
      }
    };
  }, []);

  // Question area binding
  useEffect(() => {
    if (!questionAreaRef.current) return;
    const textArea = questionAreaRef.current;

    const questionAreaBinding = new TextAreaBinding(
      quizContent.get('question')!,
      textArea,
      {
        awareness: provider.awareness,
        clientName: user?.username ?? 'Anonymous',
        color: hexToRgb(generateColorFromString(user?.username ?? 'Anonymous')),
      },
    );

    return () => {
      questionAreaBinding.destroy();
    };
  }, [provider, quizContent]);

  // Options bindings - watch for changes in options array
  useEffect(() => {
    const optionsArray = quizContent.get('options')!;
    const currentBindings = bindingsRef.current;
    const currentRefs = optionRefsMap.current;

    // Create bindings for any options that don't have one yet
    for (let i = 0; i < optionsArray.length; i++) {
      const optionText = optionsArray.get(i) as Y.Text;
      const ref = currentRefs.get(i);

      if (ref && !currentBindings.has(i)) {
        const binding = new TextAreaBinding(optionText, ref, {
          awareness: provider.awareness,
          clientName: user?.username ?? 'Anonymous',
          color: hexToRgb(
            generateColorFromString(user?.username ?? 'Anonymous'),
          ),
        });
        currentBindings.set(i, binding);
      }
    }

    // Clean up bindings for removed options
    const existingIndices = Array.from(currentBindings.keys());
    for (const index of existingIndices) {
      if (index >= optionsArray.length) {
        currentBindings.get(index)?.destroy();
        currentBindings.delete(index);
      }
    }

    // Clean up all bindings on unmount
    return () => {
      for (const binding of currentBindings.values()) {
        binding.destroy();
      }
      currentBindings.clear();
    };
  }, [provider, options]);

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
      {options.map((_option, index) => {
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
