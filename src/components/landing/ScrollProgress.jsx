import { useEffect, useRef } from 'react';

export default function ScrollProgress() {
  const progressRef = useRef(null);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1) : 0;
        const progressBar = progressRef.current;

        if (progressBar) {
          progressBar.style.transform = `scaleX(${progress})`;
          progressBar.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
        }
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 bg-gray-900/20" role="progressbar" aria-label="Page reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <div ref={progressRef} className="h-full origin-left scale-x-0 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.75)]" />
    </div>
  );
}
