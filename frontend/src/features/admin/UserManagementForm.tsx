import { Button } from '@/components/ui/button';
import SearchBar from '@/components/ui/searchbar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { Heading1 } from '@/components/ui/typography';
import { useAuth, type AccountRole } from '@/context/AuthContext';
import {
  apiQueryOptions,
  useApiMutation,
  useApiQuery,
} from '@/lib/fetch-client';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import ConfirmActionDialog from './ConfirmActionDialog';
import { AdminTable, AdminTableMessageRow } from './AdminTable';
import PendingContributorsForm from './PendingContributorsForm';

const glassPanelClass =
  'relative overflow-hidden rounded-2xl border border-white/75 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_18px_40px_-30px_rgba(15,23,42,0.5)] shadow-sm ring-1 shadow-slate-900/5 ring-slate-300/55 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-gradient-to-b before:from-white/50 before:to-transparent md:p-6';

type AdminTab = 'pending' | 'users';

type PendingRoleUpdate = {
  userId: string;
  username: string;
  nextRole: AccountRole;
};

export default function UserManagementForm() {
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUuids, setSelectedUuids] = useState(new Set<string>());
  const [pendingAction, setPendingAction] = useState<
    'approve' | 'reject' | null
  >(null);

  const tabTrackRef = useRef<HTMLDivElement | null>(null);
  const [tabPill, setTabPill] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [tabPillReady, setTabPillReady] = useState(false);

  const queryClient = useQueryClient();
  const { data: pendingApplications } = useApiQuery(
    'get',
    '/api/admins/contributor-applications',
    {
      params: {
        query: {},
      },
    },
  );
  const { data: allUsers } = useApiQuery('get', '/api/account/', {});

  const { mutateAsync: approveContributorsAsync, isPending: isApproving } =
    useApiMutation('post', '/api/admins/contributor-applications/approve', {
      onSuccess: async () => {
        toast.success('Approved contributor(s)');
        setSelectedUuids(new Set());
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions(
            'get',
            '/api/admins/contributor-applications',
          ).queryKey,
        });
      },
      onError: () => {
        toast.error('Failed to approve contributor(s)');
      },
    });

  const { mutateAsync: rejectContributorsAsync, isPending: isRejecting } =
    useApiMutation('post', '/api/admins/contributor-applications/reject', {
      onSuccess: async () => {
        toast.success('Rejected contributor(s)');
        setSelectedUuids(new Set());
        await queryClient.invalidateQueries({
          queryKey: apiQueryOptions(
            'get',
            '/api/admins/contributor-applications',
          ).queryKey,
        });
      },
      onError: () => {
        toast.error('Failed to reject contributor(s)');
      },
    });

  useLayoutEffect(() => {
    const updateTabPill = () => {
      const track = tabTrackRef.current;
      if (!track) return;

      const activeButton = track.querySelector(
        '[data-admin-tab-active="true"]',
      ) as HTMLElement | null;

      if (!activeButton) {
        setTabPill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const trackRect = track.getBoundingClientRect();
      const activeRect = activeButton.getBoundingClientRect();

      setTabPill({
        left: activeRect.left - trackRect.left,
        width: activeRect.width,
        opacity: 1,
      });
      setTabPillReady(true);
    };

    updateTabPill();
    const rafId = window.requestAnimationFrame(updateTabPill);
    window.addEventListener('resize', updateTabPill);
    const resizeObserver = new ResizeObserver(updateTabPill);
    if (tabTrackRef.current) {
      resizeObserver.observe(tabTrackRef.current);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateTabPill);
      resizeObserver.disconnect();
    };
  }, [activeTab]);

  useEffect(() => {
    // Warm course-moderation data to avoid first-switch jitter between admin pages.
    void queryClient.prefetchQuery(
      apiQueryOptions('get', '/api/content-versions/pending'),
    );
    void queryClient.prefetchQuery(apiQueryOptions('get', '/api/courses/published'));
  }, [queryClient]);

  function setSelected(uuid: string, checked: boolean) {
    setSelectedUuids((prev) =>
      checked
        ? new Set([...prev, uuid])
        : new Set([...prev].filter((x) => x !== uuid)),
    );
  }

  async function approveContributors() {
    const learnerUuids = [...selectedUuids];
    if (learnerUuids.length === 0) return;

    try {
      await approveContributorsAsync({
        body: { learnerUuids },
      });
      setPendingAction(null);
    } catch {
      return;
    }
  }

  async function rejectContributors() {
    const learnerUuids = [...selectedUuids];
    if (learnerUuids.length === 0) return;

    try {
      await rejectContributorsAsync({
        body: { learnerUuids },
      });
      setPendingAction(null);
    } catch {
      return;
    }
  }

  const isPendingAction = isApproving || isRejecting;
  const selectedCount = selectedUuids.size;
  const actionLabel = pendingAction === 'approve' ? 'Approve' : 'Reject';
  const pendingCountLabel =
    pendingApplications == null ? '...' : String(pendingApplications.length);
  const usersCountLabel = allUsers == null ? '...' : String(allUsers.length);

  return (
    <div className="flex min-h-0 w-full flex-1 bg-slate-100/70 p-6 md:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-5">
        <section className={glassPanelClass}>
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-sky-700 uppercase">
            Admin Console
          </div>
          <Heading1 className="mt-3 text-slate-900">User Management</Heading1>
          <p className="mt-2 text-sm text-slate-600">
            Review contributor requests and manage platform access for all
            users.
          </p>
        </section>

        <section className={cn(glassPanelClass, 'min-h-0 flex-1')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-lg border border-slate-300/80 bg-white/65 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_20px_-16px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div
                ref={tabTrackRef}
                className="relative inline-flex rounded-md border border-transparent bg-white/30 p-1 shadow-none backdrop-blur-xl"
              >
                <span
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute top-1 bottom-1 rounded-md border border-stone-400/45 bg-gradient-to-b from-white/92 via-slate-100/75 to-stone-200/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),inset_0_-1px_0_rgba(255,255,255,0.38),0_10px_24px_-12px_rgba(51,65,85,0.42)] backdrop-blur-2xl',
                    tabPillReady
                      ? 'transition-[left,width,opacity] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
                      : 'transition-none',
                  )}
                  style={{
                    width: `${tabPill.width}px`,
                    opacity: tabPill.opacity,
                    left: `${tabPill.left}px`,
                  }}
                />
                {(['pending', 'users'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    data-admin-tab-active={activeTab === tab}
                    className={cn(
                      'relative z-10 cursor-pointer rounded-md border border-transparent px-3 py-1.5 text-sm font-semibold transition-colors duration-240',
                      activeTab === tab
                        ? 'text-slate-900'
                        : 'text-slate-600 hover:text-slate-800',
                    )}
                    onClick={() => setActiveTab(tab)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span>{tab === 'pending' ? 'Pending Approvals' : 'All Users'}</span>
                      <span
                        className={cn(
                          'inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[11px] font-bold',
                          activeTab === tab
                            ? 'border-sky-600 bg-sky-600 text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-600',
                        )}
                      >
                        {tab === 'pending' ? pendingCountLabel : usersCountLabel}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'pending' ? (
              <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
                <div className="w-full sm:w-80">
                  <SearchBar
                    placeholder="Search users by name or email"
                    className="h-9 rounded-lg border-slate-300 bg-white/85"
                    onSearch={setUserSearchQuery}
                  />
                </div>
                <div className="flex items-center gap-x-2">
                  <Button
                    variant="default"
                    className="h-9 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                    disabled={selectedCount === 0 || isPendingAction}
                    onClick={() => setPendingAction('approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="h-9 rounded-lg"
                    disabled={selectedCount === 0 || isPendingAction}
                    onClick={() => setPendingAction('reject')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-80">
                <SearchBar
                  placeholder="Search users by name or email"
                  className="h-9 rounded-lg border-slate-300 bg-white/85"
                  onSearch={setUserSearchQuery}
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <div className={cn(activeTab === 'pending' ? 'block' : 'hidden')}>
              <PendingContributorsForm
                selectedUuids={selectedUuids}
                setSelected={setSelected}
                searchQuery={userSearchQuery}
              />
            </div>
            <div className={cn(activeTab === 'users' ? 'block' : 'hidden')}>
              <AllUsers searchQuery={userSearchQuery} />
            </div>
          </div>
        </section>
      </div>

      <ConfirmActionDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
          }
        }}
        title={`${actionLabel} Selected Applications`}
        description={`Are you sure you want to ${pendingAction ?? 'approve'} ${selectedCount} pending contributor application${selectedCount === 1 ? '' : 's'}?`}
        confirmLabel={actionLabel}
        variant={pendingAction === 'reject' ? 'destructive' : 'default'}
        isPending={isPendingAction}
        onConfirm={async () => {
          if (pendingAction === 'approve') {
            await approveContributors();
            return;
          }

          if (pendingAction === 'reject') {
            await rejectContributors();
          }
        }}
      />
    </div>
  );
}

function AllUsers({ searchQuery }: { searchQuery: string }) {
  const [pendingRoleUpdate, setPendingRoleUpdate] =
    useState<PendingRoleUpdate | null>(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading } = useApiQuery('get', '/api/account/', {});

  const filteredUsers = useMemo(
    () =>
      (users ?? [])
        .filter(
          (user) =>
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => {
          const aIsCurrentUser = a.id === currentUser?.id;
          const bIsCurrentUser = b.id === currentUser?.id;

          if (aIsCurrentUser === bIsCurrentUser) {
            return 0;
          }

          return aIsCurrentUser ? -1 : 1;
        }),
    [currentUser?.id, searchQuery, users],
  );

  const { mutate: updateRole, isPending: isUpdatingRole } = useApiMutation(
    'patch',
    '/api/account/{accountId}/role',
    {
      onSuccess: async () => {
        toast.success('Role updated successfully');
        setPendingRoleUpdate(null);
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: apiQueryOptions('get', '/api/account/').queryKey,
          }),
          queryClient.invalidateQueries({
            queryKey: apiQueryOptions(
              'get',
              '/api/admins/contributor-applications',
            ).queryKey,
          }),
        ]);
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          toast.error(err.message);
          return;
        }

        toast.error('Failed to update role');
      },
    },
  );

  const handleRoleChange = (userId: string, newRole: AccountRole) => {
    updateRole({
      params: { path: { accountId: userId } },
      body: { role: newRole },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminTable
        columns={[
          { label: 'Username', className: 'w-[20%]' },
          { label: 'Email', className: 'w-[35%]' },
          { label: 'Name', className: 'w-[20%]' },
          { label: 'Role', className: 'w-[25%]' },
        ]}
      >
        {isLoading ? (
          <AdminTableMessageRow colSpan={4} message="Loading users..." />
        ) : filteredUsers.length === 0 ? (
          <AdminTableMessageRow colSpan={4} message="No users found." />
        ) : (
          filteredUsers.map((user) => (
            <TableRow
              key={user.id}
              className={cn(
                'bg-transparent',
                user.id === currentUser?.id && 'bg-slate-50/70',
              )}
            >
              <TableCell className="px-4 py-3 font-medium text-slate-800">
                {user.username}
              </TableCell>
              <TableCell className="px-4 py-3 text-slate-600">
                {user.email}
              </TableCell>
              <TableCell className="px-4 py-3 text-slate-600">
                {user.realname ?? '-'}
              </TableCell>
              <TableCell className="px-4 py-3">
                <Select
                  value={user.role}
                  disabled={isUpdatingRole || user.id === currentUser?.id}
                  onValueChange={(value) => {
                    const nextRole = value as AccountRole;
                    if (nextRole === user.role) {
                      return;
                    }

                    setPendingRoleUpdate({
                      userId: user.id,
                      username: user.username,
                      nextRole,
                    });
                  }}
                >
                  <SelectTrigger className="h-9 w-full rounded-lg border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEARNER">Learner</SelectItem>
                    <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))
        )}
      </AdminTable>

      <ConfirmActionDialog
        open={pendingRoleUpdate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingRoleUpdate(null);
          }
        }}
        title="Confirm Role Change"
        description={
          pendingRoleUpdate
            ? `Change ${pendingRoleUpdate.username} to ${pendingRoleUpdate.nextRole.toLowerCase()}?`
            : ''
        }
        confirmLabel="Update Role"
        variant="default"
        isPending={isUpdatingRole}
        onConfirm={() => {
          if (!pendingRoleUpdate) {
            return;
          }

          handleRoleChange(
            pendingRoleUpdate.userId,
            pendingRoleUpdate.nextRole,
          );
        }}
      />
    </div>
  );
}
