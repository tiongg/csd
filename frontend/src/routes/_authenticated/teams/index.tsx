import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Users, Edit } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/teams/')({
  component: TeamsPage,
});

function TeamsPage() {
  const { user } = useAuth();
  
  const { data: teams, isLoading } = useApiQuery('get', '/api/teams/', {});

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Collaborate with your team on courses
          </p>
        </div>
        <Button asChild>
          <Link to="/teams/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      {/* Teams Grid */}
      {!teams || teams.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first team to start collaborating
          </p>
          <Button asChild>
            <Link to="/teams/create">Create Team</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {team.description || 'No description'}
                  </p>
                </div>
                {team.ownerId === user?.id && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link to="/teams/$teamId" params={{ teamId: team.id }}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Users className="h-4 w-4" />
                <span>{team.members?.length || 0} members</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/teams/$teamId" params={{ teamId: team.id }}>
                    View Team
                  </Link>
                </Button>
              </div>

              {team.ownerId === user?.id && (
                <div className="mt-2 text-xs text-muted-foreground">
                  You are the owner
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}