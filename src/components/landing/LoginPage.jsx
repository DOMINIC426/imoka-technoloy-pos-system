import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { apiUrl } from '../../api.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!username.trim()) nextErrors.username = 'Enter your email address.';
    else if (!emailPattern.test(username.trim())) nextErrors.username = 'Enter a valid email address.';

    if (!password) nextErrors.password = 'Enter your password.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password })
      });
      
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
      sessionStorage.setItem('imoka_pos_token', result.token);
      sessionStorage.setItem('imoka_pos_user', JSON.stringify(result.user));
      window.location.hash = result.user.role === 'admin' ? '#admin' : '#pos';
    } catch (loginError) {
      setErrors({ form: loginError.message || 'Unable to reach the sign-in service. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#edf2ef] text-gray-900 lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.82fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#174e46] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <a className="inline-flex w-fit items-center gap-3 text-white no-underline" href="#home">
          <span className="grid size-11 place-items-center rounded-md bg-[#d2e7db] text-xl font-bold text-[#174e46]">I</span>
          <span><strong className="block text-lg tracking-wide">IMOKA</strong><small className="text-[10px] tracking-[.2em] text-white/70">TECHNOLOGY</small></span>
        </a>
        <div className="relative z-10 max-w-xl pb-10">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[.18em] text-[#b6d7c4]">Business operations</p>
          <h1 className="max-w-[540px] text-6xl font-semibold leading-[1.02] [font-family:'Barlow_Condensed',sans-serif]">Good work starts with a clear view.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/75">Sign in to manage sales, products, customers and reports in one place.</p>
          <div className="mt-12 flex items-center gap-3 text-xs text-white/65"><span className="h-px w-10 bg-[#b6d7c4]"></span> IMOKA - KIWIRA , TANDALE</div>
        </div>
        <span className="text-xs text-white/55">(c) {new Date().getFullYear()} Imoka Technology</span>
        <div className="pointer-events-none absolute -bottom-28 -right-20 size-[420px] rounded-full border border-white/10" aria-hidden="true"></div>
        <div className="pointer-events-none absolute -bottom-12 -right-4 size-[280px] rounded-full border border-white/10" aria-hidden="true"></div>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-16 xl:px-24">
        <a className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-600 no-underline transition-colors hover:text-[#174e46]" href="#home"><ArrowLeft size={17} /> Back to website</a>
        <div className="mx-auto my-auto w-full max-w-[430px] py-12">
          <a className="mb-12 hidden w-fit items-center gap-3 text-gray-900 no-underline lg:inline-flex" href="#home">
            <span className="grid size-10 place-items-center rounded-md bg-[#174e46] text-lg font-bold text-white">I</span>
            <span><strong className="block text-base tracking-wide">IMOKA</strong><small className="text-[9px] tracking-[.2em] text-gray-500">TECHNOLOGY</small></span>
          </a>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[#367c69]">Welcome back</p>
          <h2 className="text-4xl font-semibold leading-tight [font-family:'Barlow_Condensed',sans-serif]">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your username and password to continue.</p>

          <form className="mt-9 grid gap-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800" htmlFor="login-username">Email address</label>
              <div className={`flex h-12 items-center gap-3 border bg-white px-3.5 transition-colors focus-within:border-[#367c69] ${errors.username ? 'border-rose-500' : 'border-gray-300'}`}>
                <UserRound size={18} className="shrink-0 text-gray-500" aria-hidden="true" />
                <input className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400" id="login-username" name="email" type="email" autoComplete="username" autoCapitalize="none" maxLength={254} value={username} onChange={(event) => { setUsername(event.target.value); setErrors((current) => ({ ...current, username: '', form: '' })); }} onBlur={() => { if (username && !emailPattern.test(username.trim())) setErrors((current) => ({ ...current, username: 'Enter a valid email address.' })); }} placeholder="name@example.com" aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} />
              </div>
              {errors.username && <p className="mt-1.5 text-xs text-rose-700" id="username-error" role="alert">{errors.username}</p>}
            </div>

            <div>
              
              <div className={`flex h-12 items-center gap-3 border bg-white px-3.5 transition-colors focus-within:border-[#367c69] ${errors.password ? 'border-rose-500' : 'border-gray-300'}`}>
                <LockKeyhole size={18} className="shrink-0 text-gray-500" aria-hidden="true" />
                <input className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400" id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" maxLength={128} value={password} onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: '', form: '' })); }} placeholder="Your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
                <button className="grid size-8 shrink-0 place-items-center text-gray-500 transition-colors hover:text-[#174e46]" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-700" id="password-error" role="alert">{errors.password}</p>}
            </div>

            {errors.form && <p className="text-sm text-rose-700" role="alert">{errors.form}</p>}
            <button className="mt-2 inline-flex h-[50px] items-center justify-center gap-2 bg-[#174e46] px-5 text-sm font-bold text-white transition-colors hover:bg-[#23665a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174e46] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'} {!submitting && <ArrowRight size={17} />}</button>
            <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-gray-800" htmlFor="login-password">Password</label>
                <a className="text-xs font-semibold text-violet-700 underline underline-offset-4 hover:text-violet-900" href="#forgot-password">Forgot password?</a>
              </div>
          </form>
          <p className="mt-8 border-t border-gray-300 pt-5 text-sm text-gray-600">New to Imoka? <a className="font-semibold text-[#23665a] underline decoration-[#a8c8b5] underline-offset-4 hover:text-[#174e46]" href="mailto:imokaprints@gmail.com">Contact our team</a></p>
        </div>
        <div className="text-center text-[11px] text-gray-500 lg:text-left">Imoka Technology</div>
      </section>
    </main>
  );
}