import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/learner/faq')({
  component: RouteComponent,
});

const items = [
  {
    value: 'courses',
    trigger: 'How do I enroll in a course?',
    content: 'Go to Courses, select a course, click Enroll/Join',
  },
  {
    value: 'loading',
    trigger: 'Videos/resources won’t load, how do I fix it?',
    content:
      'Try: refresh page, switch browser (Chrome/Edge), disable extensions/ad-blockers, clear cache, check Wi-Fi, and re-login. If still failing, report the error message + screenshot',
  },
  {
    value: 'privacy',
    trigger: 'How is my data used?',
    content:
      'Typically: your activity (progress, scores, completion) is tracked for learning purposes. Only authorized roles (Admin) can see detailed reports.',
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
    <PageWithSideBar className="flex min-h-screen w-full">
      <div className="m-auto w-full">
        <Accordion
          type="multiple"
          className="mx-auto max-w-xl p-8"
          defaultValue={['notifications']}
        >
          {items.map((item) => (
            <AccordionItem key={item.value} value={item.value}>
              <AccordionTrigger>{item.trigger}</AccordionTrigger>
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
