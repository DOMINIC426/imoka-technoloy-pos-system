import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function PWAInstallButton({ className = '' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // PWA not configured, do nothing silently
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <button
      onClick={handleInstall}
      className={`grid size-11 shrink-0 place-items-center rounded-full border border-yellow-300 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500 ${className}`}
      type="button"
      aria-label="Install app"
      title="Install Our App"
    >
      <Download size={18} className="text-gray-900" />
    </button>
  );
}
