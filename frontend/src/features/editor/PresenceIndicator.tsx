import { useContentEditor } from '@/context/ContentEditorContext';
import { useEffect, useState } from 'react';

type AwarenessState = {
  user: {
    name: string;
    color: string;
  };
};

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export default function PresenceIndicator() {
  const { provider } = useContentEditor();
  const [users, setUsers] = useState<AwarenessState[]>([]);

  useEffect(() => {
    const updateUsers = () => {
      const states = Array.from(
        provider.awareness.getStates().values(),
      ) as AwarenessState[];
      setUsers(states);
    };
    updateUsers();

    provider.awareness.on('change', updateUsers);

    return () => {
      provider.awareness.off('change', updateUsers);
    };
  }, [provider]);

  if (users.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="bg-background/90 border-border flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-md backdrop-blur-sm">
        <div className="flex -space-x-2">
          {users.slice(0, 4).map((state, index) => (
            <div
              key={index}
              className="ring-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white ring-2"
              style={{ backgroundColor: state.user.color }}
              title={state.user.name}
            >
              {getInitial(state.user.name)}
            </div>
          ))}
          {users.length > 4 && (
            <div className="bg-muted text-muted-foreground ring-background flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ring-2">
              +{users.length - 4}
            </div>
          )}
        </div>
        <span className="text-muted-foreground text-sm">
          {users.length} {users.length === 1 ? 'editor' : 'editors'}
        </span>
      </div>
    </div>
  );
}
