import { Listing, Testimonial, FAQItem, MapLocationPin } from '../types';

export const AVAILABLE_CAMPUS = 'SVIET Chandigarh';

export const COLLEGES = [
  'SVIET Chandigarh',
  'Panjab University (PU), Chandigarh',
  'Chandigarh University (CU), Mohali',
  'Chitkara University, Rajpura',
  'Thapar Institute (TIET), Patiala',
  'Punjab Engineering College (PEC), Chandigarh',
  'NIT Jalandhar',
  'IIT Delhi',
  'IIT Bombay',
  'BITS Pilani',
  'Delhi Technological University (DTU)',
  'RV College of Engineering, Bengaluru',
  'Anna University, Chennai',
  'Manipal Institute of Technology (MIT)',
  'NIT Trichy',
  'COEP Tech, Pune',
  'Jadavpur University, Kolkata'
];

export const isCampusAvailable = (name: string): boolean => {
  if (!name) return false;
  const q = name.toLowerCase().trim();
  return (
    q.includes('sviet') ||
    q.includes('swami vivekanand') ||
    q === 'sviet chandigarh'
  );
};

export const CATEGORIES = [
  'All Categories',
  'Books & Notes',
  'Electronics & Calc',
  'Drawing & Lab Gear',
  'Hostel Essentials',
  'Cycles & Mobility',
  'Clothing & Accessories'
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Engineering Drawing Kit (Mini Drafter + Compass Set)',
    price: 350,
    category: 'Drawing & Lab Gear',
    college: 'SVIET Chandigarh',
    location: 'Campus Block B, SVIET',
    condition: 'Like New',
    sellerName: 'Aryan Sharma',
    sellerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    badge: 'Campus Deal',
    postedTime: 'Just now'
  },
  {
    id: 'l2',
    title: 'Casio fx-991EX Classwiz Scientific Calculator',
    price: 500,
    category: 'Electronics & Calc',
    college: 'IIT Bombay',
    location: 'Powai, Mumbai',
    condition: 'Good',
    sellerName: 'Priya Nair',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=500&auto=format&fit=crop&q=80',
    badge: 'Popular',
    postedTime: '5 hours ago'
  },
  {
    id: 'l3',
    title: 'Cormen Algorithms & Tanenbaum OS Combo Textbooks',
    price: 250,
    category: 'Books & Notes',
    college: 'RV College of Engineering, Bengaluru',
    location: 'Mysore Road, Bengaluru',
    condition: 'Gently Used',
    sellerName: 'Rahul Kamath',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    postedTime: '1 day ago'
  },
  {
    id: 'l4',
    title: 'Waterproof Laptop College Backpack (30L)',
    price: 600,
    category: 'Hostel Essentials',
    college: 'BITS Pilani',
    location: 'Pilani Campus, Rajasthan',
    condition: 'Like New',
    sellerName: 'Sneha Patel',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    postedTime: 'Just now'
  },
  {
    id: 'l5',
    title: 'White Cotton Lab Coat (Size 40) + Chemistry Goggles',
    price: 220,
    category: 'Drawing & Lab Gear',
    college: 'Manipal Institute of Technology (MIT)',
    location: 'Manipal, Karnataka',
    condition: 'Good',
    sellerName: 'Tanvi Roy',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500&auto=format&fit=crop&q=80',
    postedTime: '3 hours ago'
  },
  {
    id: 'l6',
    title: 'Rechargeable LED Desk Study Lamp with 3 Modes',
    price: 390,
    category: 'Hostel Essentials',
    college: 'IIT Delhi',
    location: 'Hauz Khas, New Delhi',
    condition: 'Like New',
    sellerName: 'Devansh Joshi',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    verified: true,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
    postedTime: 'Yesterday'
  }
];

export const STATS = [
  { value: 5, suffix: 'K+', label: 'Verified Students' },
  { value: 1, suffix: 'K+', label: 'Campus Listings' },
  { value: 25, suffix: '+', label: 'Colleges & Communities' },
  { value: 4.8, suffix: '/5', label: 'Student Satisfaction', isDecimal: true }
];

export const BENEFITS = [
  {
    id: 'marketplace',
    title: 'Student Marketplace',
    description: 'Buy and sell used books, calculators, drawing kits and everyday college essentials.',
    iconType: 'marketplace'
  },
  {
    id: 'verified',
    title: 'Verified Campus Deals',
    description: 'Discover affordable listings from students in your college community.',
    iconType: 'bag'
  },
  {
    id: 'secure',
    title: 'Easy & Secure',
    description: 'Browse listings, contact sellers and arrange exchanges with greater confidence.',
    iconType: 'shield'
  }
];

export const MAP_PINS: MapLocationPin[] = [
  {
    id: 'sviet',
    name: 'SVIET Chandigarh',
    collegeCount: 'Chandigarh / Punjab',
    xPercent: 29.7,
    yPercent: 20.2,
    isFeatured: true, // Prominent featured pin for SVIET in Chandigarh/Punjab area
    thumbnail: '/sviet-college-icon.png',
    activeListings: 120
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    quote: 'I found the textbooks I needed without having to search multiple groups. It made college shopping much easier.',
    name: 'Rohan Mehta',
    role: '3rd Year Computer Science',
    college: 'Delhi Technological University (DTU)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    rating: 5
  },
  {
    id: 't2',
    quote: 'Campus Buddy gives students a simple way to pass on useful things instead of letting them sit unused.',
    name: 'Ananya Sharma',
    role: '2nd Year Electronics',
    college: 'BITS Pilani',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rating: 5
  },
  {
    id: 't3',
    quote: 'Finding affordable essentials from other students feels much more convenient and budget friendly.',
    name: 'Karthik Iyer',
    role: '1st Year Mechanical Engineering',
    college: 'RV College of Engineering',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5
  },
  {
    id: 't4',
    quote: 'Sold my mini drafter and lab coat within 2 hours of posting! Super smooth handover directly in the campus canteen.',
    name: 'Sneha Roy',
    role: '4th Year Civil Engineering',
    college: 'IIT Bombay',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    rating: 5
  },
  {
    id: 't5',
    quote: 'The verified student badges gave me confidence. I bought a scientific calculator for ₹500 that works like new.',
    name: 'Devansh Joshi',
    role: '2nd Year Electrical Engineering',
    college: 'IIT Delhi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    rating: 5
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'faq1',
    question: 'What is Campus Buddy?',
    answer: 'Campus Buddy is a student-focused marketplace for discovering, buying, selling, and exchanging useful items within a campus community. It helps students reuse essentials like textbooks, calculators, cycles, and hostel gear instead of buying everything brand new.'
  },
  {
    id: 'faq2',
    question: 'Who can use Campus Buddy?',
    answer: 'Campus Buddy is designed for college students and faculty. You can sign up using your personal Gmail or institutional college email to access verified peer-to-peer listings on your campus.'
  },
  {
    id: 'faq3',
    question: 'Is Campus Buddy free to use?',
    answer: 'Yes! Campus Buddy operates on a zero-commission model. Listing items and connecting with fellow student buyers is completely free with no hidden transaction fees or platform deductions.'
  },
  {
    id: 'faq4',
    question: 'What can I buy or sell?',
    answer: 'Students can discover or list relevant campus items including textbooks, lecture notes, academic supplies, calculators, mini drafters, lab equipment, cycles, electronics, and hostel essentials, subject to platform listing rules.'
  },
  {
    id: 'faq5',
    question: 'How do I start buying or selling?',
    answer: 'Download the Campus Buddy mobile app, create or verify your student account, and follow the simple in-app flow. You can browse nearby listings or tap "Sell" to post your unused item in under 60 seconds.'
  },
  {
    id: 'faq6',
    question: 'How can I stay safe when exchanging items?',
    answer: 'Always arrange handovers during daylight hours in familiar, public campus locations such as the college canteen, central library, department lobby, or campus gates. Inspect items in person before completing the exchange.'
  },
  {
    id: 'faq7',
    question: 'Does Campus Buddy provide delivery?',
    answer: 'No. Campus Buddy is an on-campus community marketplace where exchanges are coordinated directly between students on campus grounds. This eliminates shipping costs and ensures instant handovers.'
  },
  {
    id: 'faq8',
    question: 'Where can I report a problem?',
    answer: 'You can report suspicious listings, inappropriate behavior, or app issues directly using the in-app "Report" button, or contact our student support team anytime at support@campusbuddy.in.'
  },
  {
    id: 'faq9',
    question: 'Can I offer my skills or freelance services on Campus Buddy?',
    answer: 'Yes! We are launching our Student Skill Exchange feature soon. Students skilled in coding, photography, graphic design, video editing, or tutoring will be able to list their services, connect with campus peers who need assistance, and earn an income right on campus with zero platform cuts.'
  }
];

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  itemCount: string;
  stats: string;
  badge?: string;
  popularItems: string[];
  iconType: string;
  gradient: string;
  image: string;
  themeColor: string;
  buttonBg: string;
}

export const MARKETPLACE_CATEGORIES: CategoryItem[] = [
  {
    id: 'textbooks',
    name: 'Textbooks & Notes',
    description: 'Semester reference books, syllabus guides, and verified handwritten lecture notes.',
    itemCount: '350+ items',
    stats: '350+ Listings • Verified Notes',
    popularItems: ['Engineering Math', 'Data Structures', 'GATE Notes'],
    iconType: 'book',
    gradient: 'from-[#0860E8]/10 to-[#9DD6FA]/20',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=900&auto=format&fit=crop&q=85',
    themeColor: '#0860E8',
    buttonBg: 'from-[#0860E8]/95 to-[#0284C7]/95'
  },
  {
    id: 'stationery',
    name: 'Stationery & Supplies',
    description: 'Lab record files, graph pads, geometry kits, compasses, and artist materials.',
    itemCount: '180+ items',
    stats: '180+ Tools • Sheet Holders',
    popularItems: ['Lab Manuals', 'Sheet Containers', 'Marker Sets'],
    iconType: 'pen',
    gradient: 'from-[#FF874B]/10 to-[#FFA97A]/25',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=900&auto=format&fit=crop&q=85',
    themeColor: '#EA580C',
    buttonBg: 'from-[#EA580C]/95 to-[#F97316]/95'
  },
  {
    id: 'calculators',
    name: 'Calculators & Drafters',
    description: 'Scientific & graphic calculators, mini drafters, T-squares, and engineering tools.',
    itemCount: '120+ items',
    stats: '120+ Sets • Casio 991EX',
    popularItems: ['Casio fx-991EX', 'Mini Drafters', 'Engineering Rulers'],
    iconType: 'calculator',
    gradient: 'from-[#10B981]/10 to-[#6EE7B7]/25',
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=900&auto=format&fit=crop&q=85',
    themeColor: '#059669',
    buttonBg: 'from-[#059669]/95 to-[#10B981]/95'
  },
  {
    id: 'cycles',
    name: 'Cycles & Mobility',
    description: 'Campus-friendly geared & single-speed bicycles, helmets, locks, and accessories.',
    itemCount: '65+ items',
    stats: '65+ Bicycles • U-Locks',
    popularItems: ['Hero Sprint', 'Firefox Bicycles', 'U-Locks'],
    iconType: 'bike',
    gradient: 'from-[#2563EB]/10 to-[#60A5FA]/25',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=85',
    themeColor: '#2563EB',
    buttonBg: 'from-[#2563EB]/95 to-[#3B82F6]/95'
  },
  {
    id: 'electronics',
    name: 'Electronics & Gadgets',
    description: 'Study desk lamps, power banks, extension boards, earphones, and monitors.',
    itemCount: '210+ items',
    stats: '210+ Gadgets • Desk Lamps',
    popularItems: ['LED Desk Lamps', 'Extension Spikes', 'Bluetooth Speakers'],
    iconType: 'gadgets',
    gradient: 'from-[#0284C7]/10 to-[#38BDF8]/25',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=900&auto=format&fit=crop&q=85',
    themeColor: '#0284C7',
    buttonBg: 'from-[#0284C7]/95 to-[#38BDF8]/95'
  },
  {
    id: 'hostel',
    name: 'Hostel & Dorm Gear',
    description: 'Electric kettles, study organizers, mattresses, laundry hampers, and room coolers.',
    itemCount: '190+ items',
    stats: '190+ Essentials • Kettles',
    popularItems: ['Electric Kettles', 'Laundry Bags', 'Hangers & Buckets'],
    iconType: 'home',
    gradient: 'from-[#D97706]/10 to-[#F59E0B]/25',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=85',
    themeColor: '#D97706',
    buttonBg: 'from-[#D97706]/95 to-[#F59E0B]/95'
  },
  {
    id: 'skills',
    name: 'Student Skills & Gigs',
    description: 'Hire talented campus peers or offer your skills in coding, photography, graphic design, and video editing to earn.',
    itemCount: 'Upcoming',
    stats: 'Upcoming • Coding, Photos, Design',
    badge: 'Launching Soon',
    popularItems: ['Coding & Dev', 'Photography', 'UI/UX & Graphics'],
    iconType: 'code',
    gradient: 'from-[#0860E8]/12 to-[#38BDF8]/20',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=85',
    themeColor: '#0860E8',
    buttonBg: 'from-[#0860E8]/95 to-[#38BDF8]/95'
  },
  {
    id: 'other',
    name: 'Campus Life & Essentials',
    description: 'Sports equipment, musical instruments, bags, lab coats, and campus event tickets.',
    itemCount: '95+ items',
    stats: '95+ Items • Sports & Labs',
    popularItems: ['Badminton Rackets', 'Lab Coats', 'Guitar Picks'],
    iconType: 'sparkles',
    gradient: 'from-[#334155]/10 to-[#64748B]/25',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=85',
    themeColor: '#334155',
    buttonBg: 'from-[#334155]/95 to-[#64748B]/95'
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Download the app',
    description: 'Install Campus Buddy on your phone and create your student account using your personal Gmail or college email.',
    badge: 'Step 1'
  },
  {
    step: '02',
    title: 'Discover or list items',
    description: 'Browse essentials listed by fellow students, or snap a photo to list your unused items in under 60 seconds.',
    badge: 'Step 2'
  },
  {
    step: '03',
    title: 'Connect and exchange',
    description: 'Chat securely in-app, agree on a price, and meet at a convenient campus spot for a hassle-free handover.',
    badge: 'Step 3'
  }
];

export const TRUST_INDICATORS = [
  {
    id: 'commission',
    title: 'Zero Commission',
    shortDesc: '0% platform fees. Every rupee goes directly to the student seller.',
    iconName: 'percent'
  },
  {
    id: 'verification',
    title: 'College Verified Accounts',
    shortDesc: 'Exclusively for college students with campus credential checks.',
    iconName: 'badge'
  },
  {
    id: 'handover',
    title: 'Hostel Handover',
    shortDesc: 'Instant exchanges in your hostel, department lobby, or library.',
    iconName: 'building'
  }
];

export const TRUST_SAFETY_POINTS = [
  {
    title: 'Student-Focused Community',
    description: 'Built exclusively for college peers to buy, sell, and exchange within familiar campus networks.',
    icon: 'users'
  },
  {
    title: 'Institutional Account Verification',
    description: 'Students verify via personal Gmail or college email alongside official ID card checks before trading on campus.',
    icon: 'shield-check'
  },
  {
    title: 'Private In-App Messaging',
    description: 'Coordinate deals and ask questions safely without exposing your personal phone number or social profiles.',
    icon: 'message'
  },
  {
    title: 'Campus-Ground Handovers & Reporting',
    description: 'Meet in daylight in public college spots like cafeterias or libraries, with 1-tap listing reporting for safety.',
    icon: 'flag'
  }
];

