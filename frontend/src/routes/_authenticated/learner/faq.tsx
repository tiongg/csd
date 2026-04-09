import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PageWithNavBar from '@/components/wrappers/PageWithNavBar';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Heading1 } from '@/components/ui/typography';

export const Route = createFileRoute('/_authenticated/learner/faq')({
  component: RouteComponent,
});

const items = [
  {
    value: 'courses',
    trigger: 'How do I enroll in a course?',
    content: 'Go to Courses, select a course, click Enroll/Join.',
  },
  {
    value: 'loading',
    trigger: 'Videos/resources won’t load, how do I fix it?',
    content:
      'Try: refresh page, switch browser (Chrome/Edge), disable extensions/ad-blockers, clear cache, check Wi-Fi, and re-login. If they still do not load, contact us with the error message and screenshot.',
  },
  {
    value: 'privacy',
    trigger: 'How is my data used?',
    content:
      'Typically, your activity (progress, scores, completion) is tracked for learning purposes. Only authorized roles (Admin) can see detailed reports.',
  },
  {
    value: 'progress',
    trigger: 'Where do I see my progress?',
    content:
      'Go to Dashboard to view progress bars, completed modules, and what’s next.',
  },
];

function RouteComponent() {
  return (
    <PageWithNavBar className="min-h-[calc(100vh-52px)] px-4 py-6 md:px-8 md:py-10 bg-slate-100/70">
      <div className="flex h-full w-full flex-col items-center justify-center gap-8">
        <Heading1>
          Learner - Frequently Asked Questions
        </Heading1>
        <Accordion
          type="multiple"
          className="w-full max-w-xl"
          defaultValue={['notifications']}
        >
          {items.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger className='cursor-pointer'>{item.trigger}</AccordionTrigger>
              <AccordionContent>{item.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex flex-col space-y-4">
          <p className="text-center">If you have any other questions</p>
          <Button asChild className='hover:bg-sky-700'>
            <a
              href="mailto:tg.tan.2024@computing.smu.edu.sg"
            >
              Contact Us
            </a>
          </Button>
        </div>
      </div>
    </PageWithNavBar>
  );
}

