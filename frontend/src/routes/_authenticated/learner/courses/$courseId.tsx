import { createFileRoute, useNavigate } from '@tanstack/react-router';
import PageWithSideBar from '@/components/wrappers/PageWithSideBar';
import CourseView from '@/features/learner/CourseView';
import { fetchClient } from '@/lib/fetch-client';
import { redirect } from '@tanstack/react-router';

/**
 * ROOT CAUSE (Bug 1 — Learner can't view courses):
 *
 * The old loader used:
 *   const response = await fetch(`/api/courses/${courseId}`)
 *
 * Two problems:
 * 1. Raw `fetch` has no base URL — it resolves relative to the Vite dev
 *    server origin (e.g. localhost:5173), not the backend (localhost:8080).
 *    The request never reaches Spring Boot.
 *
 * 2. Raw `fetch` carries no Authorization header. Even if the URL were correct
 *    the backend would return 401 because the JWT is not attached.
 *
 * Fix: use `fetchClient.GET('/api/courses/{id}', ...)` which is the same
 * openapi-fetch instance already configured with:
 *   - baseUrl: import.meta.env.VITE_BACKEND_URL
 *   - authMiddleware that sets `Authorization: Bearer <token>`
 *
 * Additionally, `useLoaderData()` was called without a `from` option.
 * TanStack Router infers the loader return type only when `from` matches the
 * route's ID string. Without it the type is `unknown` and the component
 * cannot safely destructure `course`.
 * Fix: use Route.useLoaderData() which is the typed, route-scoped version.
 */

export const Route = createFileRoute(
  '/_authenticated/learner/courses/$courseId',
)({
  component: RouteComponent,
  loader: async ({ params: { courseId } }) => {
    // ✅ Fix 1a: use fetchClient — correct base URL + auth headers
    const { data: course, error } = await fetchClient.GET('/api/courses/{id}', {
      params: { path: { id: courseId } },
    });

    if (!course || error) {
      throw redirect({ to: '/learner/discover' });
    }

    return { course };
  },
});

function RouteComponent() {
  const { courseId } = Route.useParams();
  // ✅ Fix 1b: Route.useLoaderData() — fully typed, no `from` needed
  const { course } = Route.useLoaderData();

  return (
    <PageWithSideBar>
      <CourseView courseId={courseId} course={course} />
    </PageWithSideBar>
  );
}