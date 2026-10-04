import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const links = [
  ['Home', '#home'],
  ['Services', '#services'],
  ['Products', '#products'],
  ['Portfolio', '#portfolio'],
  ['Contact', '#contact']
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <a className="site-brand" href="#home" aria-label="Imoka Technology home">
          <span className="brand-symbol" aria-hidden="true"><span>I</span></span>
          <span className="brand-wordmark"><strong>IMOKA</strong><small>TECHNOLOGY</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`site-links${menuOpen ? ' is-open' : ''}`}>
          {links.map(([label, href], index) => (
            <a key={label} className={index === 0 ? 'is-current' : ''} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a className="nav-cta" href="#pos">Open POS <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
    </header>
  );
}
