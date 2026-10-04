import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { imageUrl } from '../content.js';

export default function Hero() {
  return (
    <section className="hero-section" id="home">
      <div className="hero-grain" aria-hidden="true"></div>
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="eyebrow"><span></span> Creative studio · Dar es Salaam</p>
          <h1>IMOKA <em>TECHNOLOGY</em></h1>
          <h2 className="hero-tagline">Creative solutions for your business</h2>
          <p className="hero-intro">Branding / Printing / Stationery / Graphic design / Internet services</p>
          <div className="hero-actions">
            <a className="button-yellow" href="#contact">Get started <ArrowUpRight size={18} /></a>
            <a className="text-link" href="#services">Explore services <ArrowDownRight size={16} /></a>
          </div>
          <div className="hero-proof"><span className="proof-line"></span><span>Branding / Printing / Design / Internet</span></div>
        </div>
        <div className="hero-art" aria-label="Creative team working on a digital project">
          <img src={imageUrl('photo-1519389950473-47ba0277781c', 1400)} alt="Creative team collaborating around a computer" />
          <div className="hero-image-shade"></div>
          <div className="hero-note"><span className="note-mark">I</span><span><strong>Good ideas.</strong><small>Made real here.</small></span></div>
          <div className="hero-index">01 <span>/ 05</span></div>
          <div className="hero-corner" aria-hidden="true">IMK<br />TECH</div>
        </div>
      </div>
      <div className="hero-bottom"><span>Independent creative & technology studio</span><span>Scroll to explore <ArrowDownRight size={15} /></span></div>
    </section>
  );
}
