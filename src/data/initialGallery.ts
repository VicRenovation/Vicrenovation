import { GalleryItem } from '../types';

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal_1',
    title: 'Montaj Tâmplărie PVC WDS 8S Antraciet',
    category: 'windows',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    additionalImages: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85'
    ],
    videoUrl: '',
    location: 'Antwerpen, België',
    year: '2026',
    description: 'Instalare completă sistem PVC WDS 8S cu geam triplu termoizolant și profil antracit mat.',
    tags: ['WDS 8S', 'Triple Glass', 'Antraciet'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'gal_2',
    title: 'Renovare Completă Keuken & Living',
    category: 'interior',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
    additionalImages: [
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=85'
    ],
    videoUrl: '',
    location: 'Gent, België',
    year: '2026',
    description: 'Renovare interioară de lux cu bucătărie insulă, iluminat LED integrat și finisaje moderne.',
    tags: ['Interior', 'Keuken', 'Lux'],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'gal_3',
    title: 'Construcție Panouri HSB & Gevelrenovatie',
    category: 'hsb',
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    additionalImages: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85'
    ],
    videoUrl: '',
    location: 'Rotterdam, Nederland',
    year: '2026',
    description: 'Montaj structură ecologică din lemn HSB cu izolație bazaltică și ferestre WDS 7S.',
    tags: ['HSB', 'Gevel', 'Ecologic'],
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];


