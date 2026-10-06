import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  const handleDismiss = () => {
    setShowButton(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed === 'true') {
      setShowButton(false);
    }
  }, []);

  if (!showButton || !deferredPrompt) return null;

  return (
    <>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-8 z-50 max-w-[200px] rounded-lg bg-gray-900 px-4 py-3 text-white shadow-xl"
          >
            <p className="text-sm font-semibold">Install Our App</p>
            <p className="text-xs text-gray-300">Get the best experience!</p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={handleInstall}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="fixed bottom-24 right-8 z-50 grid size-14 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          aria-label="Install app"
        >
          <Download size={24} />
        </motion.button>
      </AnimatePresence>
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={handleDismiss}
            className="fixed bottom-24 right-24 z-50 grid size-6 place-items-center rounded-full bg-gray-700 text-white shadow-md transition-colors hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
            aria-label="Dismiss install button"
          >
            <X size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
