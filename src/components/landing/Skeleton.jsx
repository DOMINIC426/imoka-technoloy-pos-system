import { motion } from 'framer-motion';

export default function Skeleton({ className = '' }) {
  return (
    <motion.div
      className={`bg-gray-200 animate-pulse ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
