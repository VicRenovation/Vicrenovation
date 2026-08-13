import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { GalleryItem, QuoteRequest, ServiceCategory, TransformationItem } from '../types';
import { Lock, X, Plus, Trash2, Image as ImageIcon, FileText, AlertCircle, Upload, Shield, SlidersHorizontal, ArrowRight, Layers, Film, CheckCircle2, Edit3, Save, Sparkles } from 'lucide-react';
import {
  fetchGalleryFromFirestore,
  saveGalleryItemToFirestore,
  updateGalleryItemInFirestore,
  deleteGalleryItemFromFirestore,
  fetchTransformationsFromFirestore,
  saveTransformationToFirestore,
  deleteTransformationFromFirestore,
  fetchQuotesFromFirestore,
  updateQuoteStatusInFirestore,
  deleteQuoteFromFirestore,
  fetchProfilesFromFirestore,
  saveProfileOverrideToFirestore
} from '../lib/firestoreService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'gallery' | 'transformations' | 'quotes' | 'profiles'>('gallery');

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ServiceCategory>('windows');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newAddImgInput, setNewAddImgInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  // Edit existing gallery project modal state
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [editAddImgInput, setEditAddImgInput] = useState('');

  // Profiles custom images state
  const [profileImages, setProfileImages] = useState<Record<string, string>>({
    wds_8s: '/images/profiles/wds_8s.png',
    wds_7s: '/images/profiles/wds_7s.png',
    wds_6s: '/images/profiles/wds_6s.png',
    wds_5s: '/images/profiles/wds_5s.png',
  });
  const [saveProfileMsg, setSaveProfileMsg] = useState('');

  // Transformations state
  const [transformations, setTransformations] = useState<TransformationItem[]>([]);
  const [editingTransformation, setEditingTransformation] = useState<TransformationItem | null>(null);
  const [transTitle, setTransTitle] = useState('');
  const [transCategory, setTransCategory] = useState<ServiceCategory>('windows');
  const [transBeforeImageUrl, setTransBeforeImageUrl] = useState('');
  const [transAfterImageUrl, setTransAfterImageUrl] = useState('');
  const [transBeforeLabel, setTransBeforeLabel] = useState('Înainte');
  const [transAfterLabel, setTransAfterLabel] = useState('După');
  const [transLocation, setTransLocation] = useState('');
  const [transDescription, setTransDescription] = useState('');
  const [isAddingTrans, setIsAddingTrans] = useState(false);

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);

  // Load data on auth
  useEffect(() => {
    if (isAuthenticated) {
      loadGallery();
      loadTransformations();
      loadQuotes();
      loadProfiles();
    }
  }, [isAuthenticated]);

  const loadGallery = async () => {
    try {
      const data = await fetchGalleryFromFirestore();
      if (Array.isArray(data)) setGalleryItems(data);
    } catch (err) {
      console.error('Error loading gallery in admin:', err);
    }
  };

  const loadTransformations = async () => {
    try {
      const data = await fetchTransformationsFromFirestore();
      if (Array.isArray(data)) setTransformations(data);
    } catch (err) {
      console.error('Error loading transformations in admin:', err);
    }
  };

  const loadQuotes = async () => {
    try {
      const data = await fetchQuotesFromFirestore();
      if (Array.isArray(data)) setQuotes(data);
    } catch (err) {
      console.error('Error loading quotes in admin:', err);
    }
  };

  const loadProfiles = async () => {
    try {
      const data = await fetchProfilesFromFirestore();
      if (data && typeof data === 'object') {
        setProfileImages((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      const cached = localStorage.getItem('vr_profile_images');
      if (cached) {
        try {
          setProfileImages((prev) => ({ ...prev, ...JSON.parse(cached) }));
        } catch (e) {}
      }
    }
  };

  const saveProfileImage = async (profileId: string, imageUrl: string) => {
    try {
      await saveProfileOverrideToFirestore(profileId, imageUrl);
      const updated = { ...profileImages, [profileId]: imageUrl };
      setProfileImages(updated);
      localStorage.setItem('vr_profile_images', JSON.stringify(updated));
      setSaveProfileMsg(`Foto voor ${profileId.toUpperCase()} succesvol opgeslagen!`);
      setTimeout(() => setSaveProfileMsg(''), 3000);
    } catch (err) {
      const updated = { ...profileImages, [profileId]: imageUrl };
      setProfileImages(updated);
      localStorage.setItem('vr_profile_images', JSON.stringify(updated));
      setSaveProfileMsg(`Foto opgeslagen in lokale cache.`);
      setTimeout(() => setSaveProfileMsg(''), 3000);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === 'RenitaVicRenovation' || password === 'vic2026' || password === 'admin' || password === 'vic') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Client-side image compression helper to make sure base64 photos are lightweight (~80-120KB)
  // so they fit inside Firestore (1MB limit) and localStorage (5MB limit) without lag or quota errors on Vercel
  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.82): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result?.toString() || '');
        reader.readAsDataURL(file);
      });
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } else {
            resolve(e.target?.result?.toString() || '');
          }
        };
        img.onerror = () => resolve(e.target?.result?.toString() || '');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // File Upload Helper: compresses images to compact permanent Data URLs stored in Firestore
  const uploadFileToServer = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadStatus('Optimizare și salvare imagine...');

    // 1. For image files: compress to compact Data URL so it is stored permanently in Cloud Firestore.
    // This ensures photos NEVER disappear when the server or container restarts!
    if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|heic|bmp)$/i.test(file.name)) {
      try {
        const compressedDataUrl = await compressImageFile(file, 850, 0.65);
        setIsUploading(false);
        setUploadStatus('');
        if (compressedDataUrl) return compressedDataUrl;
      } catch (e) {
        console.error('Image compression failed, falling back to server upload:', e);
      }
    }

    // 2. For video or non-image files, upload to server endpoint
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setIsUploading(false);
        setUploadStatus('');
        return data.url;
      }
    } catch (err) {
      console.warn('Server upload endpoint failed:', err);
    }

    setIsUploading(false);
    setUploadStatus('');
    return '';
  };

  // Upload multiple files helper
  const uploadMultipleFilesToServer = async (files: FileList | File[]): Promise<string[]> => {
    setIsUploading(true);
    const urls: string[] = [];
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      setUploadStatus(`Se încarcă fotografia ${i + 1} din ${fileArray.length}...`);
      const url = await uploadFileToServer(fileArray[i]);
      if (url) urls.push(url);
    }

    setIsUploading(false);
    setUploadStatus('');
    return urls;
  };

  // Image File Upload Helper for Gallery Cover
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) setNewImageUrl(url);
    }
  };

  // Image File Upload Helper for Additional Process Photos (Supports multiple files!)
  const handleAdditionalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const urls = await uploadMultipleFilesToServer(e.target.files);
      if (urls.length > 0) {
        setAdditionalImages((prev) => [...prev, ...urls]);
      }
      e.target.value = '';
    }
  };

  const addAddImgFromInput = () => {
    if (newAddImgInput.trim()) {
      setAdditionalImages((prev) => [...prev, newAddImgInput.trim()]);
      setNewAddImgInput('');
    }
  };

  // Profile Upload Helper
  const handleProfileFileUpload = async (profileId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) saveProfileImage(profileId, url);
    }
  };

  // Image File Upload Helpers for Transformations
  const handleBeforeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) setTransBeforeImageUrl(url);
    }
  };

  const handleAfterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) setTransAfterImageUrl(url);
    }
  };

  // Video File Upload Helpers
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) setVideoUrl(url);
    }
  };

  // Handle Add Gallery Photo
  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newImageUrl) {
      alert('Vă rugăm să introduceți titlul și fotografia principală (sau să încărcați o imagine).');
      return;
    }

    setIsAddingPhoto(true);

    const newItem: GalleryItem = {
      id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newTitle,
      category: newCategory,
      imageUrl: newImageUrl,
      additionalImages: additionalImages || [],
      videoUrl: videoUrl || '',
      location: newLocation || 'Benelux',
      year: new Date().getFullYear().toString(),
      description: newDescription || '',
      tags: ['Nieuw'],
      createdAt: new Date().toISOString(),
    };

    try {
      await saveGalleryItemToFirestore(newItem);
      const updated = [newItem, ...galleryItems];
      setGalleryItems(updated);
      try {
        localStorage.setItem('vr_gallery_cache', JSON.stringify(updated));
      } catch (e) {}

      setNewTitle('');
      setNewImageUrl('');
      setAdditionalImages([]);
      setVideoUrl('');
      setNewLocation('');
      setNewDescription('');
    } catch (err) {
      console.error('Error adding photo to Firestore:', err);
    } finally {
      setIsAddingPhoto(false);
    }
  };

  // Handle Add Transformation
  const handleAddTransformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transTitle || !transBeforeImageUrl || !transAfterImageUrl) return;

    setIsAddingTrans(true);

    const newItem: TransformationItem = {
      id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: transTitle,
      category: transCategory,
      beforeImageUrl: transBeforeImageUrl,
      afterImageUrl: transAfterImageUrl,
      beforeLabel: 'Voor',
      afterLabel: 'Na',
      location: transLocation || 'Benelux',
      description: transDescription,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveTransformationToFirestore(newItem);
      const updated = [newItem, ...transformations];
      setTransformations(updated);
      try {
        localStorage.setItem('vr_transformations_cache', JSON.stringify(updated));
      } catch (e) {}

      setTransTitle('');
      setTransBeforeImageUrl('');
      setTransAfterImageUrl('');
      setTransBeforeLabel('Voor');
      setTransAfterLabel('Na');
      setTransLocation('');
      setTransDescription('');
    } catch (err) {
      console.error('Error adding transformation:', err);
    } finally {
      setIsAddingTrans(false);
    }
  };

  const handleStartEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem({
      ...item,
      additionalImages: item.additionalImages ? [...item.additionalImages] : [],
    });
    setEditAddImgInput('');
  };

  const handleSaveEditGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem) return;

    try {
      await updateGalleryItemInFirestore(editingGalleryItem);
      const updatedList = galleryItems.map((it) => (it.id === editingGalleryItem.id ? editingGalleryItem : it));
      setGalleryItems(updatedList);
      try {
        localStorage.setItem('vr_gallery_cache', JSON.stringify(updatedList));
      } catch (e) {}
      setEditingGalleryItem(null);
    } catch (err) {
      console.error('Error updating gallery item:', err);
      setEditingGalleryItem(null);
    }
  };

  const handleEditCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingGalleryItem) {
      const url = await uploadFileToServer(file);
      if (url) {
        setEditingGalleryItem((prev) => (prev ? { ...prev, imageUrl: url } : null));
      }
    }
  };

  const handleEditAddImgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && editingGalleryItem) {
      const urls = await uploadMultipleFilesToServer(e.target.files);
      if (urls.length > 0) {
        setEditingGalleryItem((prev) => {
          if (!prev) return null;
          const current = prev.additionalImages || [];
          return { ...prev, additionalImages: [...current, ...urls] };
        });
      }
      e.target.value = '';
    }
  };

  const handleEditVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingGalleryItem) {
      const url = await uploadFileToServer(file);
      if (url) {
        setEditingGalleryItem((prev) => (prev ? { ...prev, videoUrl: url } : null));
      }
    }
  };

  const handleDeletePhoto = async (id: string) => {
    const updated = galleryItems.filter((item) => item.id !== id);
    setGalleryItems(updated);
    try {
      localStorage.setItem('vr_gallery_cache', JSON.stringify(updated));
    } catch (e) {}

    try {
      await deleteGalleryItemFromFirestore(id);
    } catch (err) {
      console.error('Error deleting photo in Firestore:', err);
    }
  };

  const handleDeleteTransformation = async (id: string) => {
    const updated = transformations.filter((item) => item.id !== id);
    setTransformations(updated);
    try {
      localStorage.setItem('vr_transformations_cache', JSON.stringify(updated));
    } catch (e) {}

    try {
      await deleteTransformationFromFirestore(id);
    } catch (err) {
      console.error('Error deleting transformation in Firestore:', err);
    }
  };

  const handleStartEditTransformation = (item: TransformationItem) => {
    setEditingTransformation({ ...item });
  };

  const handleSaveEditTransformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransformation) return;

    try {
      await saveTransformationToFirestore(editingTransformation);
      const updatedList = transformations.map((it) => (it.id === editingTransformation.id ? editingTransformation : it));
      setTransformations(updatedList);
      try {
        localStorage.setItem('vr_transformations_cache', JSON.stringify(updatedList));
      } catch (e) {}
      setEditingTransformation(null);
    } catch (err) {
      console.error('Error updating transformation item:', err);
      setEditingTransformation(null);
    }
  };

  const handleEditTransBeforeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTransformation) {
      const url = await uploadFileToServer(file);
      if (url) {
        setEditingTransformation((prev) => (prev ? { ...prev, beforeImageUrl: url } : null));
      }
    }
  };

  const handleEditTransAfterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingTransformation) {
      const url = await uploadFileToServer(file);
      if (url) {
        setEditingTransformation((prev) => (prev ? { ...prev, afterImageUrl: url } : null));
      }
    }
  };

  const handleUpdateQuoteStatus = async (id: string, status: string) => {
    try {
      await updateQuoteStatusInFirestore(id, status);
      setQuotes(
        quotes.map((q) => (q.id === id ? { ...q, status: status as any } : q))
      );
    } catch (err) {
      console.error('Error updating quote status in Firestore:', err);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!window.confirm('Ești sigur că dorești să ștergi această cerere de ofertă?')) return;
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    try {
      await deleteQuoteFromFirestore(id);
    } catch (err) {
      console.error('Error deleting quote in Firestore:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {isAuthenticated ? 'Panou de Administrare VicRenovation' : 'Beheerderspaneel VicRenovation'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Auth Guard */}
        {!isAuthenticated ? (
          <div className="p-8 space-y-6 text-center max-w-md mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Lock className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Beheerders Login</h4>
              <p className="text-xs text-slate-400">Voer het wachtwoord in om projecten en offertes te beheren.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Voer wachtwoord in"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />

              {authError && (
                <div className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Onjuist wachtwoord. Probeer het opnieuw.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg"
              >
                Inloggen als Beheerder
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
              <button
                onClick={() => setActiveTab('gallery')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'gallery'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                <span>Galerie Proiecte ({galleryItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('transformations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'transformations'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Transformări Înainte / După ({transformations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quotes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'quotes'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Cereri de Ofertă ({quotes.length})</span>
              </button>
            </div>

            {/* TAB 1: GALLERY MANAGER */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                
                {/* Upload Status Notification */}
                {isUploading && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse shadow-lg">
                    <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                    <span>{uploadStatus || 'Se încarcă fișierul / videoclipul pe server...'}</span>
                  </div>
                )}

                {/* Form to Add Photo */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adaugă Proiect Nou în Galerie
                  </h4>

                  <form onSubmit={handleAddPhoto} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Titlu Proiect *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="ex. Montaj Tâmplărie WDS 8S Anvers"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">Categorie *</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as ServiceCategory)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="windows">Uși & Ferestre</option>
                          <option value="interior">Renovări Interioare</option>
                          <option value="hsb">Panouri HSB (Cadru Lemn)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">URL Foto Principală (Copertă) *</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://... sau încarcă fișier 👉"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 hover:text-white shrink-0" title="Încarcă din PC">
                            <Upload className="h-4 w-4" />
                            <input type="file" accept="image/*" onChange={handleGalleryFileUpload} className="hidden" />
                          </label>
                        </div>
                        {newImageUrl && (
                          <div className="mt-2 flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
                            <img src={newImageUrl} alt="Preview" className="h-16 w-24 object-cover rounded-lg border border-slate-700 shrink-0" />
                            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Foto pregătită pentru salvare!</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">Locație</label>
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="ex. Anvers, Belgia"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Additional Photos for Multi-Photo Project */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                      <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Adaugă Fotografii Suplimentare la Proiect (Fotografii de Proces)
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newAddImgInput}
                          onChange={(e) => setNewAddImgInput(e.target.value)}
                          placeholder="URL foto suplimentară (ex. foto detaliu, foto proces)..."
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={addAddImgFromInput}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                        >
                          + URL
                        </button>
                        <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:text-white flex items-center gap-1 shrink-0">
                          <Upload className="h-3.5 w-3.5" />
                          <span>+ Încarcă Poze</span>
                          <input type="file" accept="image/*" multiple onChange={handleAdditionalFileUpload} className="hidden" />
                        </label>
                      </div>

                      {additionalImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {additionalImages.map((img, idx) => (
                            <div key={idx} className="relative group h-16 w-20 rounded-lg overflow-hidden border border-slate-700">
                              <img src={img} alt={`Extra ${idx}`} className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-80 hover:opacity-100"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Video Upload & URL */}
                    <div>
                      <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                        <Film className="h-3.5 w-3.5 text-emerald-400" />
                        Videoclip de pe Șantier (Încarcă din PC sau URL YouTube)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/... sau încarcă fișier video din PC 👉"
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <label className="cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 shrink-0" title="Încarcă fișier video din PC">
                          <Upload className="h-4 w-4" />
                          <span>Încarcă Video</span>
                          <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                        </label>
                      </div>
                      {videoUrl && (
                        <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-emerald-400 font-semibold truncate flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Videoclip atașat
                          </span>
                          <button
                            type="button"
                            onClick={() => setVideoUrl('')}
                            className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                          >
                            Șterge video
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300">Descriere Scurtă</label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Scurtă descriere a proiectului..."
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {newImageUrl && (
                      <div className="h-28 w-44 rounded-xl overflow-hidden border border-slate-700 relative">
                        <img src={newImageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-white">Previzualizare Copertă</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAddingPhoto || !newTitle || !newImageUrl}
                      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      Adaugă Proiect în Galerie
                    </button>
                  </form>
                </div>

                {/* Existing Gallery Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Proiecte Existente în Galerie ({galleryItems.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galleryItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-16 w-16 rounded-xl object-cover shrink-0 bg-slate-900"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-white truncate">{item.title}</div>
                          <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                            {item.category === 'windows' ? 'Uși & Ferestre' : item.category === 'interior' ? 'Renovări Interioare' : 'Panouri HSB'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.location}
                            {item.additionalImages && item.additionalImages.length > 0 && (
                              <span className="ml-1 text-emerald-400">({item.additionalImages.length + 1} fotografii)</span>
                            )}
                            {item.videoUrl && <span className="ml-1 text-rose-400">(Video 🎥)</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEditGalleryItem(item)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Editează / Gestionează Fotografii Suplimentare"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(item.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="Șterge Proiect"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edit Gallery Project Modal */}
                {editingGalleryItem && (
                  <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
                    <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                          <Edit3 className="h-5 w-5 text-emerald-400" />
                          <span>Editare Proiect & Gestionează Fotografii</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingGalleryItem(null)}
                          className="h-8 w-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveEditGalleryItem} className="space-y-4">
                        {/* Title */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Titlu Proiect</label>
                          <input
                            type="text"
                            value={editingGalleryItem.title}
                            onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            required
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Categorie</label>
                          <select
                            value={editingGalleryItem.category}
                            onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value as ServiceCategory })}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="windows">Uși & Ferestre</option>
                            <option value="interior">Renovări Interioare</option>
                            <option value="hsb">Panouri HSB</option>
                          </select>
                        </div>

                        {/* Cover Photo */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">URL Foto Principală (Copertă)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingGalleryItem.imageUrl}
                              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, imageUrl: e.target.value })}
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                              required
                            />
                            <label className="cursor-pointer rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-slate-700 flex items-center gap-1.5 shrink-0">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Încarcă</span>
                              <input type="file" accept="image/*" onChange={handleEditCoverFileUpload} className="hidden" />
                            </label>
                          </div>
                          {editingGalleryItem.imageUrl && (
                            <img src={editingGalleryItem.imageUrl} alt="Cover preview" className="mt-2 h-20 w-32 object-cover rounded-xl border border-slate-800" />
                          )}
                        </div>

                        {/* Additional Images list & upload */}
                        <div className="space-y-2 border-t border-slate-800 pt-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-emerald-400">
                              Fotografii Suplimentare de Proces (Mai multe poze)
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              ({(editingGalleryItem.additionalImages || []).length} fotografii extra)
                            </span>
                          </div>

                          {/* List of current additional images */}
                          {editingGalleryItem.additionalImages && editingGalleryItem.additionalImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950 rounded-xl border border-slate-800">
                              {editingGalleryItem.additionalImages.map((img, idx) => (
                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 h-20">
                                  <img src={img} alt={`Extra ${idx + 1}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newArr = editingGalleryItem.additionalImages?.filter((_, i) => i !== idx);
                                      setEditingGalleryItem({ ...editingGalleryItem, additionalImages: newArr });
                                    }}
                                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-md"
                                    title="Șterge această fotografie"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[8px] font-bold text-center text-emerald-400 py-0.5">
                                    Foto #{idx + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add new additional image input + button */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="https://... (URL Foto Suplimentară)"
                              value={editAddImgInput}
                              onChange={(e) => setEditAddImgInput(e.target.value)}
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editAddImgInput.trim()) {
                                  setEditingGalleryItem({
                                    ...editingGalleryItem,
                                    additionalImages: [...(editingGalleryItem.additionalImages || []), editAddImgInput.trim()],
                                  });
                                  setEditAddImgInput('');
                                }
                              }}
                              className="rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
                            >
                              + Adaugă
                            </button>
                            <label className="cursor-pointer rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Încarcă Poze</span>
                              <input type="file" accept="image/*" multiple onChange={handleEditAddImgFileUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* Video Upload & URL */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Videoclip de pe Șantier (Încarcă din PC sau URL YouTube)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="https://www.youtube.com/... sau încarcă fișier video din PC 👉"
                              value={editingGalleryItem.videoUrl || ''}
                              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, videoUrl: e.target.value })}
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <label className="cursor-pointer rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0" title="Încarcă fișier video din PC">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Încarcă Video</span>
                              <input type="file" accept="video/*" onChange={handleEditVideoFileUpload} className="hidden" />
                            </label>
                          </div>
                          {editingGalleryItem.videoUrl && (
                            <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                              <span className="text-emerald-400 font-semibold truncate flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                Videoclip atașat
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingGalleryItem({ ...editingGalleryItem, videoUrl: '' })}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                              >
                                Șterge video
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Location & Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Locație</label>
                            <input
                              type="text"
                              value={editingGalleryItem.location || ''}
                              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, location: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Descriere</label>
                            <textarea
                              rows={2}
                              value={editingGalleryItem.description || ''}
                              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, description: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                          <button
                            type="button"
                            onClick={() => setEditingGalleryItem(null)}
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                          >
                            Anulează
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg"
                          >
                            <Save className="h-4 w-4" />
                            <span>Salvează Modificările</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 3: TRANSFORMATIONS MANAGER (BEFORE & AFTER) */}
            {activeTab === 'transformations' && (
              <div className="space-y-8">
                
                {/* Form to Add Before/After Transformation */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adaugă Transformare Înainte / După
                  </h4>

                  <form onSubmit={handleAddTransformation} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Titlu Transformare *</label>
                        <input
                          type="text"
                          required
                          value={transTitle}
                          onChange={(e) => setTransTitle(e.target.value)}
                          placeholder="ex. Înlocuire Ferestre Casă Anvers"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">Categorie</label>
                        <select
                          value={transCategory}
                          onChange={(e) => setTransCategory(e.target.value as ServiceCategory)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="windows">Uși & Ferestre</option>
                          <option value="interior">Renovări Interioare</option>
                          <option value="hsb">Panouri HSB</option>
                        </select>
                      </div>
                    </div>

                    {/* BEFORE IMAGE ROW */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                      <label className="text-xs font-bold text-rose-400">URL Foto ÎNAINTE (VOOR) *</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={transBeforeImageUrl}
                          onChange={(e) => setTransBeforeImageUrl(e.target.value)}
                          placeholder="https://... sau încarcă fișier 👉"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white shrink-0" title="Încarcă din PC">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" onChange={handleBeforeFileUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    {/* AFTER IMAGE ROW */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                      <label className="text-xs font-bold text-emerald-400">URL Foto DUPĂ (NA) *</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={transAfterImageUrl}
                          onChange={(e) => setTransAfterImageUrl(e.target.value)}
                          placeholder="https://... sau încarcă fișier 👉"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white shrink-0" title="Încarcă din PC">
                          <Upload className="h-4 w-4" />
                          <input type="file" accept="image/*" onChange={handleAfterFileUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Locație</label>
                        <input
                          type="text"
                          value={transLocation}
                          onChange={(e) => setTransLocation(e.target.value)}
                          placeholder="ex. Gent, Belgia"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">Descriere</label>
                        <input
                          type="text"
                          value={transDescription}
                          onChange={(e) => setTransDescription(e.target.value)}
                          placeholder="Scurtă descriere a rezultatului..."
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Previews Side by Side */}
                    {(transBeforeImageUrl || transAfterImageUrl) && (
                      <div className="flex items-center gap-4 pt-2">
                        {transBeforeImageUrl && (
                          <div className="h-28 w-40 rounded-xl overflow-hidden border border-rose-500/40 relative bg-slate-900">
                            <img src={transBeforeImageUrl} alt="Before Preview" className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 left-1 text-[9px] bg-rose-600 px-1.5 py-0.5 rounded font-bold text-white uppercase">ÎNAINTE</span>
                          </div>
                        )}

                        {transBeforeImageUrl && transAfterImageUrl && (
                          <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                        )}

                        {transAfterImageUrl && (
                          <div className="h-28 w-40 rounded-xl overflow-hidden border border-emerald-500/40 relative bg-slate-900">
                            <img src={transAfterImageUrl} alt="After Preview" className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-600 px-1.5 py-0.5 rounded font-bold text-white uppercase">DUPĂ</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAddingTrans || !transTitle || !transBeforeImageUrl || !transAfterImageUrl}
                      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      Adaugă Transformare
                    </button>
                  </form>
                </div>

                {/* Existing Transformations List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Transformări Existente ({transformations.length})
                  </h4>

                  {transformations.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Nu există nicio transformare adăugată.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {transformations.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4"
                        >
                          {/* Side-by-Side Thumbnail Pair */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="relative h-16 w-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                              <img src={item.beforeImageUrl} alt="Before" className="h-full w-full object-cover" />
                              <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-rose-950/90 text-rose-300 px-1 rounded font-bold">ÎNAINTE</span>
                            </div>

                            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />

                            <div className="relative h-16 w-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                              <img src={item.afterImageUrl} alt="After" className="h-full w-full object-cover" />
                              <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-emerald-950/90 text-emerald-300 px-1 rounded font-bold">DUPĂ</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="font-bold text-xs text-white truncate">{item.title}</div>
                            <div className="text-[11px] text-emerald-400 font-medium">
                              VOOR ➔ NA
                            </div>
                            {item.location && (
                              <div className="text-[10px] text-slate-400">{item.location}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => handleStartEditTransformation(item)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                              title="Editează Transformarea"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransformation(item.id)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="Șterge Transformare"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MODAL FOR EDITING TRANSFORMATION ITEM */}
                {editingTransformation && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl my-8">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <Edit3 className="h-5 w-5 text-emerald-400" />
                          <span>Editează Transformarea Înainte / După</span>
                        </h3>
                        <button
                          onClick={() => setEditingTransformation(null)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveEditTransformation} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Titlu Transformare *</label>
                            <input
                              type="text"
                              required
                              value={editingTransformation.title}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, title: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Categorie</label>
                            <select
                              value={editingTransformation.category || 'windows'}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, category: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            >
                              <option value="windows">Uși & Ferestre</option>
                              <option value="interior">Renovări Interioare</option>
                              <option value="hsb">Panouri HSB</option>
                            </select>
                          </div>
                        </div>

                        {/* BEFORE IMAGE EDIT ROW */}
                        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-rose-400">Foto ÎNAINTE (VOOR)</label>
                            <input
                              type="text"
                              placeholder="Etichetă (ex: Voor)"
                              value={editingTransformation.beforeLabel || ''}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, beforeLabel: e.target.value })}
                              className="w-32 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTransformation.beforeImageUrl}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, beforeImageUrl: e.target.value })}
                              placeholder="https://... sau încarcă din PC 👉"
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <label className="cursor-pointer rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0" title="Încarcă foto nouă">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Încarcă Foto</span>
                              <input type="file" accept="image/*" onChange={handleEditTransBeforeFileUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* AFTER IMAGE EDIT ROW */}
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-emerald-400">Foto DUPĂ (NA)</label>
                            <input
                              type="text"
                              placeholder="Etichetă (ex: Na)"
                              value={editingTransformation.afterLabel || ''}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, afterLabel: e.target.value })}
                              className="w-32 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTransformation.afterImageUrl}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, afterImageUrl: e.target.value })}
                              placeholder="https://... sau încarcă din PC 👉"
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <label className="cursor-pointer rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0" title="Încarcă foto nouă">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Încarcă Foto</span>
                              <input type="file" accept="image/*" onChange={handleEditTransAfterFileUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* Previews */}
                        <div className="flex items-center justify-center gap-4 py-2 bg-slate-950 rounded-xl border border-slate-800 p-3">
                          {editingTransformation.beforeImageUrl && (
                            <div className="h-28 w-40 rounded-xl overflow-hidden border border-rose-500/40 relative bg-slate-900">
                              <img src={editingTransformation.beforeImageUrl} alt="Before Preview" className="h-full w-full object-cover" />
                              <span className="absolute bottom-1 left-1 text-[9px] bg-rose-600 px-1.5 py-0.5 rounded font-bold text-white uppercase">
                                {editingTransformation.beforeLabel || 'ÎNAINTE'}
                              </span>
                            </div>
                          )}

                          {editingTransformation.beforeImageUrl && editingTransformation.afterImageUrl && (
                            <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                          )}

                          {editingTransformation.afterImageUrl && (
                            <div className="h-28 w-40 rounded-xl overflow-hidden border border-emerald-500/40 relative bg-slate-900">
                              <img src={editingTransformation.afterImageUrl} alt="After Preview" className="h-full w-full object-cover" />
                              <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-600 px-1.5 py-0.5 rounded font-bold text-white uppercase">
                                {editingTransformation.afterLabel || 'DUPĂ'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Location & Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Locație</label>
                            <input
                              type="text"
                              value={editingTransformation.location || ''}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, location: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Descriere</label>
                            <textarea
                              rows={2}
                              value={editingTransformation.description || ''}
                              onChange={(e) => setEditingTransformation({ ...editingTransformation, description: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                          <button
                            type="button"
                            onClick={() => setEditingTransformation(null)}
                            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
                          >
                            Anulează
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg"
                          >
                            <Save className="h-4 w-4" />
                            <span>Salvează Modificările</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 4: QUOTES MANAGER */}
            {activeTab === 'quotes' && (
              <div className="space-y-4">
                {quotes.length > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span>Total cereri: <strong className="text-white">{quotes.length}</strong></span>
                    <button
                      onClick={async () => {
                        if (window.confirm('Ștergi TOATE cererile de ofertă?')) {
                          for (const q of quotes) {
                            await deleteQuoteFromFirestore(q.id);
                          }
                          setQuotes([]);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Șterge Toate Cererile</span>
                    </button>
                  </div>
                )}

                {quotes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Nu există nicio cerere de ofertă primită.
                  </div>
                ) : (
                  quotes.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{q.clientName}</span>
                            <span className="text-xs font-semibold text-emerald-400">({q.city || 'Benelux'})</span>
                          </div>
                          <div className="text-xs text-slate-400">
                            📞 {q.phone} • ✉️ {q.email || 'Fără email'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Status Select */}
                          <select
                            value={q.status}
                            onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200"
                          >
                            <option value="new">🆕 Nouă</option>
                            <option value="contacted">📞 Contactat</option>
                            <option value="scheduled">📅 Măsurătoare Programată</option>
                            <option value="completed">✅ Finalizată</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            title="Șterge cerere de ofertă"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-500">Serviciu:</span>{' '}
                          <span className="font-bold text-emerald-300">
                            {q.serviceCategory === 'windows' ? 'Uși & Ferestre' : q.serviceCategory === 'interior' ? 'Renovări Interioare' : 'Panouri HSB'}
                          </span>
                        </div>
                        {q.details?.dimensions && (
                          <div>
                            <span className="text-slate-500">Dimensiuni:</span> {q.details.dimensions}
                          </div>
                        )}
                        {q.preferredDate && (
                          <div>
                            <span className="text-slate-500">Data Măsurătorilor:</span> {q.preferredDate}
                          </div>
                        )}
                        {q.createdAt && (
                          <div className="text-[10px] text-slate-500">
                            Primită la: {new Date(q.createdAt).toLocaleString('ro-RO')}
                          </div>
                        )}
                      </div>

                      {q.details?.windowProfile && (
                        <div className="rounded-xl bg-slate-900 p-2.5 text-xs text-emerald-400 border border-slate-800">
                          ⚙️ Configurație: {q.details.windowProfile} • {q.details.color} • {q.details.glass}
                        </div>
                      )}

                      {q.details?.notes && (
                        <div className="text-xs text-slate-400 italic bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                          "{q.details.notes}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
