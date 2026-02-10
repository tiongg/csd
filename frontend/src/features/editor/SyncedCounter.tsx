import { Button } from '@/components/ui/button';
import { useContentEditor } from '@/context/ContentEditorContext';
import { useY } from 'react-yjs';

// Temp component to demonstrate synced counter
export default function SyncedCounter() {
  const { doc } = useContentEditor();
  const count = useY(doc.getMap<number>('counter'));

  const increment = () => {
    doc.transact(() => {
      const counterMap = doc.getMap<number>('counter');
      const current = counterMap.get('count') ?? 0;
      counterMap.set('count', current + 1);
    });
  };

  const decrement = () => {
    doc.transact(() => {
      const counterMap = doc.getMap<number>('counter');
      const current = counterMap.get('count') ?? 0;
      counterMap.set('count', current - 1);
    });
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <Button onClick={decrement}>-</Button>
      <span>Count: {count['count']}</span>
      <Button onClick={increment}>+</Button>
    </div>
  );
}
