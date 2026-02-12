import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/faq')({
  component: RouteComponent,
});

const items = [
  {
    value: 'addAdmin',
    trigger: 'How do i add an admin?',
    content:
      'Go to User Management -> All Users. Search for the user and assign them with the admin role by tapping on the pencil icon',
  },
  {
    value: 'deleteAdmin',
    trigger: 'How do I deactivate or remove an admin?',
    content:
      'Go to User Management -> All Admins. Search for the admin and remove the admin by tapping on the "X" icon',
  },
  {
    value: 'content',
    trigger: 'How do I approve content?',
    content:
      'Go to Course Management, you will be able to see all the courses that contributors wish to publish. Review the course content and select the appropriate actions.',
  },
  {
    value: 'roles',
    trigger: 'How do I switch between my roles?',
    content:
      'At the top of your screen, you should see a drop down to switch between your roles. If you wish to be take up some courses, feel free to do so!',
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
