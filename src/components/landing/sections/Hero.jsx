import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { heroImage } from '../content.js';
import { useLanguage } from '../language.js';
import { useState, useEffect, useRef } from 'react';

function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.3;
    const y = (clientY - top - height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default function Hero() {
  const { copy } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [currentService, setCurrentService] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const services = ['Branding', 'Printing', 'Graphics', 'Internet Service'];
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseDuration = 3000;

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const currentWord = services[currentService];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentService((prev) => (prev + 1) % services.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentService, services]);

  const entrance = (delay = 0) => reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] } };
  return (
    <section className="isolate bg-gradient-to-br from-gray-950 via-gray-900 to-slate-800 text-white" id="home">
      <div className="mx-auto grid min-h-[560px] w-[min(1240px,calc(100%-64px))] grid-cols-[.94fr_1.06fr] items-center gap-16 py-16 max-[980px]:gap-8 max-[680px]:min-h-0 max-[680px]:w-[calc(100%-36px)] max-[680px]:grid-cols-1 max-[680px]:gap-[35px] max-[680px]:pb-[38px] max-[680px]:pt-[54px]">
        <motion.div className="relative z-[2]" style={{ y: y1 }} {...entrance(0.04)}>
          <motion.p {...entrance(0.08)} className="mb-5 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-400"><span className="h-0.5 w-[22px] bg-current"></span> {copy.hero.studio} · Mbeya - Kiwira, Tandale</motion.p>
          <motion.h1 {...entrance(0.16)} className="m-0 max-w-[640px] text-[72px] font-bold uppercase leading-[.88] text-blue-400 [font-family:'Barlow_Condensed',sans-serif] max-[980px]:text-[62px] max-[680px]:max-w-[430px] max-[680px]:text-[56px] max-[680px]:leading-[.94] max-[380px]:text-[48px]">IMOKA <em className="not-italic">TECHNOLOGY</em></motion.h1>
          <motion.h2 {...entrance(0.24)} className="mt-[17px] max-w-[470px] text-[26px] font-semibold uppercase leading-[1.05] text-white [font-family:'Barlow_Condensed',sans-serif] max-[680px]:max-w-[390px] max-[680px]:text-[23px]">{copy.hero.tagline}</motion.h2>
          <motion.p {...entrance(0.31)} className="mt-[15px] max-w-[425px] text-[10px] uppercase leading-[1.7] tracking-[.05em] text-gray-300 max-[680px]:max-w-[390px] max-[680px]:text-[9px]">
            <span className="text-blue-400">{displayText}</span>
            <motion.span 
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="inline-block w-[2px] h-[1em] bg-blue-400 ml-1 align-middle"
            />
          </motion.p>
          <motion.div {...entrance(0.38)} className="mt-[29px] flex items-center gap-7 max-[380px]:items-start max-[380px]:flex-col max-[380px]:gap-4">
            <MagneticButton as="a" className="inline-flex min-h-12 items-center justify-center gap-[22px] bg-black px-[18px] text-xs font-extrabold uppercase text-white no-underline transition-transform hover:-translate-y-0.5" href="#login">{copy.hero.getStarted} <ArrowUpRight size={18} /></MagneticButton>
            <MagneticButton as="a" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-100 no-underline" href="#services">{copy.hero.explore} <ArrowDownRight size={16} /></MagneticButton>
          </motion.div>
          <motion.div {...entrance(0.46)} className="mt-[47px] flex items-center gap-3 text-[9px] uppercase tracking-[.1em] text-gray-400 max-[680px]:mt-[31px] max-[680px]:text-[8px]"><span className="h-px w-[35px] bg-blue-500"></span><span>{copy.hero.proof}</span></motion.div>
        </motion.div>
        <motion.div className="relative min-h-[400px] overflow-hidden bg-gray-300 max-[980px]:min-h-[360px] max-[680px]:min-h-[310px]" style={{ y: y2 }} aria-label={copy.hero.imageAlt}>
          <img className="absolute inset-0 size-full object-cover object-center" src={heroImage} alt={copy.hero.imageAlt} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-transparent to-gray-950/10"></div>
          <div className="absolute bottom-[30px] left-[30px] flex items-center gap-3 text-white"><span className="grid size-[41px] place-items-center bg-black text-2xl font-extrabold [font-family:'Barlow_Condensed',sans-serif]">I</span><span><strong className="block text-sm">{copy.hero.goodIdeas}</strong><small className="mt-[3px] block text-[11px] text-gray-300">{copy.hero.madeReal}</small></span></div>
          <div className="absolute right-[30px] top-[30px] text-2xl font-bold text-white [font-family:'Barlow_Condensed',sans-serif]">01 <span className="text-sm text-white/65">/ 05</span></div>
          <div className="pointer-events-none absolute inset-3 border border-white/45"></div>
        </motion.div>
      </div>
      <div className="flex min-h-[47px] items-center justify-between border-t border-white/10 px-8 text-[10px] uppercase tracking-[.08em] text-gray-400 max-[680px]:min-h-[42px] max-[680px]:px-[18px] max-[680px]:text-[8px]"><span className="max-[680px]:max-w-[55%] max-[380px]:max-w-[48%]">{copy.hero.studioNote}</span><span className="inline-flex items-center gap-1.5 text-blue-400">{copy.hero.scroll} <ArrowDownRight size={15} /></span></div>
    </section>
  );
}
