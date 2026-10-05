import { useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { apiUrl } from '../../api.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PasswordResetPage() {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function requestCode(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailPattern.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(apiUrl('/api/auth/password-reset/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to request a reset code.');
      setEmail(normalizedEmail);
      setNotice(result.message || 'If an account with that email exists, a verification code has been sent.');
      setStep('reset');
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the password recovery service. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Enter the six-digit verification code.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    if (newPassword.length < 10 || !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Use at least 10 characters with uppercase, lowercase and a number.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/auth/password-reset/complete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim(), newPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to reset your password.');
      setStep('done');
      setNotice(result.message || 'Password reset successfully. Sign in with your new password.');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (resetError) {
      setError(resetError.message || 'Unable to reach the password recovery service. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f5f8] text-gray-900 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.82fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-gray-900 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <a className="inline-flex w-fit items-center gap-3 text-white no-underline" href="#home">
          <span className="grid size-11 place-items-center rounded-md bg-violet-600 text-xl font-bold text-white">I</span>
          <span><strong className="block text-lg tracking-wide">IMOKA</strong><small className="text-[10px] tracking-[.2em] text-white/70">TECHNOLOGY</small></span>
        </a>
        <div className="relative z-10 max-w-xl pb-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-violet-300">Account recovery</p>
          <h1 className="max-w-[540px] text-6xl font-semibold leading-[1.02] [font-family:'Barlow_Condensed',sans-serif]">A secure way back in.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">We’ll send a one-time verification code to the email address linked to your account.</p>
          <div className="mt-12 flex items-center gap-3 text-xs text-white/65"><span className="h-px w-10 bg-violet-400" /> IMOKA - KIWIRA, TANDALE</div>
        </div>
        <span className="text-xs text-white/55">© {new Date().getFullYear()} Imoka Technology</span>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-16 xl:px-24">
        <a className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:text-violet-700" href="#login"><ArrowLeft size={17} /> Back to sign in</a>
        <div className="mx-auto my-auto w-full max-w-[430px] py-12">
          {step === 'done' ? (
            <div className="text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-violet-50 text-violet-700"><ShieldCheck size={26} /></span>
              <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-[.16em] text-violet-700">Password updated</p>
              <h2 className="text-4xl font-semibold leading-tight [font-family:'Barlow_Condensed',sans-serif]">You’re ready to sign in</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">{notice}</p>
              <a className="mt-8 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-5 text-sm font-bold text-white no-underline transition-colors hover:bg-violet-700" href="#login">Back to sign in <ArrowRight size={17} /></a>
            </div>
          ) : (
            <>
              <span className="grid size-11 place-items-center rounded-md bg-violet-50 text-violet-700">{step === 'email' ? <Mail size={20} /> : <KeyRound size={20} />}</span>
              <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-[.16em] text-violet-700">Account recovery</p>
              <h2 className="text-4xl font-semibold leading-tight [font-family:'Barlow_Condensed',sans-serif]">{step === 'email' ? 'Forgot your password?' : 'Verify and set a new password'}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{step === 'email' ? 'Enter your account email. If it matches, we’ll send you a verification code.' : 'Enter the six-digit code sent to your email, then choose a new password.'}</p>

              {step === 'email' ? (
                <form className="mt-8 grid gap-5" onSubmit={requestCode} noValidate>
                  <label className="grid gap-2 text-sm font-semibold text-gray-800" htmlFor="reset-email">Email address<input className="h-12 rounded-md border border-gray-200 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" id="reset-email" name="email" type="email" autoComplete="email" maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder="name@example.com" required /></label>
                  {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
                  <button className="inline-flex h-[50px] items-center justify-center gap-2 rounded-md bg-violet-600 px-5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? 'Sending code...' : 'Send verification code'} {!submitting && <ArrowRight size={17} />}</button>
                </form>
              ) : (
                <form className="mt-8 grid gap-4" onSubmit={resetPassword} noValidate>
                  <div className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3.5 py-3"><span className="min-w-0 truncate text-sm text-gray-700">{email}</span><button className="shrink-0 text-xs font-semibold text-violet-700 underline underline-offset-4 hover:text-violet-900" type="button" onClick={() => { setStep('email'); setError(''); setNotice(''); }}>Change</button></div>
                  {notice && <p className="rounded-md bg-violet-50 px-3.5 py-3 text-xs leading-5 text-violet-800" role="status">{notice}</p>}
                  <label className="grid gap-2 text-sm font-semibold text-gray-800" htmlFor="reset-code">Six-digit verification code<input className="h-12 rounded-md border border-gray-200 bg-white px-3.5 text-sm font-normal tracking-[.25em] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" id="reset-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="000000" required /></label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-800" htmlFor="new-password">New password<input className="h-12 rounded-md border border-gray-200 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" id="new-password" name="newPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={newPassword} onChange={event => { setNewPassword(event.target.value); setError(''); }} required /><span className="text-xs font-normal text-gray-500">At least 10 characters, including uppercase, lowercase and a number.</span></label>
                  <label className="grid gap-2 text-sm font-semibold text-gray-800" htmlFor="confirm-password">Confirm new password<input className="h-12 rounded-md border border-gray-200 bg-white px-3.5 text-sm font-normal outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100" id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={confirmPassword} onChange={event => { setConfirmPassword(event.target.value); setError(''); }} required /></label>
                  {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
                  <button className="mt-2 inline-flex h-[50px] items-center justify-center gap-2 rounded-md bg-violet-600 px-5 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? 'Updating password...' : 'Verify code and update password'} {!submitting && <ArrowRight size={17} />}</button>
                  <button className="text-xs font-semibold text-gray-600 underline underline-offset-4 hover:text-violet-700" type="button" onClick={requestCode} disabled={submitting}>Send a new code</button>
                </form>
              )}
            </>
          )}
        </div>
        <div className="text-center text-[11px] text-gray-500 lg:text-left">Imoka Technology</div>
      </section>
    </main>
  );
}
