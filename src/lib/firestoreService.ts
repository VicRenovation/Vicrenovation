import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { GalleryItem, TransformationItem, QuoteRequest } from '../types';

// Initial default seed data
export const INITIAL_GALLERY_DATA: GalleryItem[] = [];

export const INITIAL_TRANSFORMATIONS_DATA: TransformationItem[] = [
  {
    id: 'trans_1',
    title: 'Vervanging Oude Kozijnen door WDS 8S Antraciet',
    category: 'windows',
    beforeImageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
    afterImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    beforeLabel: 'Oude Houten Kozijnen',
    afterLabel: 'WDS 8S Triple Glas',
    description: 'Tochtige houten ramen vervangen door hoogisolerende WDS 8S profielen met driedubbele beglazing.',
    location: 'Antwerpen, België',
    createdAt: new Date().toISOString()
  },
  {
    id: 'trans_2',
    title: 'Luxe Interieur & Keuken Transformatie',
    category: 'interior',
    beforeImageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1600&q=85',
    afterImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
    beforeLabel: 'Gedateerde Ruimte',
    afterLabel: 'Luxe Maatwerk Keuken',
    description: 'Totaalrenovatie met eilandkeuken, strakke leidingen en inbouw verlichting.',
    location: 'Gent, België',
    createdAt: new Date().toISOString()
  },
  {
    id: 'trans_3',
    title: 'HSB Gevelrenovatie met WDS 7S Ramen',
    category: 'hsb',
    beforeImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85',
    afterImageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
    beforeLabel: 'Oude Gevel',
    afterLabel: 'HSB Panelen + WDS 7S',
    description: 'Ecologische HSB-panelen met geïntegreerde WDS 7S PVC ramen.',
    location: 'Rotterdam, Nederland',
    createdAt: new Date().toISOString()
  }
];

// --- GALLERY ---
export async function fetchGalleryFromFirestore(): Promise<GalleryItem[]> {
  try {
    const colRef = collection(db, 'gallery');
    const snapshot = await getDocs(colRef);
    const items = snapshot.docs.map(doc => doc.data() as GalleryItem);
    return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Firestore gallery fetch error, fallback to REST or local:', err);
    try {
      const res = await fetch('/api/gallery');
      return await res.json();
    } catch (e) {
      return [];
    }
  }
}

export async function saveGalleryItemToFirestore(item: GalleryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'gallery', item.id), item);
  } catch (err) {
    console.error('Firestore gallery save error:', err);
  }
  try {
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch (e) {}
}

export async function updateGalleryItemInFirestore(item: GalleryItem): Promise<void> {
  try {
    await setDoc(doc(db, 'gallery', item.id), item, { merge: true });
  } catch (err) {
    console.error('Firestore gallery update error:', err);
  }
  try {
    await fetch(`/api/gallery/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch (e) {}
}

export async function deleteGalleryItemFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'gallery', id));
  } catch (err) {
    console.error('Firestore gallery delete error:', err);
  }
  try {
    await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
  } catch (e) {}
}

// --- TRANSFORMATIONS ---
export async function fetchTransformationsFromFirestore(): Promise<TransformationItem[]> {
  try {
    const colRef = collection(db, 'transformations');
    const statusRef = doc(db, 'system', 'transformations_status');
    const statusDoc = await getDoc(statusRef);

    if (!statusDoc.exists()) {
      // First time initialization in Firestore
      await setDoc(statusRef, { seeded: true, updatedAt: new Date().toISOString() });
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        for (const item of INITIAL_TRANSFORMATIONS_DATA) {
          await setDoc(doc(db, 'transformations', item.id), item);
        }
        return INITIAL_TRANSFORMATIONS_DATA;
      }
    }

    const snapshot = await getDocs(colRef);
    const items = snapshot.docs.map(doc => doc.data() as TransformationItem);
    return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Firestore transformations fetch error, fallback to REST:', err);
    try {
      const res = await fetch('/api/transformations');
      return await res.json();
    } catch (e) {
      return [];
    }
  }
}

export async function saveTransformationToFirestore(item: TransformationItem): Promise<void> {
  try {
    await setDoc(doc(db, 'transformations', item.id), item);
  } catch (err) {
    console.error('Firestore transformation save error:', err);
  }
  try {
    await fetch('/api/transformations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch (e) {}
}

export async function deleteTransformationFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'transformations', id));
  } catch (err) {
    console.error('Firestore transformation delete error:', err);
  }
  try {
    await fetch(`/api/transformations/${id}`, { method: 'DELETE' });
  } catch (e) {}
}

// --- QUOTES ---
export async function fetchQuotesFromFirestore(): Promise<QuoteRequest[]> {
  try {
    const colRef = collection(db, 'quotes');
    const snapshot = await getDocs(colRef);
    const items = snapshot.docs.map(doc => doc.data() as QuoteRequest);
    return items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (err) {
    console.error('Firestore quotes fetch error, fallback to REST:', err);
    const res = await fetch('/api/quotes');
    return res.json();
  }
}

export async function saveQuoteToFirestore(quote: QuoteRequest): Promise<void> {
  try {
    await setDoc(doc(db, 'quotes', quote.id), quote);
  } catch (err) {
    console.error('Firestore quote save error, trying REST API:', err);
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });
  }
}

export async function updateQuoteStatusInFirestore(id: string, status: string): Promise<void> {
  try {
    const docRef = doc(db, 'quotes', id);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error('Firestore quote status update error, trying REST API:', err);
    await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  }
}

// --- PROFILES OVERRIDES ---
export async function fetchProfilesFromFirestore(): Promise<Record<string, string>> {
  try {
    const colRef = collection(db, 'profiles');
    const snapshot = await getDocs(colRef);
    const overrides: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.imageUrl) {
        overrides[doc.id] = data.imageUrl;
      }
    });
    return overrides;
  } catch (err) {
    console.error('Firestore profiles fetch error, fallback to REST:', err);
    const res = await fetch('/api/profiles');
    return res.json();
  }
}

export async function saveProfileOverrideToFirestore(profileId: string, imageUrl: string): Promise<void> {
  try {
    await setDoc(doc(db, 'profiles', profileId), { profileId, imageUrl });
  } catch (err) {
    console.error('Firestore profile save error, trying REST API:', err);
    await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, imageUrl }),
    });
  }
}
