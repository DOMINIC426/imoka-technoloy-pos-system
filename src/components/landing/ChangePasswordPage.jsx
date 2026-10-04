import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';

export default function ChangePasswordPage({ onPasswordChanged }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    if (newPassword.length < 10 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Use at least 10 characters with uppercase, lowercase and a number.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('imoka_pos_token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to change password.');
      onPasswordChanged(result.user);
    } catch (changeError) {
      setError(changeError.message || 'Unable to reach the password service. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#edf2ef] px-5 py-10 text-gray-900">
      <section className="w-full max-w-[480px] border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
        <span className="grid size-11 place-items-center bg-[#e3eee7] text-[#174e46]"><LockKeyhole size={20} /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#367c69]">One-time setup</p>
        <h1 className="mt-2 text-3xl font-semibold">Change your temporary password</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">Before you continue, replace the password provided by your administrator.</p>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm font-medium">Temporary password<input className="h-11 border border-gray-300 px-3 outline-none focus:border-[#367c69]" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></label>
          <label className="grid gap-1.5 text-sm font-medium">New password<input className="h-11 border border-gray-300 px-3 outline-none focus:border-[#367c69]" type="password" autoComplete="new-password" minLength={10} value={newPassword} onChange={event => setNewPassword(event.target.value)} required /><span className="text-xs font-normal text-gray-500">At least 10 characters, including uppercase, lowercase and a number.</span></label>
          <label className="grid gap-1.5 text-sm font-medium">Confirm new password<input className="h-11 border border-gray-300 px-3 outline-none focus:border-[#367c69]" type="password" autoComplete="new-password" minLength={10} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required /></label>
          {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
          <button className="mt-2 h-11 bg-[#174e46] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#23665a] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={saving}>{saving ? 'Updating password...' : 'Update password and continue'}</button>
        </form>
      </section>
    </main>
  );
}