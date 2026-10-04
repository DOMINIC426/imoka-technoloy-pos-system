import { ArrowUpRight } from 'lucide-react';
import { imageUrl, portfolio } from '../content.js';

export default function Portfolio() {
  return (
    <section className="portfolio-section section-wrap" id="portfolio">
      <div className="section-heading portfolio-heading">
        <div><p className="eyebrow">Selected work</p><h2>Thoughtful work.<br /><span>Real impact.</span></h2></div>
        <p>A glimpse of the details, color and craft we bring to every project.</p>
      </div>
      <div className="portfolio-grid">
        {portfolio.map((item, index) => (
          <article className="portfolio-item" key={item.title}>
            <a className="portfolio-image" href="#contact" aria-label={`Discuss a project like ${item.title}`}>
              <img src={imageUrl(item.image, 1100)} alt="" loading="lazy" />
              <span className="portfolio-number">0{index + 1}</span><span className="portfolio-open"><ArrowUpRight size={20} /></span>
            </a>
            <p>{item.type}</p><h3>{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
