import { ArrowUpRight } from 'lucide-react';
import { imageUrl, portfolio } from '../content.js';

export default function Portfolio() {
  return (
    <section className="bg-gray-900 px-8 py-[89px] pb-[100px] text-white max-[680px]:px-[18px] max-[680px]:py-[69px] max-[680px]:pb-[76px]" id="portfolio">
      <div className="mx-auto max-w-[1240px]">
      <div className="mb-[35px] flex items-end justify-between gap-10 max-[680px]:mb-[25px] max-[680px]:block">
        <div><p className="mb-5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-400">Selected work</p><h2 className="m-0 text-[52px] font-bold uppercase leading-[.91] text-white [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-[43px]">Thoughtful work.<br /><span className="text-blue-400">Real impact.</span></h2></div>
        <p className="mb-1 max-w-[350px] text-[13px] leading-[1.8] text-gray-300 max-[680px]:mt-4 max-[680px]:text-xs">A glimpse of the details, color and craft we bring to every project.</p>
      </div>
      <div className="grid grid-cols-3 gap-[19px] max-[680px]:grid-cols-1 max-[680px]:gap-[29px]">
        {portfolio.map((item, index) => (
          <article key={item.title}>
            <a className="relative block h-[290px] overflow-hidden bg-gray-800 no-underline max-[680px]:h-[270px]" href="#contact" aria-label={`Discuss a project like ${item.title}`}>
              <img className="absolute inset-0 size-full object-cover transition-transform duration-500 hover:scale-[1.045]" src={imageUrl(item.image, 1100)} alt="" loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent"></span>
              <span className="absolute left-4 top-[15px] text-[17px] text-white [font-family:'Barlow_Condensed',sans-serif]">0{index + 1}</span><span className="absolute bottom-[15px] right-[15px] grid size-[31px] place-items-center bg-black text-white"><ArrowUpRight size={20} /></span>
            </a>
            <p className="mb-[6px] mt-[17px] text-[10px] font-bold uppercase tracking-[.13em] text-blue-400 max-[680px]:mt-3">{item.type}</p><h3 className="m-0 text-[25px] font-semibold text-white [font-family:'Barlow_Condensed',sans-serif]">{item.title}</h3>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}
