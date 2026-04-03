import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { useApiQuery } from '@/lib/fetch-client';
import { AdminTable } from './AdminTable';

type PendingContributorsFormProps = {
  selectedUuids: Set<string>;
  setSelected: (uuid: string, checked: boolean) => void;
};

type PendingContributor = {
  id: string;
  username: string;
  email: string;
  realname?: string | null;
};

function PendingApplicationRows({
  applications,
  selectedUuids,
  setSelected,
}: PendingContributorsFormProps & { applications: PendingContributor[] }) {
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
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/70 py-10 text-center text-slate-500">
        Loading applications...
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="flex min-h-[28rem] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/55 p-8 text-center text-slate-500">
        <p className="text-base font-semibold text-slate-700">
          No pending applications
        </p>
      </div>
    );
  }

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
          applications={applications}
          selectedUuids={selectedUuids}
          setSelected={setSelected}
        />
      </AdminTable>
    </div>
  );
}
