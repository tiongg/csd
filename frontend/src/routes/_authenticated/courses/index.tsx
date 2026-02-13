import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useApiQuery } from '@/lib/fetch-client';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, Plus, Edit } from 'lucide-react';

export const Route = createFileRoute('/_authenticated/courses/')({
  component: CoursesPage,
});

function CoursesPage() {
  const { user } = useAuth();
  
  const { data: courses, isLoading } = useApiQuery('get', '/api/courses/', {});

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage your learning content
          </p>
        </div>
        <Button asChild>
          <Link to="/courses/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Courses Grid */}
      {!courses || courses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first course to start teaching
          </p>
          <Button asChild>
            <Link to="/courses/create">Create Course</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {course.description || 'No description'}
                  </p>
                </div>
                {course.creatorId === user?.id && (
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    course.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/courses/$courseId" params={{ courseId: course.id }}>
                    View Course
                  </Link>
                </Button>
              </div>

              {course.creatorId === user?.id && (
                <div className="mt-2 text-xs text-muted-foreground">
                  You are the creator
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}