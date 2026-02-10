import { Input } from '@/components/ui/input';
import { useState } from 'react';
import PresenceIndicator from './PresenceIndicator';

export default function EditorHeader() {
  const [title, setTitle] = useState('Untitled Course');

  return (
    <header className="flex w-full items-center justify-between border-b p-4">
      <Input
        className="max-w-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Course title..."
      />
      <PresenceIndicator />
    </header>
  );
}
