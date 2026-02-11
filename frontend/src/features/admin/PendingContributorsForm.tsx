import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApiQuery } from '@/lib/fetch-client';

function PendingApplicationRows() {
  const { data: applications, isLoading: isLoadingApplications } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
  );

  if (isLoadingApplications) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          No pending applications.
        </TableCell>
      </TableRow>
    );
  }

  return applications.map(({ username, email }) => (
    <TableRow key={email}>
      <TableCell>
        <Checkbox className="border-slate-800" />
      </TableCell>
      <TableCell>{username}</TableCell>
      <TableCell>{email}</TableCell>
    </TableRow>
  ));
}

export default function PendingContributorsForm() {
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
          Delete
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/6"></TableHead>
            <TableHead className="w-2/6">Name</TableHead>
            <TableHead className="w-3/6">Email</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <PendingApplicationRows />
        </TableBody>
      </Table>
    </div>
  );
}
