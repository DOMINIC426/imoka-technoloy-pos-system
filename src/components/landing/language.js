import { createContext, createElement, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    language: { switchToEnglish: 'Switch language to English', switchToSwahili: 'Switch language to Kiswahili', openMenu: 'Open navigation', closeMenu: 'Close navigation' },
    details: { close: 'Close details', view: 'View details', requestQuote: 'Request a quote' },
    nav: { home: 'Home', services: 'Services', products: 'Products', portfolio: 'Portfolio', contact: 'Contact', main: 'Main navigation' },
    hero: {
      studio: 'ICT & digital services',
      tagline: 'Local ICT & digital services in Kiwira',
      serviceList: 'Graphic Design & Branding / Printing & Digital Creation / ICT Tutoring / CCTV Security',
      getStarted: 'Get started',
      explore: 'Explore services',
      proof: 'Graphic Design / Printing / ICT Training / CCTV',
      imageAlt: 'Imoka Technology ICT, digital creation, and CCTV services',
      goodIdeas: 'Good ideas.',
      madeReal: 'Made real here.',
      scroll: 'Scroll to explore',
      studioNote: 'Local ICT and digital services provider'
    },
    services: {
      eyebrow: 'What we do',
      title: 'Local ICT,',
      titleAccent: 'digital services.',
      intro: 'Imoka Technology is a local ICT and digital services provider in Kiwira, Tanzania. We offer graphic design and branding, printing and digital creation, ICT tutoring, and CCTV security installations.',
      tabList: 'Our services',
      showcaseLabel: 'Imoka services',
      requestQuote: 'Request a quote',
      descriptions: [
        'Create logos, office banners, and visual media that make your organization recognizable.',
        'Get custom print solutions and digital content created for your needs.',
        'Build practical information and communication technology skills with guided training.',
        'Protect your home or business with professionally installed CCTV surveillance systems.'
      ]
    },
    products: {
      eyebrow: 'Made for your business',
      title: 'From first impression',
      titleAccent: 'to final detail.',
      cta: 'Tell us what you need',
      categories: ['Graphic design & branding', 'Printing & digital creation', 'ICT tutoring', 'CCTV security'],
      descriptions: [
        'Create logos, office banners, and visual media that give your brand a consistent identity.',
        'Get custom print solutions and digital content creation for your projects.',
        'Learn information and communication technology with practical training and educational support.',
        'Set up CCTV surveillance systems to help monitor your home or business.'
      ]
    },
    portfolio: {
      eyebrow: 'Selected work',
      title: 'Thoughtful work.',
      titleAccent: 'Real impact.',
      intro: 'A glimpse of the details, color and craft we bring to every project.',
      titles: ['A brand people remember', 'Print with presence', 'Ideas made visible'],
      types: ['Brand identity', 'Large format printing', 'Creative design'],
      descriptions: [
        'A distinctive identity system created to make a business instantly recognizable.',
        'Bold, high-quality large-format printing that helps your message stand out.',
        'Clear, purposeful graphics that turn ideas into visual communication.'
      ],
      discuss: 'Discuss a project like'
    },
    contact: {
      eyebrow: 'Have something in mind?',
      title: "Let's make",
      titleAccent: 'it happen.',
      cta: 'Start a conversation',
      call: 'Call us',
      whatsapp: 'Message us on WhatsApp',
      email: 'Email',
      location: 'Find us'
    },
    footer: { copyright: 'Imoka Technology. Built with purpose.' }
  },
  sw: {
    language: { switchToEnglish: 'Badilisha lugha iwe Kiingereza', switchToSwahili: 'Badilisha lugha iwe Kiswahili', openMenu: 'Fungua menyu', closeMenu: 'Funga menyu' },
    details: { close: 'Funga maelezo', view: 'Tazama maelezo', requestQuote: 'Omba makadirio' },
    nav: { home: 'Mwanzo', services: 'Huduma', products: 'Bidhaa', portfolio: 'Kazi zetu', contact: 'Wasiliana', main: 'Menyu kuu' },
    hero: {
      studio: 'Huduma za ICT na kidijitali',
      tagline: 'Huduma za ICT na kidijitali Kiwira',
      serviceList: 'Ubunifu wa Picha na Chapa / Uchapishaji na Maudhui ya Kidijitali / Mafunzo ya ICT / CCTV',
      getStarted: 'Anza sasa',
      explore: 'Tazama huduma',
      proof: 'Ubunifu / Uchapishaji / Mafunzo ya ICT / CCTV',
      imageAlt: 'Tangazo la huduma za ICT, kidijitali na CCTV za Imoka Technology',
      goodIdeas: 'Mawazo bora.',
      madeReal: 'Yanatekelezwa hapa.',
      scroll: 'Shuka uone zaidi',
      studioNote: 'Mtoa huduma za ICT na kidijitali wa eneo hili'
    },
    services: {
      eyebrow: 'Tunachofanya',
      title: 'ICT na huduma,',
      titleAccent: 'za kidijitali.',
      intro: 'Imoka Technology ni mtoa huduma za ICT na kidijitali aliyepo Kiwira, Tanzania. Tunatoa huduma za ubunifu wa picha na chapa, uchapishaji na uundaji wa maudhui ya kidijitali, mafunzo ya ICT, na usakinishaji wa mifumo ya ulinzi ya CCTV.',
      tabList: 'Huduma zetu',
      showcaseLabel: 'Huduma za Imoka',
      requestQuote: 'Omba makadirio',
      descriptions: [
        'Tengeneza nembo, mabango ya ofisi na maudhui ya picha yanayoitambulisha taasisi yako.',
        'Pata huduma za uchapishaji maalum na uundaji wa maudhui ya kidijitali.',
        'Jifunze stadi za teknolojia ya habari na mawasiliano kupitia mafunzo elekezi.',
        'Linda nyumba au biashara yako kwa mifumo ya uangalizi ya CCTV iliyosimikwa kitaalamu.'
      ]
    },
    products: {
      eyebrow: 'Kwa ajili ya biashara yako',
      title: 'Kuanzia mvuto wa kwanza',
      titleAccent: 'hadi maelezo ya mwisho.',
      cta: 'Tuambie unachohitaji',
      categories: ['Ubunifu wa picha na chapa', 'Uchapishaji na maudhui ya kidijitali', 'Mafunzo ya ICT', 'Ulinzi wa CCTV'],
      descriptions: [
        'Tengeneza nembo, mabango ya ofisi na maudhui ya picha kwa utambulisho thabiti wa chapa yako.',
        'Pata uchapishaji maalum na uundaji wa maudhui ya kidijitali kwa miradi yako.',
        'Jifunze teknolojia ya habari na mawasiliano kupitia mafunzo na msaada wa kielimu.',
        'Sakinisha mifumo ya uangalizi ya CCTV ili kufuatilia nyumba au biashara yako.'
      ]
    },
    portfolio: {
      eyebrow: 'Baadhi ya kazi zetu',
      title: 'Ubunifu wenye maana.',
      titleAccent: 'Matokeo halisi.',
      intro: 'Angalia umakini, rangi na ubora tunaoweka katika kila mradi.',
      titles: ['Chapa inayokumbukwa', 'Uchapishaji unaovutia', 'Mawazo yanayoonekana'],
      types: ['Utambulisho wa chapa', 'Uchapishaji wa ukubwa mkubwa', 'Ubunifu wa picha'],
      descriptions: [
        'Mfumo wa kipekee wa utambulisho unaosaidia biashara kutambulika kwa urahisi.',
        'Uchapishaji wa ukubwa mkubwa wenye ubora unaosaidia ujumbe wako kujitokeza.',
        'Ubunifu wa picha ulio wazi na wenye kusudi unaogeuza mawazo kuwa mawasiliano ya kuona.'
      ],
      discuss: 'Jadili mradi kama'
    },
    contact: {
      eyebrow: 'Una wazo unalotaka kutekeleza?',
      title: 'Tulifanye',
      titleAccent: 'liwe halisi.',
      cta: 'Tuanzishe mazungumzo',
      call: 'Piga simu',
      whatsapp: 'Wasiliana nasi WhatsApp',
      email: 'Barua pepe',
      location: 'Mahali tulipo'
    },
    footer: { copyright: 'Imoka Technology. Ubunifu wenye kusudi.' }
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('imoka_landing_language') === 'sw' ? 'sw' : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('imoka_landing_language', language);
    } catch {
      // The language choice still works for this visit if storage is unavailable.
    }
  }, [language]);

  return createElement(LanguageContext.Provider, { value: { language, setLanguage, copy: translations[language] } }, children);
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.');
  return context;
}
