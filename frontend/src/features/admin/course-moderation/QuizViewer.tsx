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

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

export default function QuizViewer({ quiz }: QuizViewerProps) {
  const correctOptionCount = quiz.options.reduce(
    (count, _option, index) =>
      isOptionCorrect(quiz.answer, index) ? count + 1 : count,
    0,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Quiz</p>
            <p className="text-xs text-slate-500">
              Read-only preview of question and answer options.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
              {quiz.options.length} option{quiz.options.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800">
              {correctOptionCount} correct
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-3 md:p-4">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <Label className="text-sm font-semibold text-slate-900">Question</Label>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">
            {quiz.question}
          </p>
        </div>

        <div className="space-y-2.5">
          <Label className="text-sm font-semibold text-slate-900">
            Answer Options
          </Label>
          <div className="space-y-2">
            {quiz.options.map((option, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2',
                  isOptionCorrect(quiz.answer, index) &&
                    'border-emerald-300 bg-emerald-50/70',
                )}
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-xs font-semibold text-slate-700">
                  {getOptionLabel(index)}
                </div>
                <div className="h-9 flex-1 rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-800">
                  {option}
                </div>
                {isOptionCorrect(quiz.answer, index) && (
                  <span className="inline-flex h-9 shrink-0 items-center rounded-md border border-emerald-300 bg-emerald-100 px-2 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="mr-1.5 size-4 shrink-0 text-emerald-500" />
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
