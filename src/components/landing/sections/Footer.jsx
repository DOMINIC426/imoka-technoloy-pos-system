import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <a className="footer-brand" href="#home"><span className="brand-symbol" aria-hidden="true"><span>I</span></span><span><strong>IMOKA</strong><small>TECHNOLOGY</small></span></a>
      <span className="footer-copy">© {new Date().getFullYear()} Imoka Technology. Built with purpose.</span>
      <a className="footer-pos" href="#pos">Open POS <ArrowUpRight size={15} /></a>
    </footer>
  );
}
