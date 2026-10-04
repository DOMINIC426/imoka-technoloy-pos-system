import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
import Hero from './sections/Hero.jsx';
import Navbar from './sections/Navbar.jsx';
import Portfolio from './sections/Portfolio.jsx';
import Products from './sections/Products.jsx';
import Services from './sections/Services.jsx';
import '../../styles/landing.css';

export default function LandingPage() {
  return (
    <div className="site-shell">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Products />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
