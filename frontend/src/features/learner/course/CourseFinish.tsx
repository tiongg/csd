import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export default function CourseFinish() {
  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden">
      <div className="flex-1">
        <div className="mx-auto max-w-4xl p-8">
          <h2 className="text-2xl font-bold">Congratulations!</h2>
          <p className="mt-4 text-lg">
            You have completed the course. Great job on your learning journey!
          </p>
          <Button asChild>
            <Link to="/learner/my-courses" className="mt-6">
              Back to My Courses
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
