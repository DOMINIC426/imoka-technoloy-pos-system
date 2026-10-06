import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { portfolio } from '../content.js';
import { useLanguage } from '../language.js';
import DetailModal from '../DetailModal.jsx';
import TextReveal from '../TextReveal.jsx';
import GradientText from '../GradientText.jsx';

export default function Portfolio() {
  const { copy } = useLanguage();
  const [selectedProject, setSelectedProject] = useState(null);
  return (
    <section className="bg-gray-900 px-8 py-[89px] pb-[100px] text-white max-[680px]:px-[18px] max-[680px]:py-[69px] max-[680px]:pb-[76px]" id="portfolio">
      <div className="mx-auto max-w-[1240px]">
      <div className="mb-[35px] flex items-end justify-between gap-10 max-[680px]:mb-[25px] max-[680px]:block">
        <div><p className="mb-5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-400">{copy.portfolio.eyebrow}</p><TextReveal className="m-0 text-[52px] font-bold uppercase leading-[.91] text-white [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-[43px]">{copy.portfolio.title}<br /><GradientText className="text-blue-400">{copy.portfolio.titleAccent}</GradientText></TextReveal></div>
        <p className="mb-1 max-w-[350px] text-[13px] leading-[1.8] text-gray-300 max-[680px]:mt-4 max-[680px]:text-xs">{copy.portfolio.intro}</p>
      </div>
      <div className="grid grid-cols-3 gap-[19px] max-[680px]:grid-cols-1 max-[680px]:gap-[29px]">
        {portfolio.map((item, index) => (
          <article key={item.title}>
            <div className="group relative h-[290px] overflow-hidden bg-gray-800 max-[680px]:h-[270px]">
              <img className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.045]" src={item.image} alt={copy.portfolio.titles[index]} loading="lazy" />
              <span className="absolute inset-0 bg-gradient-to-t from-gray-950/40 to-transparent"></span>
              <span className="absolute left-4 top-[15px] text-[17px] text-white [font-family:'Barlow_Condensed',sans-serif]">0{index + 1}</span>
              <button className="absolute bottom-[15px] right-[15px] grid size-[36px] place-items-center rounded-md bg-black text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="button" aria-label={`${copy.details.view}: ${copy.portfolio.titles[index]}`} aria-haspopup="dialog" onClick={() => setSelectedProject({ item: { ...item, title: copy.portfolio.titles[index] }, index })}><ArrowUpRight size={20} /></button>
            </div>
            <p className="mb-[6px] mt-[17px] text-[10px] font-bold uppercase tracking-[.13em] text-blue-400 max-[680px]:mt-3">{copy.portfolio.types[index]}</p><h3 className="m-0 text-[25px] font-semibold text-white [font-family:'Barlow_Condensed',sans-serif]">{copy.portfolio.titles[index]}</h3>
          </article>
        ))}
      </div>
      </div>
      <DetailModal
        item={selectedProject?.item}
        category={selectedProject ? copy.portfolio.types[selectedProject.index] : ''}
        description={selectedProject ? copy.portfolio.descriptions[selectedProject.index] : ''}
        closeLabel={copy.details.close}
        quoteLabel={copy.details.requestQuote}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
