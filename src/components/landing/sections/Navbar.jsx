import { useId, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../language.js';

const links = [
  ['home', '#home'],
  ['services', '#services'],
  ['products', '#products'],
  ['portfolio', '#portfolio'],
  ['contact', '#contact']
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { copy } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-gray-900/80 backdrop-blur-md text-white">
      <nav className="mx-auto flex h-[78px] w-[min(1240px,calc(100%-64px))] items-center justify-between max-[680px]:h-[68px] max-[680px]:w-[calc(100%-36px)]" aria-label={copy.nav.main}>
        <a className="inline-flex items-center gap-2.5 text-white no-underline" href="#home" aria-label="Imoka Technology home">
          <span className="grid size-[39px] place-items-center rounded-lg bg-blue-600 font-bold text-white [font-family:'Barlow_Condensed',sans-serif]" aria-hidden="true"><span className="-rotate-8">I</span></span>
          <span className="grid leading-[.9]"><strong className="text-[19px] font-extrabold tracking-wide">IMOKA</strong><small className="mt-[5px] text-[9px] font-bold tracking-[.19em] text-gray-300">TECHNOLOGY</small></span>
        </a>
        <div className="flex items-center gap-2">
          <LanguageSwitch className="hidden max-[680px]:inline-flex" />
          <button className="hidden size-[42px] place-items-center border border-white/25 bg-black text-white max-[680px]:grid" type="button" aria-label={menuOpen ? copy.language.closeMenu : copy.language.openMenu} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className={`flex items-center gap-[22px] max-[680px]:absolute max-[680px]:left-0 max-[680px]:right-0 max-[680px]:top-[68px] max-[680px]:hidden max-[680px]:items-stretch max-[680px]:gap-0 max-[680px]:border-b max-[680px]:border-white/15 max-[680px]:bg-gray-900 max-[680px]:px-[18px] max-[680px]:pb-[18px] max-[680px]:pt-[7px]${menuOpen ? ' max-[680px]:!grid' : ''}`}>
          {links.map(([key, href], index) => (
            <a key={key} className={`relative py-2 text-[13px] text-gray-200 no-underline after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:origin-left after:scale-x-0 after:bg-blue-600 after:transition-transform hover:text-white hover:after:scale-x-100 max-[680px]:py-[13px] max-[680px]:after:hidden${index === 0 ? ' text-white after:scale-x-100' : ''}`} href={href} onClick={() => setMenuOpen(false)}>{copy.nav[key]}</a>
          ))}
          <LanguageSwitch className="max-[680px]:hidden" />
        </div>
      </nav>
    </header>
  );
}

function LanguageSwitch({ className = '' }) {
  const { language, setLanguage, copy } = useLanguage();
  const nextLanguage = language === 'en' ? 'sw' : 'en';
  const clipId = `language-flag-${useId()}`;
  return (
    <button
      className={`grid size-11 shrink-0 place-items-center rounded-full border border-gray-200 bg-white shadow-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${className}`}
      type="button"
      aria-label={language === 'en' ? copy.language.switchToSwahili : copy.language.switchToEnglish}
      title={language === 'en' ? copy.language.switchToSwahili : copy.language.switchToEnglish}
      onClick={() => setLanguage(nextLanguage)}
    >
      <svg className="size-[28px] rounded-full" viewBox="0 0 36 36" aria-hidden="true">
        <defs>
          <clipPath id={clipId}><circle cx="18" cy="18" r="18" /></clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {language === 'en' ? <>
            <rect width="36" height="36" fill="#fff" />
            {[0, 5.54, 11.08, 16.62, 22.16, 27.7, 33.24].map(y => <rect key={y} y={y} width="36" height="2.77" fill="#b22234" />)}
            <rect width="16" height="19.4" fill="#3c3b6e" />
            {[3, 8, 13].flatMap(y => [3, 8, 13].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.05" fill="#fff" />))}
          </> : <>
            <rect width="36" height="36" fill="#1eb53a" />
            <path d="M36 0H0v36z" fill="#00a3dd" />
            <path d="M0 22.5 36 0v13.5L0 36z" fill="#fcd116" />
            <path d="M0 25.5 36 3v7.5L0 33z" fill="#000" />
          </>}
        </g>
        <circle cx="18" cy="18" r="17.5" fill="none" stroke="#d1d5db" />
      </svg>
    </button>
  );
}
