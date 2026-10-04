import { ArrowUpRight } from 'lucide-react';
import { imageUrl, products } from '../content.js';

export default function Products() {
  return (
    <section className="products-section section-wrap" id="products">
      <div className="section-heading products-heading">
        <div><p className="eyebrow dark-eyebrow">Made for your business</p><h2>From first impression<br /><span>to final detail.</span></h2></div>
        <a className="text-link dark-link" href="#contact">Tell us what you need <ArrowUpRight size={16} /></a>
      </div>
      <div className="product-grid">
        {products.map((product, index) => (
          <a className={`product-tile product-tile-${index + 1}`} href="#contact" key={product.title}>
            <img src={imageUrl(product.image, 900)} alt={product.title} loading="lazy" />
            <span className="product-tile-shade"></span>
            <span className="product-meta"><small>{product.category}</small><strong>{product.title}</strong></span>
            <span className="product-arrow"><ArrowUpRight size={18} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}
