import { Button } from '@/components/ui/button';
import { useApiQuery } from '@/lib/fetch-client';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { motion, type Variants } from 'framer-motion';
import { SkeletonCourseItem } from './PublishedCoursesCardSkeletons';

const itemVariants: Variants = {
  initial: { opacity: 0, y: 5 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};
export function PublishedCoursesCard() {
  const { data: courses, isLoading } = useApiQuery(
    'get',
    '/api/courses/published',
  );
  const publishedCourses = courses ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <p className="text-sm font-semibold text-slate-700">Now Available</p>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        {isLoading ? (
          <ul className="space-y-3">
            <SkeletonCourseItem />
            <SkeletonCourseItem />
            <SkeletonCourseItem />
          </ul>
        ) : publishedCourses.length > 0 ? (
          <ul className="space-y-3">
            {publishedCourses.slice(0, 3).map((course, index) => (
              <motion.li
                key={course.id}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {course.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    Updated {dayjs(course.updatedAt).fromNow()}
                  </p>
                </div>
                <span className="text-slate-400">↗</span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">No published courses yet.</p>
        )}
        <Button className="mt-4 rounded-lg" variant="outline" asChild>
          <Link to="/learner/my-courses">Go to my courses</Link>
        </Button>
      </div>
    </div>
  );
}
