import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/preference')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-1 w-full items-center justify-center">
      <p>Preferences page </p>
    </div>
  );
}
