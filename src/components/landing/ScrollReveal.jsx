import { motion, useReducedMotion } from 'framer-motion';

export default function ScrollReveal({ children, className, id, delay = 0 }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: reduceMotion ? 0 : 0.58, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
