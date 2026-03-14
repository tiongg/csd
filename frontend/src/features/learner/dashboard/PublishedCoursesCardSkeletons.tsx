import { motion, type Variants } from 'framer-motion';

const skeletonVariants: Variants = {
  loading: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export function SkeletonCourseItem() {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <div className="flex-1">
        <motion.div
          variants={skeletonVariants}
          animate="loading"
          className="mb-1.5 h-4 w-32 rounded bg-slate-200"
        />
        <motion.div
          variants={skeletonVariants}
          animate="loading"
          className="h-3 w-24 rounded bg-slate-200"
        />
      </div>
      <motion.div
        variants={skeletonVariants}
        animate="loading"
        className="h-4 w-4 rounded bg-slate-200"
      />
    </li>
  );
}
