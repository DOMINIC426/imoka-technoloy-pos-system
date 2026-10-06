import { motion } from 'framer-motion';

export default function GradientText({ children, className = '' }) {
  return (
    <motion.span
      className={`bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      animate={{
        backgroundPosition: ['0% center', '200% center', '0% center'],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear',
      }}
    >
      {children}
    </motion.span>
  );
}
