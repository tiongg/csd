import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { type QuizContent } from '@/lib/content.type';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

type QuizViewerProps = {
  quiz: QuizContent;
};

function isOptionCorrect(answer: number, index: number): boolean {
  return (answer & (1 << index)) !== 0;
}

export default function QuizViewer({ quiz }: QuizViewerProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary">Quiz</Badge>
        </div>
        <CardTitle className="text-xl">{quiz.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quiz.options.map((option, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 rounded-lg border-2 p-4',
              isOptionCorrect(quiz.answer, index)
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-border',
            )}
          >
            <Checkbox
              checked={isOptionCorrect(quiz.answer, index)}
              disabled
              className={cn(
                'border-slate-800',
                isOptionCorrect(quiz.answer, index) &&
                  'border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white',
              )}
            />
            <Label className="flex-1 text-base">{option}</Label>
            {isOptionCorrect(quiz.answer, index) && (
              <CheckCircle2 className="size-5 shrink-0 text-green-500" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
