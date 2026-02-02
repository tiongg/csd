import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/learner/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/learner/dashboard"!</div>
}
