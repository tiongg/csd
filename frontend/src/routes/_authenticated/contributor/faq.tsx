import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/contributor/faq')({
  component: RouteComponent,
});

const items = [
  {
    value: 'scope',
    trigger: 'What is a Contributor allowed to do?',
    content:
      'Contributors typically create and edit content (lessons, quizzes, resources), but may need Admin approval to publish courses',
  },
  {
    value: 'drafts',
    trigger: 'How do drafts and publishing work?',
    content:
      'Work in Draft, submit for Review, then it becomes Published once approved. Published content is what learners see.',
  },
  {
    value: 'team',
    trigger: 'Can i work on the course with my teammates?',
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
    <PageWithSideBar className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex h-full w-full flex-col items-center justify-center gap-8">
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
          <p className="text-center">If there are any other questions</p>
          <a
            href="mailto:tg.tan.2024@computing.smu.edu.sg"
            className="m-auto max-w-lg rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Contact Us
          </a>
        </div>
      </div>
    </PageWithSideBar>
  );
}
