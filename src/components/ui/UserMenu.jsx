import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LockKeyhole, LogOut, UserRound } from 'lucide-react';

export default function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const firstName = user?.firstName || 'Staff';
  const lastName = user?.lastName || '';
  const name = `${firstName} ${lastName}`.trim();
  const role = user?.role === 'admin' ? 'Administrator' : 'Cashier';

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutsideClick = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        className="group inline-flex items-center gap-2 rounded-full p-1.5 text-left transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
        type="button"
        aria-label={`${name}, ${role}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className="relative grid size-10 place-items-center rounded-full bg-sky-100 text-sky-700">
          <UserRound size={22} strokeWidth={2.2} />
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
        </span>
        <span className="hidden min-w-0 text-sm sm:block"><strong className="block max-w-36 truncate font-semibold text-gray-800">{name}</strong><small className="block text-xs text-gray-500">{role}</small></span>
        <ChevronDown size={15} className={`mr-1 hidden text-gray-400 transition-transform sm:block ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(320px,calc(100vw-24px))] overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-800 shadow-xl" role="menu" aria-label="Account menu">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700"><UserRound size={23} strokeWidth={2.1} /></span>
            <span className="min-w-0"><strong className="block truncate text-sm font-semibold">{name}</strong><span className="mt-0.5 block truncate text-xs text-gray-500">{user?.email || role}</span></span>
          </div>
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[.14em] text-gray-400">My Profile</p>
            <p className="m-0 text-xs text-gray-600">{role}</p>
          </div>
          <a className="flex min-h-11 items-center gap-3 px-4 text-sm text-gray-700 no-underline transition-colors hover:bg-gray-50 hover:text-violet-700" href="#change-password" role="menuitem" onClick={() => setOpen(false)}>
            <LockKeyhole size={17} className="text-gray-500" /> Change Password
          </a>
          <button className="flex min-h-11 w-full items-center gap-3 border-t border-gray-100 px-4 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-violet-700" type="button" role="menuitem" onClick={onSignOut}>
            <LogOut size={17} className="text-gray-500" /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
