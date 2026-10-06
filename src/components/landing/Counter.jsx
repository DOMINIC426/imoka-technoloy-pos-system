import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

function Counter({ end, duration = 2, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTime;
      const animateCount = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentCount = Math.floor(progress * end);
        setCount(currentCount);
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(animateCount);
    }
  }, [isInView, end, duration]);

  return (
    <motion.span ref={ref} initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.5 }}>
      {count}{suffix}
    </motion.span>
  );
}

export default function StatsSection() {
  return (
    <section className="bg-gray-900 py-20 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
        <div className="text-center">
          <h3 className="text-4xl font-bold text-blue-400 md:text-5xl">
            <Counter end={500} suffix="+" />
          </h3>
          <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">Projects</p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl font-bold text-blue-400 md:text-5xl">
            <Counter end={100} suffix="+" />
          </h3>
          <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">Clients</p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl font-bold text-blue-400 md:text-5xl">
            <Counter end={5} suffix="+" />
          </h3>
          <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">Years</p>
        </div>
        <div className="text-center">
          <h3 className="text-4xl font-bold text-blue-400 md:text-5xl">
            <Counter end={24} suffix="/7" />
          </h3>
          <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">Support</p>
        </div>
      </div>
    </section>
  );
}
