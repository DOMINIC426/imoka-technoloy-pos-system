import { Brush, FileText, MonitorSmartphone, Printer, Wifi } from 'lucide-react';
import { services } from '../content.js';

const icons = { brand: Brush, print: Printer, stationery: FileText, design: MonitorSmartphone, internet: Wifi };

export default function Services() {
  return (
    <section className="mx-auto w-[min(1240px,calc(100%-64px))] py-20 max-[680px]:w-[calc(100%-36px)] max-[680px]:pb-[70px] max-[680px]:pt-[67px]" id="services">
      <div className="mb-[35px] flex items-end justify-between gap-10 max-[680px]:mb-[25px] max-[680px]:block">
        <div><p className="mb-[13px] text-[11px] font-bold uppercase tracking-[.12em] text-blue-600">What we do</p><h2 className="m-0 text-[52px] font-bold uppercase leading-[.91] text-gray-900 [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-[43px]">Good work, <span className="text-blue-600">all under one roof.</span></h2></div>
        <p className="mb-1 max-w-[350px] text-[13px] leading-[1.8] text-gray-600 max-[680px]:mt-4 max-[680px]:text-xs">We bring the creative thinking and practical tools your business needs to show up with confidence.</p>
      </div>
      <div className="grid grid-cols-5 gap-3 max-[980px]:grid-cols-3 max-[680px]:grid-cols-2 max-[680px]:gap-[9px]">
        {services.map((service, index) => {
          const Icon = icons[service.icon];
          return (
            <article className="relative flex min-h-[202px] flex-col items-start border border-gray-200 border-t-[3px] border-t-blue-600 bg-white p-[19px_17px_16px] transition-transform hover:-translate-y-1 max-[680px]:min-h-[184px] max-[680px]:p-[15px_13px]" key={service.title}>
              <div className="flex w-full items-center justify-between text-gray-900"><span className="text-sm text-gray-400 [font-family:'Barlow_Condensed',sans-serif]">0{index + 1}</span><Icon className="text-gray-900" size={24} strokeWidth={1.7} /></div>
              <h3 className="mb-[7px] mt-7 text-[21px] font-bold leading-none text-gray-900 [font-family:'Barlow_Condensed',sans-serif] max-[680px]:mt-[25px] max-[680px]:text-[19px]">{service.title}</h3>
              <p className="m-0 max-w-[170px] text-[11px] leading-[1.55] text-gray-600 max-[680px]:max-w-[145px] max-[680px]:text-[10px]">{service.description}</p>
              <a className="absolute bottom-[14px] right-4 grid size-7 place-items-center bg-black text-lg leading-none text-white no-underline" href="#contact" aria-label={`Ask about ${service.title}`}><ArrowMark /></a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ArrowMark() { return <span aria-hidden="true">↗</span>; }
