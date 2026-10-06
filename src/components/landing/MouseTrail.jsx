import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MouseTrail() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const interval = setInterval(() => {
      setTrail(prev => {
        const newTrail = [...prev, mousePosition];
        if (newTrail.length > 8) newTrail.shift();
        return newTrail;
      });
    }, 50);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [mousePosition]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {trail.map((position, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-blue-500/20"
          style={{
            left: position.x - 8,
            top: position.y - 8,
            width: 16,
            height: 16,
          }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
