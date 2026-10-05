import { createContext, createElement, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    language: { switchToEnglish: 'Switch language to English', switchToSwahili: 'Switch language to Kiswahili', openMenu: 'Open navigation', closeMenu: 'Close navigation' },
    details: { close: 'Close details', view: 'View details', requestQuote: 'Request a quote' },
    nav: { home: 'Home', services: 'Services', products: 'Products', portfolio: 'Portfolio', contact: 'Contact', main: 'Main navigation' },
    hero: {
      studio: 'Creative studio',
      tagline: 'Creative solutions for your business',
      serviceList: 'Branding / Printing / Stationery / Graphics Design / Internet Services',
      getStarted: 'Get started',
      explore: 'Explore services',
      proof: 'Branding / Printing / Design / Internet',
      imageAlt: 'Imoka Technology creative solutions promotional artwork',
      goodIdeas: 'Good ideas.',
      madeReal: 'Made real here.',
      scroll: 'Scroll to explore',
      studioNote: 'Independent creative & technology studio'
    },
    services: {
      eyebrow: 'What we do',
      title: 'Good work,',
      titleAccent: 'all under one roof.',
      intro: 'We bring the creative thinking and practical tools your business needs to show up with confidence.',
      tabList: 'Our services',
      showcaseLabel: 'Imoka services',
      requestQuote: 'Request a quote',
      descriptions: [
        'Build a distinctive identity your customers recognize.',
        'Bring your ideas to life with quality, made-to-fit print.',
        'Keep your business memorable in every detail and handoff.',
        'Make your message clear with thoughtful visual design.',
        'Stay connected with internet solutions for your business.'
      ]
    },
    products: {
      eyebrow: 'Made for your business',
      title: 'From first impression',
      titleAccent: 'to final detail.',
      cta: 'Tell us what you need',
      categories: ['Print essentials', 'Identity & support', 'Signs & displays', 'Connectivity'],
      descriptions: [
        'Create a polished first impression with custom business cards designed for your brand.',
        'Bring your brand to life with a consistent visual identity for your business.',
        'Make your message visible with large-format printing for signs and displays.',
        'Get reliable internet services that help your team and business stay connected.'
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
      studio: 'Studio ya ubunifu',
      tagline: 'Suluhisho bunifu kwa biashara yako',
      serviceList: 'Branding / Printing / Stationery / Graphics Design / Internet Services',
      getStarted: 'Anza sasa',
      explore: 'Tazama huduma',
      proof: 'Branding / Printing / Design / Internet',
      imageAlt: 'Tangazo la huduma za ubunifu za Imoka Technology',
      goodIdeas: 'Mawazo bora.',
      madeReal: 'Yanatekelezwa hapa.',
      scroll: 'Shuka uone zaidi',
      studioNote: 'Studio huru ya ubunifu na teknolojia'
    },
    services: {
      eyebrow: 'Tunachofanya',
      title: 'Kazi bora,',
      titleAccent: 'huduma zote sehemu moja.',
      intro: 'Tunakuletea ubunifu na zana muhimu ili biashara yako ionekane kwa kujiamini.',
      tabList: 'Huduma zetu',
      showcaseLabel: 'Huduma za Imoka',
      requestQuote: 'Omba makadirio',
      descriptions: [
        'Jenga utambulisho wa kipekee ambao wateja wako watautambua.',
        'Geuza mawazo yako kuwa machapisho bora yanayokidhi mahitaji yako.',
        'Fanya biashara yako ikumbukwe katika kila maelezo na nyaraka.',
        'Wasilisha ujumbe wako kwa ubunifu wa picha ulio wazi na makini.',
        'Endelea kuunganishwa kwa suluhisho za intaneti za biashara yako.'
      ]
    },
    products: {
      eyebrow: 'Kwa ajili ya biashara yako',
      title: 'Kuanzia mvuto wa kwanza',
      titleAccent: 'hadi maelezo ya mwisho.',
      cta: 'Tuambie unachohitaji',
      categories: ['Mahitaji ya uchapishaji', 'Utambulisho na msaada', 'Mabango na maonyesho', 'Muunganisho wa intaneti'],
      descriptions: [
        'Tengeneza mwonekano wa kwanza wa kitaalamu kwa kadi za biashara zinazolingana na chapa yako.',
        'Jenga utambulisho wa picha unaoleta chapa ya biashara yako pamoja.',
        'Fikisha ujumbe wako kwa uchapishaji wa mabango na maonyesho ya ukubwa mkubwa.',
        'Pata huduma ya intaneti inayosaidia timu na biashara yako kuendelea kuwasiliana.'
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
