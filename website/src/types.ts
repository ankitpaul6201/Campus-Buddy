export interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  college: string;
  location: string;
  condition: 'Like New' | 'Gently Used' | 'Good';
  sellerName: string;
  sellerAvatar: string;
  verified: boolean;
  image: string;
  badge?: string;
  postedTime: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  college: string;
  avatar: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface MapLocationPin {
  id: string;
  name: string;
  collegeCount: string;
  xPercent: number; // Geographical percentage on India map
  yPercent: number;
  isFeatured?: boolean;
  thumbnail: string;
  activeListings: number;
}
