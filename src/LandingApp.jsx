import { useEffect, useState } from 'react';
import PosApp from './App.jsx';
import LandingPage from './components/landing/LandingPage.jsx';

export default function LandingApp() {
  const [showPos, setShowPos] = useState(() => window.location.hash === '#pos');

  useEffect(() => {
    const syncRoute = () => setShowPos(window.location.hash === '#pos');
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    if (showPos) window.scrollTo(0, 0);
  }, [showPos]);

  return showPos ? <PosApp /> : <LandingPage />;
}
