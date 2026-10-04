export default function Footer() {
  return (
    <footer className="flex min-h-20 items-center justify-between gap-5 bg-gray-950 px-8 py-[15px] text-gray-300 max-[680px]:min-h-[90px] max-[680px]:flex-wrap max-[680px]:px-[18px] max-[680px]:py-[17px]">
      <a className="inline-flex items-center gap-2.5 text-white no-underline" href="#home"><span className="grid size-[31px] place-items-center rounded-md bg-blue-600 text-xl font-bold text-white [font-family:'Barlow_Condensed',sans-serif]" aria-hidden="true"><span>I</span></span><span className="grid leading-[.9]"><strong className="text-sm font-extrabold tracking-wide">IMOKA</strong><small className="mt-[5px] text-[7px] font-bold tracking-[.19em] text-gray-300">TECHNOLOGY</small></span></a>
      <span className="text-[10px] max-[680px]:order-3 max-[680px]:w-full">© {new Date().getFullYear()} Imoka Technology. Built with purpose.</span>
    </footer>
  );
}
