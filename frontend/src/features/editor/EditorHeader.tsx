import { Input } from '@/components/ui/input';
import PresenceIndicator from './PresenceIndicator';

export default function EditorHeader() {
  return (
    <div className="flex w-full items-center justify-between p-2">
      {/* CANNOT be collaborative - Stored in db */}
      <Input className="w-sm" value="Title here" />
      <PresenceIndicator />
    </div>
  );
}
