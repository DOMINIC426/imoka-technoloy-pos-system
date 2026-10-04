import { Brush, FileText, MonitorSmartphone, Printer, Wifi } from 'lucide-react';
import { services } from '../content.js';

const icons = { brand: Brush, print: Printer, stationery: FileText, design: MonitorSmartphone, internet: Wifi };

export default function Services() {
  return (
    <section className="services-section section-wrap" id="services">
      <div className="section-heading">
        <div><p className="eyebrow dark-eyebrow">What we do</p><h2>Good work, <span>all under one roof.</span></h2></div>
        <p>We bring the creative thinking and practical tools your business needs to show up with confidence.</p>
      </div>
      <div className="services-grid">
        {services.map((service, index) => {
          const Icon = icons[service.icon];
          return (
            <article className="service-card" key={service.title}>
              <div className="service-card-top"><span>0{index + 1}</span><Icon size={24} strokeWidth={1.7} /></div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="#contact" aria-label={`Ask about ${service.title}`}><ArrowMark /></a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArrowMark() {
  return <span aria-hidden="true">↗</span>;
}
