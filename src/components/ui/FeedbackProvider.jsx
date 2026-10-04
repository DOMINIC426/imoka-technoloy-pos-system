import { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, CircleHelp, Info, X } from 'lucide-react';

const FeedbackContext = createContext(null);

export function confirmAction({ title = 'Are you sure?', message, confirmLabel = 'Confirm', destructive = false }) {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent('imoka:feedback', { detail: { kind: 'confirm', title, message, confirmLabel, destructive, resolve } })));
}

export function showNotice(message, kind = 'success') {
  window.dispatchEvent(new CustomEvent('imoka:feedback', { detail: { kind: 'notice', message, noticeKind: kind } }));
}

export function FeedbackProvider({ children }) {
  const [current, setCurrent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const receive = event => {
      const feedback = event.detail;
      if (feedback.kind === 'notice') {
        const id = `${Date.now()}-${Math.random()}`;
        setNotices(items => [...items, { ...feedback, id }]);
        window.setTimeout(() => setNotices(items => items.filter(item => item.id !== id)), 3600);
      } else {
        setQueue(items => [...items, feedback]);
      }
    };
    window.addEventListener('imoka:feedback', receive);
    return () => window.removeEventListener('imoka:feedback', receive);
  }, []);

  useEffect(() => {
    if (!current && queue.length) {
      setCurrent(queue[0]);
      setQueue(items => items.slice(1));
    }
  }, [current, queue]);
  function resolveConfirmation(answer) {
    current?.resolve(answer);
    setCurrent(null);
  }

  useEffect(() => {
    if (!current) return undefined;
    const onKeyDown = event => {
      if (event.key === 'Escape') resolveConfirmation(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current]);

  return (
    <FeedbackContext.Provider value={{ confirm: confirmAction, notify: showNotice }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] grid w-[min(380px,calc(100%-32px))] gap-2" aria-live="polite">
        <AnimatePresence initial={false}>
          {notices.map(notice => {
            const Icon = notice.noticeKind === 'error' ? AlertTriangle : notice.noticeKind === 'info' ? Info : Check;
            const style = notice.noticeKind === 'error' ? 'border-rose-200 bg-white text-rose-800' : notice.noticeKind === 'info' ? 'border-emerald-200 bg-white text-emerald-900' : 'border-emerald-200 bg-white text-emerald-900';
            return <motion.div key={notice.id} initial={{ opacity: 0, y: -12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className={`pointer-events-auto flex items-start gap-3 border px-4 py-3 shadow-[0_16px_45px_rgba(13,41,34,0.18)] ${style}`}><Icon className="mt-0.5 shrink-0" size={17} /><p className="m-0 flex-1 text-sm leading-5">{notice.message}</p><button className="grid size-6 place-items-center text-current/60 hover:text-current" type="button" aria-label="Dismiss notification" onClick={() => setNotices(items => items.filter(item => item.id !== notice.id))}><X size={15} /></button></motion.div>;
          })}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {current && <motion.div className="fixed inset-0 z-[110] grid place-items-center bg-[#0d2922]/35 p-4 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => { if (event.target === event.currentTarget) resolveConfirmation(false); }}>
          <motion.section role="alertdialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-message" initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} className="w-full max-w-[420px] border border-white/70 bg-white p-6 shadow-[0_28px_90px_rgba(9,32,26,0.3)]">
            <div className={`grid size-11 place-items-center ${current.destructive ? 'bg-rose-50 text-rose-700' : 'bg-[#e3eee7] text-[#174e46]'}`}><CircleHelp size={21} /></div>
            <h2 id="feedback-title" className="mt-4 text-xl font-semibold text-gray-900">{current.title}</h2>
            <p id="feedback-message" className="mt-2 text-sm leading-6 text-gray-600">{current.message}</p>
            <div className="mt-6 flex justify-end gap-2"><button className="h-10 border border-gray-300 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50" type="button" onClick={() => resolveConfirmation(false)}>Cancel</button><button className={`h-10 px-4 text-sm font-semibold text-white transition-colors ${current.destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#174e46] hover:bg-[#23665a]'}`} type="button" onClick={() => resolveConfirmation(true)}>{current.confirmLabel}</button></div>
          </motion.section>
        </motion.div>}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext) || { confirm: confirmAction, notify: showNotice };
}
