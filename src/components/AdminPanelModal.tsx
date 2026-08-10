import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { GalleryItem, QuoteRequest, ServiceCategory, TransformationItem } from '../types';
import { Lock, X, Plus, Trash2, Image as ImageIcon, FileText, AlertCircle, Upload, Shield, SlidersHorizontal, ArrowRight, Layers, Film, CheckCircle2, Edit3, Save } from 'lucide-react';
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
    wds_8s: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    wds_7s: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    wds_6s: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    wds_5s: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=1200&q=80',
  });
  const [saveProfileMsg, setSaveProfileMsg] = useState('');

  // Transformations state
  const [transformations, setTransformations] = useState<TransformationItem[]>([]);
  const [transTitle, setTransTitle] = useState('');
  const [transCategory, setTransCategory] = useState<ServiceCategory>('windows');
  const [transBeforeImageUrl, setTransBeforeImageUrl] = useState('');
  const [transAfterImageUrl, setTransAfterImageUrl] = useState('');
  const [transBeforeLabel, setTransBeforeLabel] = useState('Vooraf');
  const [transAfterLabel, setTransAfterLabel] = useState('Na Renovatie');
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
    if (password === 'vic2026' || password === 'admin' || password === 'vic') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Server File Upload Helper (Uploads images/videos to /api/upload)
  const uploadFileToServer = async (file: File): Promise<string> => {
    setIsUploading(true);
    setUploadStatus('Bestand uploaden naar server...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload mislukt status ${res.status}`);
      }

      const data = await res.json();
      setIsUploading(false);
      setUploadStatus('');
      return data.url;
    } catch (err) {
      console.warn('Server upload mislukt, valt terug op FileReader base64:', err);
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIsUploading(false);
          setUploadStatus('');
          resolve(reader.result?.toString() || '');
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Image File Upload Helper for Gallery Cover
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) setNewImageUrl(url);
    }
  };

  // Image File Upload Helper for Additional Process Photos
  const handleAdditionalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadFileToServer(file);
      if (url) setAdditionalImages((prev) => [...prev, url]);
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
    if (!newTitle || !newImageUrl) return;

    setIsAddingPhoto(true);

    const newItem: GalleryItem = {
      id: 'gal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: newTitle,
      category: newCategory,
      imageUrl: newImageUrl,
      additionalImages,
      videoUrl,
      location: newLocation || 'Benelux',
      year: new Date().getFullYear().toString(),
      description: newDescription,
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
      beforeLabel: transBeforeLabel || 'Vooraf',
      afterLabel: transAfterLabel || 'Na Renovatie',
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
      setTransBeforeLabel('Vooraf');
      setTransAfterLabel('Na Renovatie');
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
    const file = e.target.files?.[0];
    if (file && editingGalleryItem) {
      const url = await uploadFileToServer(file);
      if (url) {
        setEditingGalleryItem((prev) => {
          if (!prev) return null;
          const current = prev.additionalImages || [];
          return { ...prev, additionalImages: [...current, url] };
        });
      }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">{t('adminModalTitle')}</h3>
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
              <p className="text-xs text-slate-400">{t('adminLoginPrompt')}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('adminPasswordPlaceholder')}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />

              {authError && (
                <div className="text-xs text-rose-400 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{t('adminWrongPassword')}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg"
              >
                {t('adminLoginBtn')}
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
                <span>{t('adminTabGallery')} ({galleryItems.length})</span>
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
                <span>{t('adminTabTransformations')} ({transformations.length})</span>
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
                <span>{t('adminTabQuotes')} ({quotes.length})</span>
              </button>
            </div>

            {/* TAB 1: GALLERY MANAGER */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                
                {/* Upload Status Notification */}
                {isUploading && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse shadow-lg">
                    <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin shrink-0" />
                    <span>{uploadStatus || 'Bestand / Video uploaden naar server...'}</span>
                  </div>
                )}

                {/* Form to Add Photo */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('adminAddPhotoTitle')}
                  </h4>

                  <form onSubmit={handleAddPhoto} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoTitle')} *</label>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="bijv. Nieuwe WDS 8S Montage Antwerpen"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoCategory')} *</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as ServiceCategory)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="windows">{t('filterWindows')}</option>
                          <option value="interior">{t('filterInterior')}</option>
                          <option value="hsb">{t('filterHSB')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">Hoofdfoto URL (Cover) *</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://... of upload bestand 👉"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-slate-300 hover:text-white" title="Upload van PC">
                            <Upload className="h-4 w-4" />
                            <input type="file" accept="image/*" onChange={handleGalleryFileUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoLocation')}</label>
                        <input
                          type="text"
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                          placeholder="bijv. Gent, België"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Additional Photos for Multi-Photo Project */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                      <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Extra Foto's Toevoegen aan Dit Project (Meerdere Foto's)
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newAddImgInput}
                          onChange={(e) => setNewAddImgInput(e.target.value)}
                          placeholder="Extra foto URL (bijv. detailfoto, procesfoto)..."
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
                          <span>+ Upload</span>
                          <input type="file" accept="image/*" onChange={handleAdditionalFileUpload} className="hidden" />
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
                        Video van de werf (Upload van PC of YouTube URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/... of upload video bestand vanaf PC 👉"
                          className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <label className="cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 shrink-0" title="Upload videobestand van PC">
                          <Upload className="h-4 w-4" />
                          <span>Upload Video</span>
                          <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" />
                        </label>
                      </div>
                      {videoUrl && (
                        <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-emerald-400 font-semibold truncate flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            Video gekoppeld
                          </span>
                          <button
                            type="button"
                            onClick={() => setVideoUrl('')}
                            className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                          >
                            Verwijder video
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300">{t('adminPhotoDesc')}</label>
                      <input
                        type="text"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Korte toelichting over het project..."
                        className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    {newImageUrl && (
                      <div className="h-28 w-44 rounded-xl overflow-hidden border border-slate-700 relative">
                        <img src={newImageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1.5 py-0.5 rounded text-white">Cover Preview</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAddingPhoto || !newTitle || !newImageUrl}
                      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {t('adminAddPhotoBtn')}
                    </button>
                  </form>
                </div>

                {/* Existing Gallery Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bestaande Foto's in Galerij ({galleryItems.length})
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
                          <div className="text-[10px] text-emerald-400 uppercase font-semibold">{item.category}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {item.location}
                            {item.additionalImages && item.additionalImages.length > 0 && (
                              <span className="ml-1 text-emerald-400">({item.additionalImages.length + 1} foto's)</span>
                            )}
                            {item.videoUrl && <span className="ml-1 text-rose-400">(Video 🎥)</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEditGalleryItem(item)}
                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="Bewerken / Extra Foto's Toevoegen"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(item.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title={t('adminDeleteBtn')}
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
                          <span>Project Bewerken & Meerdere Foto's Beheren</span>
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
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Project Titel</label>
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
                            <option value="windows">Ramen & Deuren</option>
                            <option value="interior">Interieurrenovatie</option>
                            <option value="hsb">HSB-panelen</option>
                          </select>
                        </div>

                        {/* Cover Photo */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Hoofdfoto URL (Cover / Glavnaya Foto)</label>
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
                              <span>Upload</span>
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
                              Extra Foto's van het Proces (Meerdere Foto's)
                            </label>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              ({(editingGalleryItem.additionalImages || []).length} extra foto's)
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
                                    title="Verwijder deze foto"
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
                              placeholder="https://... (Extra Foto URL)"
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
                              + Voeg toe
                            </button>
                            <label className="cursor-pointer rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Foto</span>
                              <input type="file" accept="image/*" onChange={handleEditAddImgFileUpload} className="hidden" />
                            </label>
                          </div>
                        </div>

                        {/* Video Upload & URL */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Video van de werf (Upload van PC of YouTube URL)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="https://www.youtube.com/... of upload video bestand vanaf PC 👉"
                              value={editingGalleryItem.videoUrl || ''}
                              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, videoUrl: e.target.value })}
                              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                            <label className="cursor-pointer rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1 shrink-0" title="Upload videobestand van PC">
                              <Upload className="h-3.5 w-3.5" />
                              <span>Upload Video</span>
                              <input type="file" accept="video/*" onChange={handleEditVideoFileUpload} className="hidden" />
                            </label>
                          </div>
                          {editingGalleryItem.videoUrl && (
                            <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                              <span className="text-emerald-400 font-semibold truncate flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                Video gekoppeld
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingGalleryItem({ ...editingGalleryItem, videoUrl: '' })}
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold"
                              >
                                Verwijder video
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Location & Description */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Locatie</label>
                            <input
                              type="text"
                              value={editingGalleryItem.location || ''}
                              onChange={(e) => setEditingGalleryItem({ ...editingGalleryItem, location: e.target.value })}
                              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">Beschrijving</label>
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
                            Annuleren
                          </button>
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 shadow-lg"
                          >
                            <Save className="h-4 w-4" />
                            <span>Wijzigingen Opslaan</span>
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
                    {t('adminAddTransformTitle')}
                  </h4>

                  <form onSubmit={handleAddTransformation} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoTitle')} *</label>
                        <input
                          type="text"
                          required
                          value={transTitle}
                          onChange={(e) => setTransTitle(e.target.value)}
                          placeholder="bijv. Vervanging Ramen Huis Antwerpen"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoCategory')}</label>
                        <select
                          value={transCategory}
                          onChange={(e) => setTransCategory(e.target.value as ServiceCategory)}
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="windows">{t('filterWindows')}</option>
                          <option value="interior">{t('filterInterior')}</option>
                          <option value="hsb">{t('filterHSB')}</option>
                        </select>
                      </div>
                    </div>

                    {/* BEFORE IMAGE ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
                      <div>
                        <label className="text-xs font-bold text-rose-400">{t('adminBeforeImageUrl')} *</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={transBeforeImageUrl}
                            onChange={(e) => setTransBeforeImageUrl(e.target.value)}
                            placeholder="https://... of upload bestand 👉"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white shrink-0" title="Upload van PC">
                            <Upload className="h-4 w-4" />
                            <input type="file" accept="image/*" onChange={handleBeforeFileUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminBeforeLabelText')}</label>
                        <input
                          type="text"
                          value={transBeforeLabel}
                          onChange={(e) => setTransBeforeLabel(e.target.value)}
                          placeholder="bijv. Oude Houten Kozijnen"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* AFTER IMAGE ROW */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                      <div>
                        <label className="text-xs font-bold text-emerald-400">{t('adminAfterImageUrl')} *</label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={transAfterImageUrl}
                            onChange={(e) => setTransAfterImageUrl(e.target.value)}
                            placeholder="https://... of upload bestand 👉"
                            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                          />
                          <label className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:text-white shrink-0" title="Upload van PC">
                            <Upload className="h-4 w-4" />
                            <input type="file" accept="image/*" onChange={handleAfterFileUpload} className="hidden" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminAfterLabelText')}</label>
                        <input
                          type="text"
                          value={transAfterLabel}
                          onChange={(e) => setTransAfterLabel(e.target.value)}
                          placeholder="bijv. WDS 8S Antraciet Triple"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoLocation')}</label>
                        <input
                          type="text"
                          value={transLocation}
                          onChange={(e) => setTransLocation(e.target.value)}
                          placeholder="bijv. Gent, België"
                          className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300">{t('adminPhotoDesc')}</label>
                        <input
                          type="text"
                          value={transDescription}
                          onChange={(e) => setTransDescription(e.target.value)}
                          placeholder="Korte toelichting over het resultaat..."
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
                            <span className="absolute bottom-1 left-1 text-[9px] bg-rose-600 px-1.5 py-0.5 rounded font-bold text-white uppercase">Voor</span>
                          </div>
                        )}

                        {transBeforeImageUrl && transAfterImageUrl && (
                          <ArrowRight className="h-5 w-5 text-emerald-400 shrink-0" />
                        )}

                        {transAfterImageUrl && (
                          <div className="h-28 w-40 rounded-xl overflow-hidden border border-emerald-500/40 relative bg-slate-900">
                            <img src={transAfterImageUrl} alt="After Preview" className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-600 px-1.5 py-0.5 rounded font-bold text-white uppercase">Na</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAddingTrans || !transTitle || !transBeforeImageUrl || !transAfterImageUrl}
                      className="rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {t('adminAddTransformBtn')}
                    </button>
                  </form>
                </div>

                {/* Existing Transformations List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bestaande Transformaties ({transformations.length})
                  </h4>

                  {transformations.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      {t('adminNoTransformations')}
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
                              <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-rose-950/90 text-rose-300 px-1 rounded font-bold">VOOR</span>
                            </div>

                            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />

                            <div className="relative h-16 w-20 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                              <img src={item.afterImageUrl} alt="After" className="h-full w-full object-cover" />
                              <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-emerald-950/90 text-emerald-300 px-1 rounded font-bold">NA</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="font-bold text-xs text-white truncate">{item.title}</div>
                            <div className="text-[11px] text-emerald-400 font-medium">
                              {item.beforeLabel || 'Voor'} ➔ {item.afterLabel || 'Na'}
                            </div>
                            {item.location && (
                              <div className="text-[10px] text-slate-400">{item.location}</div>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteTransformation(item.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors self-end sm:self-center"
                            title={t('adminDeleteBtn')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 4: QUOTES MANAGER */}
            {activeTab === 'quotes' && (
              <div className="space-y-4">
                {quotes.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    {t('adminNoQuotes')}
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
                            📞 {q.phone} • ✉️ {q.email || 'Geen email'}
                          </div>
                        </div>

                        {/* Status Select */}
                        <select
                          value={q.status}
                          onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200"
                        >
                          <option value="new">{t('adminStatusNew')}</option>
                          <option value="contacted">{t('adminStatusContacted')}</option>
                          <option value="scheduled">{t('adminStatusScheduled')}</option>
                          <option value="completed">{t('adminStatusCompleted')}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-500">Dienst:</span> <span className="font-bold text-emerald-300">{q.serviceCategory}</span>
                        </div>
                        {q.details?.dimensions && (
                          <div>
                            <span className="text-slate-500">Afmetingen:</span> {q.details.dimensions}
                          </div>
                        )}
                        {q.preferredDate && (
                          <div>
                            <span className="text-slate-500">Inmeting Datum:</span> {q.preferredDate}
                          </div>
                        )}
                        {q.createdAt && (
                          <div className="text-[10px] text-slate-500">
                            Ontvangen: {new Date(q.createdAt).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {q.details?.windowProfile && (
                        <div className="rounded-xl bg-slate-900 p-2.5 text-xs text-emerald-400 border border-slate-800">
                          ⚙️ Configuratie: {q.details.windowProfile} • {q.details.color} • {q.details.glass}
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
