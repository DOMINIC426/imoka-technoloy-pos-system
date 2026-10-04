import { useEffect, useState } from 'react';
import PosApp from './App.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ChangePasswordPage from './components/landing/ChangePasswordPage.jsx';
import LoginPage from './components/landing/LoginPage.jsx';
import LandingPage from './components/landing/LandingPage.jsx';

export default function LandingApp() {
  const [route, setRoute] = useState('home');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('imoka_pos_user') || 'null'); }
    catch { return null; }
  });

  useEffect(() => {
    let active = true;
    const syncRoute = async () => {
      const target = window.location.hash.slice(1) || 'home';
      if (target !== 'pos' && target !== 'admin' && target !== 'change-password') {
        if (active) setRoute(target === 'login' ? 'login' : 'home');
        return;
      }

      const token = sessionStorage.getItem('imoka_pos_token');
      if (!token) {
        if (active) setRoute('login');
        if (window.location.hash !== '#login') window.location.hash = '#login';
        return;
      }

      try {
        const response = await fetch('/api/auth/session', { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok) throw new Error('Session expired.');
        const result = await response.json();
        const authorizedRoute = result.user.mustChangePassword ? 'change-password' : result.user.role === 'admin' ? 'admin' : 'pos';
        if (active) {
          setUser(result.user);
          setRoute(authorizedRoute);
        }
        if (target !== authorizedRoute) window.location.hash = `#${authorizedRoute}`;
      } catch {
        sessionStorage.removeItem('imoka_pos_token');
        sessionStorage.removeItem('imoka_pos_user');
        if (active) {
          setUser(null);
          setRoute('login');
        }
        if (window.location.hash !== '#login') window.location.hash = '#login';
      }
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => {
      active = false;
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (route === 'admin' && user?.role === 'admin') {
    const signOut = async () => {
      const token = sessionStorage.getItem('imoka_pos_token');
      try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); }
      finally {
        sessionStorage.removeItem('imoka_pos_token');
        sessionStorage.removeItem('imoka_pos_user');
        setUser(null);
        window.location.hash = '#login';
      }
    };
    return <AdminDashboard token={sessionStorage.getItem('imoka_pos_token')} user={user} onSignOut={signOut} />;
  }
  if (route === 'change-password' && user) {
    return <ChangePasswordPage onPasswordChanged={updatedUser => {
      sessionStorage.setItem('imoka_pos_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.location.hash = updatedUser.role === 'admin' ? '#admin' : '#pos';
    }} />;
  }
  if (route === 'pos') return <PosApp />;
  if (route === 'login') return <LoginPage />;
  return <LandingPage />;
}
