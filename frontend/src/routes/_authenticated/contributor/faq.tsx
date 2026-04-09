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

export const Route = createFileRoute('/_authenticated/contributor/faq')({
  component: RouteComponent,
});

const items = [
  {
    value: 'scope',
    trigger: 'What is a Contributor allowed to do?',
    content:
      'Contributors typically create and edit content (lessons, quizzes, resources), but may need Admin approval to publish courses.',
  },
  {
    value: 'drafts',
    trigger: 'How do drafts and publishing work?',
    content:
      'Work in Draft, submit for Review, then it becomes Published once approved. Published content is what learners see.',
  },
  {
    value: 'team',
    trigger: 'Can I work on the course with my teammates?',
    content: 'Yes you can. In fact, we support real time collaboration!',
  },
  {
    value: 'data',
    trigger: 'How do I see how my content is performing?',
    content:
      'Go to Dashboard to get a quick overview of the courses that were created and the general popularity of your courses.',
  },
];

function RouteComponent() {
  return (
    <PageWithNavBar className="min-h-[calc(100vh-52px)] px-4 py-6 md:px-8 md:py-10 bg-slate-100/70">
      <div className="flex h-full w-full flex-col items-center justify-center gap-8">
        <Heading1>
          Contributor - Frequently Asked Questions
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

