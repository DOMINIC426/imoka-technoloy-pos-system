import brandingImage from '../../images/branding.jpg';
import businessCardImage from '../../images/business-card.jpeg';
import graphicsImage from '../../images/graphics.jpeg';
import printingImage from '../../images/printing.jpg';

export const heroImage = graphicsImage;

export const services = [
  { icon: 'brand', title: 'Graphic Design & Branding', image: brandingImage },
  { icon: 'print', title: 'Printing & Digital Creation', image: printingImage },
  { icon: 'training', title: 'ICT Tutoring', image: graphicsImage },
  { icon: 'security', title: 'Security Installations', image: graphicsImage }
];

export const products = [
  { title: 'Graphic design & branding', category: 'Brand identity', image: brandingImage },
  { title: 'Printing & digital creation', category: 'Print & digital content', image: printingImage },
  { title: 'ICT tutoring', category: 'ICT education', image: graphicsImage },
  { title: 'CCTV systems', category: 'Security installations', image: graphicsImage }
];

export const portfolio = [
  { title: 'A brand people remember', type: 'Brand identity', image: businessCardImage },
  { title: 'Print with presence', type: 'Large format printing', image: printingImage },
  { title: 'Ideas made visible', type: 'Creative design', image: graphicsImage }
];
