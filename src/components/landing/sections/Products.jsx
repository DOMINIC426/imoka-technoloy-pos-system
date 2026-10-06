import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { products } from '../content.js';
import { useLanguage } from '../language.js';
import DetailModal from '../DetailModal.jsx';
import TextReveal from '../TextReveal.jsx';
import GradientText from '../GradientText.jsx';

export default function Products() {
  const { copy } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState(null);
  return (
    <section className="mx-auto w-[min(1240px,calc(100%-64px))] border-t border-gray-200 py-[77px] pb-[100px] max-[680px]:w-[calc(100%-36px)] max-[680px]:py-[68px] max-[680px]:pb-[75px]" id="products">
      <div className="mb-[31px] flex items-end justify-between gap-10 max-[680px]:mb-[25px] max-[680px]:block max-[380px]:block">
        <div><p className="mb-[13px] text-[11px] font-bold uppercase tracking-[.12em] text-blue-600">{copy.products.eyebrow}</p><TextReveal className="m-0 text-[55px] font-bold uppercase leading-[.91] text-gray-900 [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-[43px]">{copy.products.title}<br /><GradientText className="text-blue-600">{copy.products.titleAccent}</GradientText></TextReveal></div>
        <a className="mb-[7px] inline-flex items-center gap-2 text-xs font-semibold text-gray-900 no-underline max-[680px]:mt-4 max-[680px]:max-w-[130px] max-[680px]:text-[10px] max-[380px]:max-w-none" href="#contact">{copy.products.cta} <ArrowUpRight size={16} /></a>
      </div>
      <div className="grid grid-cols-[1.1fr_.9fr_.9fr_1.1fr] gap-[13px] max-[980px]:grid-cols-2 max-[680px]:gap-[9px]">
        {products.map((product, index) => (
          <article className={`group relative min-h-[290px] overflow-hidden bg-gray-800 max-[980px]:min-h-[270px] max-[680px]:min-h-[220px] max-[380px]:min-h-[190px] ${index % 2 ? 'min-[981px]:mt-[26px]' : ''}`} key={product.title}>
            <img className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.045]" src={product.image} alt={product.title} loading="lazy" />
            <span className="absolute inset-0 bg-gradient-to-t from-gray-950/90 to-transparent"></span>
            <span className="absolute bottom-5 left-[18px] right-[45px] text-white max-[680px]:bottom-[15px] max-[680px]:left-[13px]"><small className="mb-[7px] block text-[9px] font-bold uppercase tracking-[.13em] text-blue-400 max-[680px]:text-[8px]">{copy.products.categories[index]}</small><strong className="block text-2xl leading-none [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-xl">{product.title}</strong></span>
            <button className="absolute bottom-[17px] right-[14px] grid size-[36px] place-items-center rounded-md bg-black text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white max-[680px]:bottom-[13px] max-[680px]:right-[10px] max-[680px]:size-[32px]" type="button" aria-label={`${copy.details.view}: ${product.title}`} aria-haspopup="dialog" onClick={() => setSelectedProduct({ product, index })}><ArrowUpRight size={18} /></button>
          </article>
        ))}
      </div>
      <DetailModal
        item={selectedProduct?.product}
        category={selectedProduct ? copy.products.categories[selectedProduct.index] : ''}
        description={selectedProduct ? copy.products.descriptions[selectedProduct.index] : ''}
        closeLabel={copy.details.close}
        quoteLabel={copy.details.requestQuote}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
