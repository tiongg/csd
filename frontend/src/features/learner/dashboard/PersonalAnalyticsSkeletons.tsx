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

export function SkeletonBar() {
  return (
    <div className="flex flex-1 flex-col items-center justify-end">
      <motion.div
        variants={skeletonVariants}
        animate="loading"
        className="w-full rounded-t bg-slate-200"
        style={{ height: '24px' }}
      />
      <div className="mt-1 h-3 w-2 rounded-sm bg-slate-200" />
    </div>
  );
}

export function SkeletonMetric() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2">
      <motion.div
        variants={skeletonVariants}
        animate="loading"
        className="h-3 w-16 rounded bg-slate-200"
      />
      <motion.div
        variants={skeletonVariants}
        animate="loading"
        className="mt-2 h-4 w-8 rounded bg-slate-200"
      />
    </div>
  );
}
