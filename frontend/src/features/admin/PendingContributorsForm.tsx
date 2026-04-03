import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { useApiQuery } from '@/lib/fetch-client';
import { AdminTable, AdminTableMessageRow } from './AdminTable';

type PendingContributorsFormProps = {
  selectedUuids: Set<string>;
  setSelected: (uuid: string, checked: boolean) => void;
};

function PendingApplicationRows({
  selectedUuids,
  setSelected,
}: PendingContributorsFormProps) {
  const { data: applications, isLoading: isLoadingApplications } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {
      params: {
        query: {},
      },
    },
  );

  if (isLoadingApplications) {
    return <AdminTableMessageRow colSpan={4} message="Loading..." />;
  }

  if (!applications || applications.length === 0) {
    return (
      <AdminTableMessageRow colSpan={4} message="No pending applications." />
    );
  }

  return applications.map(({ username, email, realname, id }) => (
    <TableRow key={id} className="bg-transparent">
      <TableCell className="px-4 py-3">
        <Checkbox
          className="border-slate-800"
          checked={selectedUuids.has(id)}
          onCheckedChange={(value) => setSelected(id, value === true)}
        />
      </TableCell>
      <TableCell className="px-4 py-3 font-medium text-slate-800">
        {username}
      </TableCell>
      <TableCell className="px-4 py-3 text-slate-600">{email}</TableCell>
      <TableCell className="px-4 py-3 text-slate-600">
        {realname ?? '-'}
      </TableCell>
    </TableRow>
  ));
}

export default function PendingContributorsForm({
  selectedUuids,
  setSelected,
}: PendingContributorsFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <AdminTable
        columns={[
          { label: '', className: 'w-[12%]' },
          { label: 'Username', className: 'w-[28%]' },
          { label: 'Email', className: 'w-[36%]' },
          { label: 'Name', className: 'w-[24%]' },
        ]}
      >
        <PendingApplicationRows
          selectedUuids={selectedUuids}
          setSelected={setSelected}
        />
      </AdminTable>
    </div>
  );
}
