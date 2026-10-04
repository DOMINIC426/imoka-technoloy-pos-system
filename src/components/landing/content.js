export const services = [
  { icon: 'brand', title: 'Branding', description: 'Logo design, brand identity and strategy' },
  { icon: 'print', title: 'Printing', description: 'Offset, digital and large-format printing' },
  { icon: 'stationery', title: 'Stationery', description: 'Business cards, letterheads and supplies' },
  { icon: 'design', title: 'Graphics Design', description: 'Creative design and visual concepts' },
  { icon: 'internet', title: 'Internet Services', description: 'High-speed connectivity and web solutions' }
];

export const products = [
  { title: 'Business cards', category: 'Print essentials', image: 'photo-1504274066651-8d31a536b11a' },
  { title: 'Branded stationery', category: 'Office & identity', image: 'photo-1544816155-12df9643f363' },
  { title: 'Large format prints', category: 'Signs & displays', image: 'photo-1561214115-f2f134cc4912' },
  { title: 'Custom design', category: 'Made for your brand', image: 'photo-1513364776144-60967b0f800f' }
];

export const portfolio = [
  { title: 'A brand people remember', type: 'Brand identity', image: 'photo-1523726491678-bf852e717f6a' },
  { title: 'Print with presence', type: 'Print & packaging', image: 'photo-1504274066651-8d31a536b11a' },
  { title: 'Ideas made visible', type: 'Creative design', image: 'photo-1513364776144-60967b0f800f' }
];

export function imageUrl(image, width = 1000) {
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&q=85`;
}
