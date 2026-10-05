import brandingImage from '../../images/branding.jpg';
import businessCardImage from '../../images/business-card.jpeg';
import graphicsImage from '../../images/graphics.jpeg';
import internetImage from '../../images/internet.jpg';
import printingImage from '../../images/printing.jpg';

export const heroImage = graphicsImage;

export const services = [
  { icon: 'brand', title: 'Branding', description: 'Logo design, brand identity and strategy' },
  { icon: 'print', title: 'Printing', description: 'Offset, digital and large-format printing' },
  { icon: 'stationery', title: 'Stationery', description: 'Business cards, letterheads and supplies' },
  { icon: 'design', title: 'Graphics Design', description: 'Creative design and visual concepts' },
  { icon: 'internet', title: 'Internet Services', description: 'High-speed connectivity and web solutions' }
];

export const products = [
  { title: 'Business cards', category: 'Print essentials', image: businessCardImage },
  { title: 'Branding', category: 'Identity & support', image: brandingImage },
  { title: 'Large format prints', category: 'Signs & displays', image: printingImage },
  { title: 'Internet services', category: 'Connectivity', image: internetImage }
];

export const portfolio = [
  { title: 'A brand people remember', type: 'Brand identity', image: businessCardImage },
  { title: 'Print with presence', type: 'Large format printing', image: printingImage },
  { title: 'Ideas made visible', type: 'Creative design', image: graphicsImage }
];
