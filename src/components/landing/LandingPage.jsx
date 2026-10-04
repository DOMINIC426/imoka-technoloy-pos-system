import Contact from './sections/Contact.jsx';
import Footer from './sections/Footer.jsx';
import Hero from './sections/Hero.jsx';
import Navbar from './sections/Navbar.jsx';
import Portfolio from './sections/Portfolio.jsx';
import Products from './sections/Products.jsx';
import Services from './sections/Services.jsx';

export default function LandingPage() {
  return (
    <div className="overflow-hidden bg-gray-50 font-sans text-gray-900">
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
