import { PencilIcon } from '@heroicons/react/24/outline';
import { Heading1 } from '@/components/ui/typography';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import SearchBar from '@/components/ui/searchbar';

const pending = [
  {
    name: 'Skibidi Chungus and its meanings',
    creator: 'Xie Xiaofei',
  },
  {
    name: 'Know the latest trends',
    creator: 'Zhang Zhiyuan',
  },
  {
    name: 'Brainrot vs Bedrot',
    creator: 'Loh Kai Zhe',
  },
  {
    name: 'Punch the Monkey: Literally?',
    creator: 'Eng Kit Lum',
  },
];

const courses = [
  {
    name: 'How to say Six Seven',
    creator: 'Christoph Treude',
  },
  {
    name: 'Hawk Tuah for Chinese New Year',
    creator: 'Pius Lee',
  },
  {
    name: 'What NOT to say at festive gatherings',
    creator: 'Wang Jiwei',
  },
];

function PendingApprovals() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <Button variant="outline" className="w-24 cursor-pointer rounded-full">
          Approve
        </Button>
        <Button
          variant="destructive"
          className="w-24 cursor-pointer rounded-full"
        >
          Reject
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6"></TableHead>
            <TableHead className="w-3/6">Course Name</TableHead>
            <TableHead className="w-2/6">Creator</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {pending.map(({ name, creator }, i) => (
            <TableRow key={i}>
              <TableCell>
                <Checkbox className="border-slate-800" />
              </TableCell>
              <TableCell>{name}</TableCell>
              <TableCell>{creator}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AllAdmins() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <SearchBar placeholder="Search for Courses" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/6">Course Name</TableHead>
            <TableHead className="w-2/6">Creator</TableHead>
            <TableHead className="w-1/6"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {courses.map(({ name, creator }, i) => (
            <TableRow key={i}>
              <TableCell>{name}</TableCell>
              <TableCell>{creator}</TableCell>
              <TableCell>
                <PencilIcon className="size-5 cursor-pointer" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function CourseModerationForm() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>Course Moderation</Heading1>
        <p className="font-subtitle">Here's what's happening today!</p>
      </div>

      <div className="text-slate-800">
        <Tabs defaultValue="pending">
          <TabsList variant="line">
            <TabsTrigger value="pending" className="cursor-pointer">
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="courses" className="cursor-pointer">
              All Courses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingApprovals />
          </TabsContent>

          <TabsContent value="courses">
            <AllAdmins />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
