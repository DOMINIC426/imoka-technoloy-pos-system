import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-inner">
        <div className="contact-main">
          <p className="eyebrow">Have something in mind?</p>
          <h2>Let's make<br /><span>it happen.</span></h2>
          <a className="button-yellow" href="mailto:imokaprints@gmail.com">Start a conversation <ArrowUpRight size={18} /></a>
        </div>
        <div className="contact-details">
          <a href="tel:+255744805938"><Phone size={17} /><span><small>Call us</small>+255 744 805 938</span></a>
          <a href="mailto:imokaprints@gmail.com"><Mail size={17} /><span><small>Email</small>imokaprints@gmail.com</span></a>
          <div><MapPin size={17} /><span><small>Find us</small>Dar es Salaam, Tanzania</span></div>
        </div>
      </div>
    </section>
  );
}
