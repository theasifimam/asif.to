export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  image: string;
  images: string[]; // Added multi-image support
  isFavorite: boolean;
}

export const CATEGORIES = ['All', 'Women', 'Men', 'Kids', 'Designer', 'Sports'];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Aviator Sunglasses',
    price: 845,
    rating: 4.8,
    reviews: 120,
    category: 'Men',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511499767390-90342f5b89a7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&q=80&w=800'
    ],
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Tortoiseshell Blue Light',
    price: 489,
    rating: 4.6,
    reviews: 85,
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800'
    ],
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Matte Black Wayfarers',
    price: 710,
    rating: 4.9,
    reviews: 320,
    category: 'All',
    image: 'https://images.unsplash.com/photo-1589176449149-71f7ea77ec25?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1589176449149-71f7ea77ec25?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551352467-33633d98bf7a?auto=format&fit=crop&q=80&w=800'
    ],
    isFavorite: false,
  },
  {
    id: '4',
    name: 'Vintage Round Frames',
    price: 1265,
    rating: 4.7,
    reviews: 210,
    category: 'Designer',
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511499767390-90342f5b89a7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800'
    ],
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Clear Frame Readers',
    price: 855,
    rating: 4.4,
    reviews: 64,
    category: 'Men',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511499767390-90342f5b89a7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1589176449149-71f7ea77ec25?auto=format&fit=crop&q=80&w=800'
    ],
    isFavorite: true,
  },
  {
    id: '6',
    name: 'Kids Neon Blockers',
    price: 745,
    rating: 4.5,
    reviews: 18,
    category: 'Kids',
    image: 'https://images.unsplash.com/photo-1494005826588-25b58776edbc?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1494005826588-25b58776edbc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551352467-33633d98bf7a?auto=format&fit=crop&q=80&w=800'
    ],
    isFavorite: false,
  },
];
