import SearchBar from '@/components/ui/searchbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heading1 } from '@/components/ui/typography';
import { PencilIcon } from '@heroicons/react/24/outline';
import PendingContributorsForm from './PendingContributorsForm';
import AllAdminsList from './AllAdminsList';

// placeholders

const users = [
  {
    name: 'Joey',
    email: 'joey@email.com',
  },
];

export default function UserManagementForm() {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-16">
      <div>
        <Heading1>User Management</Heading1>
        <p className="font-subtitle">Here's what's happening today!</p>
      </div>

      <div className="text-slate-800">
        <Tabs defaultValue="pending">
          <TabsList variant="line">
            <TabsTrigger value="pending" className="cursor-pointer">
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="admins" className="cursor-pointer">
              All Admins
            </TabsTrigger>
            <TabsTrigger value="users" className="cursor-pointer">
              All Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingContributorsForm />
          </TabsContent>

          <TabsContent value="admins">
            <AllAdminsList />
          </TabsContent>

          <TabsContent value="users">
            <AllUsers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AllUsers() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <SearchBar placeholder="Search for Users" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-2/6">Name</TableHead>
            <TableHead className="w-3/6">Email</TableHead>
            <TableHead className="w-1/6"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map(({ name, email }) => (
            <TableRow key={email}>
              <TableCell>{name}</TableCell>
              <TableCell>{email}</TableCell>
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
