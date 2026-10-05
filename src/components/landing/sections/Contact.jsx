import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../language.js';

export default function Contact() {
  const { copy } = useLanguage();
  return (
    <section className="bg-gray-800 text-white" id="contact">
      <div className="mx-auto flex min-h-[355px] w-[min(1240px,calc(100%-64px))] items-center justify-between gap-[70px] py-[76px] max-[680px]:w-[calc(100%-36px)] max-[680px]:min-h-0 max-[680px]:grid max-[680px]:gap-[43px] max-[680px]:py-[66px]">
        <div>
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-400">{copy.contact.eyebrow}</p>
          <h2 className="mb-6 text-[64px] font-bold uppercase leading-[.91] text-white [font-family:'Barlow_Condensed',sans-serif] max-[680px]:text-[57px]">{copy.contact.title}<br /><span className="text-blue-400">{copy.contact.titleAccent}</span></h2>
          <a className="inline-flex min-h-12 items-center justify-center gap-[22px] bg-black px-[18px] text-xs font-extrabold uppercase text-white no-underline" href="mailto:imokaprints@gmail.com">{copy.contact.cta} <ArrowUpRight size={18} /></a>
        </div>
        <div className="grid min-w-[280px] gap-[22px] max-[680px]:min-w-0 max-[680px]:gap-[19px]">
          <a className="flex items-center gap-[15px] text-[13px] text-white no-underline" href="tel:+255744805938"><Phone className="text-blue-400" size={17} /><span><small className="mb-1 block text-[10px] text-gray-300">{copy.contact.call}</small>+255 744 805 938</span></a>
          <a className="flex items-center gap-[15px] text-[13px] text-white no-underline" href="mailto:imokaprints@gmail.com"><Mail className="text-blue-400" size={17} /><span><small className="mb-1 block text-[10px] text-gray-300">{copy.contact.email}</small>imokaprints@gmail.com</span></a>
          <div className="flex items-center gap-[15px] text-[13px] text-white"><MapPin className="text-blue-400" size={17} /><span><small className="mb-1 block text-[10px] text-gray-300">{copy.contact.location}</small>Kiwira Tandale</span></div>
        </div>
      </div>
    </section>
  );
}
