import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
import Hero from './sections/Hero.jsx';
import Navbar from './sections/Navbar.jsx';
import Portfolio from './sections/Portfolio.jsx';
import Products from './sections/Products.jsx';
import Services from './sections/Services.jsx';
import ScrollProgress from './ScrollProgress.jsx';
import ScrollReveal from './ScrollReveal.jsx';
import Counter from './Counter.jsx';
import MouseTrail from './MouseTrail.jsx';
import BackToTop from './BackToTop.jsx';
import { LanguageProvider } from './language.js';

export default function LandingPage() {
  return (
    <LanguageProvider>
      <div className="overflow-hidden bg-gray-50 font-sans text-gray-900">
        <MouseTrail />
        <ScrollProgress />
        <Navbar />
        <main>
          <Hero />
          <Counter />
          <ScrollReveal><Services /></ScrollReveal>
          <ScrollReveal delay={0.04}><Products /></ScrollReveal>
          <ScrollReveal delay={0.04}><Portfolio /></ScrollReveal>
          <ScrollReveal delay={0.04}><Contact /></ScrollReveal>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </LanguageProvider>
  );
}
