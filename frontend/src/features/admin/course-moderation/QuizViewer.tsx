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
    <Card className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50/70 px-5 py-3">
        <div className="mb-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-md border-slate-300 bg-white text-[11px] tracking-wide text-slate-600 uppercase"
          >
            Quiz
          </Badge>
        </div>
        <CardTitle className="text-lg text-slate-900">{quiz.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 md:p-5">
        {quiz.options.map((option, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3',
              isOptionCorrect(quiz.answer, index)
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 bg-white',
            )}
          >
            <Checkbox
              checked={isOptionCorrect(quiz.answer, index)}
              disabled
              className={cn(
                'border-slate-400',
                isOptionCorrect(quiz.answer, index) &&
                  'border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white',
              )}
            />
            <Label className="flex-1 text-sm text-slate-800">{option}</Label>
            {isOptionCorrect(quiz.answer, index) && (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
