import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function TextReveal({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const text = children;
  const words = typeof text === 'string' ? text.split(' ') : [text];

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {typeof text === 'string' ? (
        words.map((word, index) => (
          <motion.span
            variants={child}
            key={index}
            className="inline-block mr-1"
          >
            {word}
          </motion.span>
        ))
      ) : (
        <motion.span variants={child}>{children}</motion.span>
      )}
    </motion.div>
  );
}
