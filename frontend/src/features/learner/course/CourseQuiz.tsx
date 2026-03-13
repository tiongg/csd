import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import useCourseViewer from '@/context/CourseViewingContext';
import { type QuizContent } from '@/lib/content.type';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2, X, XCircle } from 'lucide-react';
import { useState } from 'react';

type CourseQuizProps = {
  quiz: QuizContent;
};

type OptionState = 'correct' | 'incorrect' | 'neutral';

type QuizOptionProps = {
  option: string;
  index: number;
  isSelected: boolean;
  isSubmitted: boolean;
  optionState: OptionState;
  onToggle: (index: number) => void;
};

function QuizOption({
  option,
  index,
  isSelected,
  isSubmitted,
  optionState,
  onToggle,
}: QuizOptionProps) {
  return (
    <div
      className={cn(
        'relative rounded-lg border-2 transition-all',
        optionState === 'correct' &&
          'border-green-500 bg-green-50 dark:bg-green-950/20',
        optionState === 'incorrect' &&
          'border-red-500 bg-red-50 dark:bg-red-950/20',
        optionState === 'neutral' && 'border-border hover:bg-muted/50',
        !isSubmitted && !isSelected && 'cursor-pointer',
      )}
      onClick={() => !isSubmitted && onToggle(index)}
    >
      <div className="flex items-center justify-center gap-3 p-4">
        <Checkbox
          id={`option-${index}`}
          checked={isSelected}
          disabled={isSubmitted}
          onCheckedChange={() => onToggle(index)}
          className={cn(
            optionState === 'correct' &&
              'border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white',
            optionState === 'incorrect' &&
              'border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white',
          )}
        />
        <Label
          htmlFor={`option-${index}`}
          className="flex-1 cursor-pointer text-base"
        >
          {option}
        </Label>
        {isSubmitted && optionState === 'correct' && (
          <CheckCircle2 className="size-5 shrink-0 text-green-500" />
        )}
        {isSubmitted && optionState === 'incorrect' && (
          <XCircle className="size-5 shrink-0 text-red-500" />
        )}
      </div>
    </div>
  );
}

function countSetBits(n: number) {
  let count = 0;
  while (n > 0) {
    count += n & 1;
    n >>= 1;
  }
  return count;
}

function CourseQuiz({ quiz }: CourseQuizProps) {
  const { setCanNavigate } = useCourseViewer();

  const [selectedAnswer, setSelectedAnswer] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const correctAnswer = quiz.answer;
  const isMultiSelect = countSetBits(correctAnswer) > 1;

  function handleOptionToggle(index: number) {
    if (isSubmitted) return;

    const bit = 1 << index;
    setSelectedAnswer((prev) => (isMultiSelect ? prev ^ bit : bit));
  }

  function handleSubmit() {
    if (selectedAnswer === 0) return;

    setIsCorrect(selectedAnswer === correctAnswer);
    setIsSubmitted(true);
    setCanNavigate(true);
  }

  function isOptionCorrect(index: number) {
    return (correctAnswer & (1 << index)) !== 0;
  }

  function isSelected(index: number) {
    return (selectedAnswer & (1 << index)) !== 0;
  }

  function getOptionState(index: number): OptionState {
    const optionIsCorrect = isOptionCorrect(index);
    const optionIsSelected = isSelected(index);

    if (!isSubmitted) return 'neutral';
    if (optionIsSelected && optionIsCorrect) return 'correct';
    if (optionIsSelected && !optionIsCorrect) return 'incorrect';
    if (!optionIsSelected && optionIsCorrect) return 'correct'; // Show missed correct answers

    return 'neutral';
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary">Quiz</Badge>
          {isMultiSelect ? (
            <Badge variant="outline" className="text-xs">
              Select all that apply
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Single choice
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl">{quiz.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {quiz.options.map((option, index) => (
            <QuizOption
              key={index}
              option={option}
              index={index}
              isSelected={isSelected(index)}
              isSubmitted={isSubmitted}
              optionState={getOptionState(index)}
              onToggle={handleOptionToggle}
            />
          ))}
        </div>

        {isSubmitted && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-4',
              isCorrect
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            )}
          >
            {isCorrect ? (
              <>
                <Check className="h-5 w-5" />
                <span className="font-medium">Correct! Well done!</span>
              </>
            ) : (
              <>
                <X className="h-5 w-5" />
                <span className="font-medium">Incorrect!</span>
              </>
            )}
          </div>
        )}

        {!isSubmitted && (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === 0}
            className="w-full"
            size="lg"
          >
            Submit Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default CourseQuiz;
