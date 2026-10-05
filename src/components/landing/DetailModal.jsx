import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';

export default function DetailModal({ item, category, description, closeLabel, quoteLabel, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!item) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-gray-950/65 p-5 backdrop-blur-sm max-[600px]:items-end max-[600px]:p-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={event => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.article
            key={item.title}
            className="relative grid w-full max-w-[880px] overflow-hidden rounded-xl bg-white shadow-2xl sm:grid-cols-2 max-[600px]:max-h-[92vh] max-[600px]:grid-cols-1 max-[600px]:overflow-y-auto max-[600px]:rounded-t-2xl"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 330, damping: 29 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-modal-title"
            aria-describedby="detail-modal-description"
          >
            <div className="relative min-h-[420px] bg-gray-200 max-[600px]:min-h-0 max-[600px]:h-[240px]">
              <img className="absolute inset-0 size-full object-cover" src={item.image} alt={item.alt || item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/45 to-transparent" />
              <span className="absolute bottom-5 left-5 bg-black/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-white">{category}</span>
            </div>
            <div className="relative flex min-h-[420px] flex-col justify-center p-10 max-[700px]:p-7 max-[600px]:min-h-0 max-[600px]:p-6">
              <button
                ref={closeButtonRef}
                className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <X size={18} />
              </button>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-violet-600">Imoka Technology</p>
              <h2 id="detail-modal-title" className="mb-4 pr-8 text-4xl font-bold leading-[.95] text-gray-950 [font-family:'Barlow_Condensed',sans-serif] max-[600px]:text-3xl">{item.title}</h2>
              <p id="detail-modal-description" className="mb-8 max-w-md text-sm leading-7 text-gray-600">{description}</p>
              <a
                className="inline-flex min-h-12 w-fit items-center gap-3 rounded-md bg-violet-600 px-5 text-xs font-bold uppercase text-white no-underline transition-colors hover:bg-violet-700"
                href="#contact"
                onClick={onClose}
              >
                {quoteLabel}<ArrowUpRight size={16} />
              </a>
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
