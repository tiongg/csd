import SearchBar from '@/components/ui/searchbar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useApiQuery } from '@/lib/fetch-client';

function AllAdminRows() {
  const { data: admins, isLoading: isLoadingAdmins } = useApiQuery(
    'get',
    '/api/admins/',
  );
  if (isLoadingAdmins) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          Loading...
        </TableCell>
      </TableRow>
    );
  }

  if (!admins || admins.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="text-center">
          No Admins.
        </TableCell>
      </TableRow>
    );
  }

  return admins.map(({ username, email, id }) => (
    <TableRow key={id}>
      <TableCell>{username}</TableCell>
      <TableCell>{email}</TableCell>
      <TableCell>
        <XMarkIcon className="size-5 cursor-pointer" />
      </TableCell>
    </TableRow>
  ));
}

export default function AllAdminsList() {
  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex w-full justify-end gap-x-2">
        <SearchBar placeholder="Search for Admins" />
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
          <AllAdminRows />
        </TableBody>
      </Table>
    </div>
  );
}
