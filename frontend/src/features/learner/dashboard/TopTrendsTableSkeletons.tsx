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

export function SkeletonRow() {
  return (
    <tr className="border-t border-slate-200">
      <td className="px-4 py-3">
        <motion.div
          variants={skeletonVariants}
          animate="loading"
          className="h-4 w-8 rounded bg-slate-200"
        />
      </td>
      <td className="px-4 py-3">
        <motion.div
          variants={skeletonVariants}
          animate="loading"
          className="h-4 w-32 rounded bg-slate-200"
        />
      </td>
      <td className="px-4 py-3">
        <motion.div
          variants={skeletonVariants}
          animate="loading"
          className="h-6 w-16 rounded-full bg-slate-200"
        />
      </td>
    </tr>
  );
}
