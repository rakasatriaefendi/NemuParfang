import { Perfume, Review } from './types';

export const MOCK_REVIEWS: Record<string, Review[]> = {
  'amber-veil': [
    {
      id: 'rev-1',
      userName: 'Aline R.',
      userAvatar: '/assets/avatar-placeholder.png',
      rating: 5,
      content: 'Absolutely breathtaking. The transition from vanilla to musk is incredibly smooth and holds on the skin for over 9 hours.',
      sentiment: 'positive',
      date: 'May 12, 2026'
    },
    {
      id: 'rev-2',
      userName: 'Julian K.',
      userAvatar: '/assets/avatar-placeholder.png',
      rating: 4,
      content: 'A perfect autumn and winter evening scent. It leaves a very elegant amber trail, though it might be a bit heavy for the office.',
      sentiment: 'positive',
      date: 'April 28, 2026'
    }
  ],
  'morning-fresh': [
    {
      id: 'rev-3',
      userName: 'Sarah M.',
      userAvatar: '/assets/avatar-placeholder.png',
      rating: 5,
      content: 'This smells exactly like a fresh garden in the morning. The orange blossom and lemon combination is incredibly refreshing.',
      sentiment: 'positive',
      date: 'May 20, 2026'
    }
  ],
  'night-elegant': [
    {
      id: 'rev-4',
      userName: 'Dimitri V.',
      userAvatar: '/assets/avatar-placeholder.png',
      rating: 5,
      content: 'Very mysterious and dark. The leather and cinnamon notes blend together beautifully. Highly recommended for formal events.',
      sentiment: 'positive',
      date: 'May 15, 2026'
    }
  ]
};

export const MOCK_PERFUMES: Perfume[] = [
  {
    id: 'amber-veil',
    name: 'Amber Veil',
    brand: 'NemuParfang Private',
    gender: 'unisex',
    occasions: ['Date Night', 'Formal Event'],
    seasons: ['Cool Night', 'Winter', 'Autumn'],
    notes: {
      top: ['Bergamot', 'Lemon'],
      middle: ['Rose', 'Cardamom'],
      base: ['Amber', 'Vanilla', 'Musk']
    },
    accords: [
      { name: 'Amber', percentage: 50, color: '#B89775' },
      { name: 'Vanilla', percentage: 30, color: '#D4B896' },
      { name: 'Musk', percentage: 20, color: '#787470' }
    ],
    longevity: 9,
    sillage: 'strong',
    description: 'A seamless blend of warm resin and soft musk. It opens with a whisper of fresh bergamot and lemon, before settling into a deep, comforting heart of spiced cardamom and rose, and finally resting on a velvety base of amber, vanilla, and white musk.',
    imageUrl: '/assets/fragrance-notes-visual.png', // The primary still life image
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.8,
    reviewCount: 24
  },
  {
    id: 'morning-fresh',
    name: 'Morning Fresh',
    brand: 'NemuParfang',
    gender: 'unisex',
    occasions: ['Daily Wear', 'Work / Office'],
    seasons: ['Warm Day', 'Spring', 'Summer'],
    notes: {
      top: ['Lemon', 'Bergamot', 'Grapefruit'],
      middle: ['Orange Blossom', 'Jasmine', 'Neroli'],
      base: ['Vetiver', 'Musk']
    },
    accords: [
      { name: 'Citrus', percentage: 50, color: '#E1C27B' },
      { name: 'Floral', percentage: 30, color: '#E8CFC1' },
      { name: 'Woody', percentage: 20, color: '#9D958F' }
    ],
    longevity: 6,
    sillage: 'moderate',
    description: 'Crisp, uplifting, citrus start. Captured at the break of dawn, Morning Fresh brings a bright, airy wave of fresh lemons and dewy grapefruit leaves. The heart is filled with fresh orange blossom and neroli, settling into clean vetiver and white musk.',
    imageUrl: '/assets/occasion-casual.png', // Or other morning-related assets
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.6,
    reviewCount: 18
  },
  {
    id: 'night-elegant',
    name: 'Night Elegant',
    brand: 'NemuParfang',
    gender: 'unisex',
    occasions: ['Date Night', 'Formal Event'],
    seasons: ['Cool Night', 'Winter', 'Autumn'],
    notes: {
      top: ['Cardamom', 'Lavender'],
      middle: ['Cinnamon', 'Leather', 'Saffron'],
      base: ['Oud', 'Amber', 'Vanilla']
    },
    accords: [
      { name: 'Warm Spicy', percentage: 40, color: '#885848' },
      { name: 'Woody', percentage: 30, color: '#5B4226' },
      { name: 'Amber', percentage: 30, color: '#B89775' }
    ],
    longevity: 9,
    sillage: 'strong',
    description: 'Deep, mysterious, formal wear. Night Elegant is designed for the sophisticated hours, blending smoky, dark woods like oud and cedar with rich leather, warm cinnamon, and a sweet, sensual finish of vanilla and amber resin.',
    imageUrl: '/assets/weather-cool-night.png',
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.9,
    reviewCount: 32
  },
  {
    id: 'citrus-breeze',
    name: 'Citrus Breeze',
    brand: 'Acqua di Sol',
    gender: 'unisex',
    occasions: ['Daily Wear', 'Sport / Gym'],
    seasons: ['Warm Day', 'Summer'],
    notes: {
      top: ['Lemon', 'Mandarin', 'Bergamot'],
      middle: ['Neroli', 'Basil', 'Mint'],
      base: ['Patchouli', 'Musk']
    },
    accords: [
      { name: 'Citrus', percentage: 65, color: '#E1C27B' },
      { name: 'Fresh Spicy', percentage: 20, color: '#A5C9A5' },
      { name: 'Musky', percentage: 15, color: '#787470' }
    ],
    longevity: 5,
    sillage: 'moderate',
    description: 'A vibrant burst of sun-drenched lemons and sweet mandarin orange, combined with fresh basil, cooling mint, and a dry-down of earthy patchouli. Perfect for hot summer afternoons or active days.',
    imageUrl: '/assets/occasion-hot-water.png',
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.5,
    reviewCount: 14
  },
  {
    id: 'sandalwood-sublime',
    name: 'Sandalwood Sublime',
    brand: 'Earthy Trails',
    gender: 'unisex',
    occasions: ['Work / Office', 'Daily Wear'],
    seasons: ['Spring', 'Autumn'],
    notes: {
      top: ['Cardamom', 'Violet Leaf'],
      middle: ['Sandalwood', 'Cedarwood', 'Papyrus'],
      base: ['Leather', 'Amber', 'Iris']
    },
    accords: [
      { name: 'Woody', percentage: 60, color: '#5B4226' },
      { name: 'Powdery', percentage: 25, color: '#C8B9A6' },
      { name: 'Leather', percentage: 15, color: '#785A46' }
    ],
    longevity: 8,
    sillage: 'moderate',
    description: 'A dry, creamy, and sophisticated woody scent. Centered around Australian sandalwood and cedarwood, accented by green violet leaves, powdery iris, and a smooth leather dry-down. Very professional and non-intrusive.',
    imageUrl: '/assets/occasion-office.png',
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.7,
    reviewCount: 29
  },
  {
    id: 'velvet-rose',
    name: 'Velvet Rose',
    brand: 'La Maison Floral',
    gender: 'female',
    occasions: ['Date Night', 'Formal Event'],
    seasons: ['Spring', 'Cool Night'],
    notes: {
      top: ['Pink Pepper', 'Raspberry'],
      middle: ['Damask Rose', 'Jasmine', 'Peony'],
      base: ['Patchouli', 'Amber', 'Musk']
    },
    accords: [
      { name: 'Floral', percentage: 50, color: '#E8CFC1' },
      { name: 'Fruity', percentage: 30, color: '#E4A5B8' },
      { name: 'Amber', percentage: 20, color: '#B89775' }
    ],
    longevity: 7,
    sillage: 'strong',
    description: 'An elegant, rich rose perfume. It opens with sweet raspberry and spicy pink pepper, unfolding into a magnificent bouquet of Damask rose and peony, anchored by patchouli and white amber.',
    imageUrl: '/assets/occasion-date-night.png',
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.6,
    reviewCount: 22
  },
  {
    id: 'blue-sport',
    name: 'Blue Sport',
    brand: 'Veloce',
    gender: 'male',
    occasions: ['Sport / Gym', 'Daily Wear'],
    seasons: ['Warm Day', 'Summer'],
    notes: {
      top: ['Grapefruit', 'Ginger', 'Aldehydes'],
      middle: ['Sea Water', 'Sage', 'Geranium'],
      base: ['Cedarwood', 'Ambergris']
    },
    accords: [
      { name: 'Aquatic', percentage: 50, color: '#88AAB8' },
      { name: 'Fresh Spicy', percentage: 30, color: '#A5C9A5' },
      { name: 'Woody', percentage: 20, color: '#5B4226' }
    ],
    longevity: 6,
    sillage: 'moderate',
    description: 'An energizing fragrance that blends sharp grapefruit and ginger with refreshing sea water accords, finished by masculine cedarwood and salty ambergris. Clean, fresh, and motivating.',
    imageUrl: '/assets/occasion-formal.png',
    imageUrlSecondary: '/assets/perfume-placeholder.png',
    rating: 4.4,
    reviewCount: 11
  }
];
