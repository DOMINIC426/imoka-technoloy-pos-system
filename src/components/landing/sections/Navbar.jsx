import { useState } from 'react';
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
  const { language, setLanguage, copy } = useLanguage();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-gray-900 text-white">
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
          <a className="inline-flex items-center justify-between gap-4 bg-black px-[15px] py-[11px] text-xs font-bold text-white no-underline transition-transform hover:-translate-y-0.5 max-[680px]:mt-2" href="#pos">{copy.nav.openPos} <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
    </header>
  );
}

function LanguageSwitch({ className = '' }) {
  const { language, setLanguage, copy } = useLanguage();
  return (
    <div className={`inline-flex items-center gap-0.5 border border-white/20 bg-black p-1 ${className}`} role="group" aria-label={copy.language.label}>
      <button className={`min-w-9 px-2 py-1 text-[10px] font-bold tracking-wide text-white ${language === 'en' ? 'ring-1 ring-blue-500' : 'text-white/60'}`} type="button" aria-label={copy.language.english} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
      <button className={`min-w-9 px-2 py-1 text-[10px] font-bold tracking-wide text-white ${language === 'sw' ? 'ring-1 ring-blue-500' : 'text-white/60'}`} type="button" aria-label={copy.language.swahili} aria-pressed={language === 'sw'} onClick={() => setLanguage('sw')}>SW</button>
    </div>
  );
}
