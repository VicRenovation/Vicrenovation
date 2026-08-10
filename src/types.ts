export type Language = 'nl' | 'en' | 'ru';

export type ServiceCategory = 'windows' | 'interior' | 'hsb';

export interface ColorFinish {
  id: string;
  name: {
    nl: string;
    en: string;
    ru: string;
  };
  hex: string;
  secondaryHex?: string;
  texture?: 'smooth' | 'wood' | 'mat' | 'metallic';
  previewImage?: string;
}

export interface GlassOption {
  id: string;
  name: {
    nl: string;
    en: string;
    ru: string;
  };
  ugValue: string; // W/m²K
  soundDb: string;
  description: {
    nl: string;
    en: string;
    ru: string;
  };
}

export interface WindowProfile {
  id: string;
  name: string;
  series: string; // e.g. "WDS 8S", "WDS 7S", "WDS 76", "Vic Alum 88"
  type: 'pvc' | 'aluminum';
  chambers: number;
  depthMm: number;
  uwValue: string;
  maxGlassThicknessMm: number;
  soundInsulationDb: number;
  waterTightnessClass: string;
  windLoadClass: string;
  idealFor: {
    nl: string;
    en: string;
    ru: string;
  };
  features: {
    nl: string[];
    en: string[];
    ru: string[];
  };
  availableColors: ColorFinish[];
  defaultImage: string;
  description: {
    nl: string;
    en: string;
    ru: string;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  category: ServiceCategory;
  imageUrl: string;
  additionalImages?: string[];
  videoUrl?: string;
  location?: string;
  year?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
}

export interface TransformationItem {
  id: string;
  title: string;
  category?: ServiceCategory | string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
  description?: string;
  location?: string;
  createdAt?: string;
}

export interface QuoteRequest {
  id: string;
  clientName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  serviceCategory: ServiceCategory | 'combined';
  details: {
    windowProfileId?: string;
    colorId?: string;
    glassOptionId?: string;
    dimensions?: string; // e.g. "200x140 cm"
    quantity?: number;
    roomType?: string; // for interior renovation
    hsbAreaM2?: number; // for HSB panelen
    additionalNotes?: string;
  };
  preferredDate?: string;
  status: 'new' | 'contacted' | 'quoted' | 'scheduled' | 'completed';
  createdAt: string;
}
