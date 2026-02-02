import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contributor/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/contributor/dashboard"!</div>
}
