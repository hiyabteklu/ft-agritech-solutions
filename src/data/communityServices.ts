export type CommunityService = {
  id: string;
  title: string;
  subtitle: string;
  /** Primary image path (upload these under assets/images/) */
  image: string;
  /** Temporary fallback so the grid looks good before custom images exist */
  fallbackImage: string;
};

/**
 * Six free community services for farmers and rural communities.
 * Clicks currently show “Under development”.
 */
export const communityServices: CommunityService[] = [
  {
    id: 'courses',
    title: 'Product Courses & Tutorials',
    subtitle: 'Free how-to guides for every FT product and category',
    image: '/assets/images/community-courses.jpg',
    fallbackImage: '/assets/images/cat1.jpg',
  },
  {
    id: 'weather',
    title: 'Weather & Rain Forecasts',
    subtitle: 'Ethiopia-wide rain, temperature, and season outlooks',
    image: '/assets/images/community-weather.jpg',
    fallbackImage: '/assets/images/cat2.jpg',
  },
  {
    id: 'pharmacy',
    title: 'Agri Pharmacy Guide',
    subtitle: 'Info-only: herbicides, pesticides & veterinary basics',
    image: '/assets/images/community-pharmacy.jpg',
    fallbackImage: '/assets/images/cat3.jpg',
  },
  {
    id: 'seeds',
    title: 'Seeds & Market Info',
    subtitle: 'Seed varieties, availability tips, and local market signals',
    image: '/assets/images/community-seeds.jpg',
    fallbackImage: '/assets/images/cat4.jpg',
  },
  {
    id: 'yields',
    title: 'Yield Use & Efficiency',
    subtitle: 'Get more value from harvests, storage, and by-products',
    image: '/assets/images/community-yields.jpg',
    fallbackImage: '/assets/images/cat5.jpg',
  },
  {
    id: 'research',
    title: 'Market Research Hub',
    subtitle: 'Trends, prices, and practical research for agri decisions',
    image: '/assets/images/community-research.jpg',
    fallbackImage: '/assets/images/cat6.jpg',
  },
];
