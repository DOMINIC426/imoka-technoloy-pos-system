import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookOpen, Brush, Camera, Printer } from 'lucide-react';
import { services } from '../content.js';
import { useLanguage } from '../language.js';
import TextReveal from '../TextReveal.jsx';
import TiltCard from '../TiltCard.jsx';
import GradientText from '../GradientText.jsx';

const icons = { brand: Brush, print: Printer, training: BookOpen, security: Camera };

export default function Services() {
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const { copy } = useLanguage();
  const activeService = services[activeServiceIndex];

  return (
    <section className="mx-auto w-[min(1240px,calc(100%-64px))] py-20 max-[680px]:w-[calc(100%-36px)] max-[680px]:pb-[70px] max-[680px]:pt-[67px]" id="services">
      <div className="mb-[35px] flex items-end justify-between gap-10 max-[680px]:mb-[25px] max-[680px]:block">
        <div><p className="mb-[13px] text-[11px] font-bold uppercase tracking-[.12em] text-blue-600">{copy.services.eyebrow}</p><TextReveal className="m-0 text-[52px] font-bold uppercase leading-[.91] [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-[43px]">{copy.services.title} <GradientText className="text-blue-600">{copy.services.titleAccent}</GradientText></TextReveal></div>
        <p className="mb-1 max-w-[350px] text-[13px] leading-[1.8] text-gray-600 max-[680px]:mt-4 max-[680px]:text-xs">{copy.services.intro}</p>
      </div>
      <div className="grid grid-cols-[.72fr_1.28fr] gap-5 max-[760px]:grid-cols-1">
        <div className="grid content-start gap-2 max-[760px]:grid-cols-2 max-[420px]:gap-1.5" role="tablist" aria-label={copy.services.tabList}>
          {services.map((service, index) => {
            const Icon = icons[service.icon];
            const selected = activeServiceIndex === index;
            return (
              <button
                key={service.title}
                id={`service-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="service-showcase"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveServiceIndex(index)}
                onKeyDown={event => {
                  let nextIndex;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % services.length;
                  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + services.length) % services.length;
                  else if (event.key === 'Home') nextIndex = 0;
                  else if (event.key === 'End') nextIndex = services.length - 1;
                  else return;
                  event.preventDefault();
                  setActiveServiceIndex(nextIndex);
                  document.getElementById(`service-tab-${nextIndex}`)?.focus();
                }}
                className={`flex min-h-[70px] items-center gap-3 border px-4 py-3 text-left transition-colors max-[420px]:min-h-[62px] max-[420px]:gap-2 max-[420px]:px-2.5 ${selected ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'}`}
              >
                <Icon className="shrink-0" size={19} strokeWidth={1.8} />
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold max-[420px]:text-xs">{service.title}</span><span className={`mt-1 block text-[10px] ${selected ? 'text-gray-300' : 'text-gray-500'}`}>{copy.services.descriptions[index]}</span></span>
                <span className="text-xs opacity-60">0{index + 1}</span>
              </button>
            );
          })}
        </div>

        <TiltCard id="service-showcase" className="relative min-h-[390px] overflow-hidden bg-gray-900 max-[760px]:min-h-[340px] max-[420px]:min-h-[380px]" role="tabpanel" aria-labelledby={`service-tab-${activeServiceIndex}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.title}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: 'easeOut' }}
            >
              <img className="absolute inset-0 size-full object-cover" src={activeService.image} alt={`${activeService.title} by Imoka Technology`} />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-gray-950/10" />
              <div className="absolute left-6 top-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-white/80"><span className="h-px w-6 bg-blue-400" /> {copy.services.showcaseLabel} <span className="text-blue-300">/ 0{activeServiceIndex + 1}</span></div>
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white max-[420px]:p-5">
                <h3 className="mb-2 text-4xl font-bold leading-none [font-family:'Barlow_Condensed',sans-serif] max-[420px]:text-3xl">{activeService.title}</h3>
                <p className="mb-5 max-w-md text-sm leading-6 text-white/80">{copy.services.descriptions[activeServiceIndex]}</p>
                <a className="inline-flex min-h-11 items-center gap-3 bg-black px-4 text-xs font-bold uppercase text-white no-underline transition-transform hover:-translate-y-0.5" href="#contact">{copy.services.requestQuote} <ArrowUpRight size={16} /></a>
              </div>
            </motion.div>
          </AnimatePresence>
        </TiltCard>
      </div>
    </section>
  );
}
