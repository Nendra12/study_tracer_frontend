import React, { useState, useRef, useEffect } from 'react';
import { Edit, Mail, Phone, Plus, X, Loader2, Check, Clock } from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import Cropper from 'react-easy-crop';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';
import { STORAGE_BASE_URL } from '../../api/axios';

// Helper untuk URL Foto
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

// Helper untuk membuang "https://" agar tampilan lebih rapi
function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function getCroppedFile(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      const file = new File([blob], `profile-${Date.now()}.jpg`, { type: 'image/jpeg' });
      resolve(file);
    }, 'image/jpeg', 0.92);
  });
}

// Konfigurasi Platform Sosial Media
const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin size={16} />, placeholder: 'https://linkedin.com/in/username' },
  { key: 'github', label: 'GitHub', icon: <FaGithub size={16} />, placeholder: 'https://github.com/username' },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram size={16} />, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook size={16} />, placeholder: 'https://facebook.com/username' },
  { key: 'website', label: 'Website', icon: <FaGlobe size={16} />, placeholder: 'https://yourwebsite.com' },
];

export default function ProfileSidebar({ profile, onRefresh, onShowSuccess }) {
  const fileInputRef = useRef(null);

  // States
  const [savingFoto, setSavingFoto] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [rawPreviewUrl, setRawPreviewUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({});
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Inisialisasi form sosial saat profile berubah
  useEffect(() => {
    initSocialForm(profile);
  }, [profile]);

  useEffect(() => {
    if (showCropModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCropModal]);

  function initSocialForm(data) {
    setSocialForm({
      linkedin: data?.linkedin || '',
      github: data?.github || '',
      instagram: data?.instagram || '',
      facebook: data?.facebook || '',
      website: data?.website || '',
    });
  }

  // --- LOGIKA UPLOAD FOTO ---
  function handleFotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setRawPreviewUrl(preview);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setShowCropModal(true);
  }

  async function uploadFoto(file) {
    try {
      setSavingFoto(true);
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('nama_alumni', profile?.nama || '');
      await alumniApi.updateProfile(formData);
      onShowSuccess('Perubahan foto dikirim dan menunggu persetujuan admin');
      onRefresh(); // Refresh data di parent
    } catch (err) { 
      alert('Gagal mengunggah foto'); 
    } finally { 
      setSavingFoto(false); 
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleApplyCrop() {
    if (!rawPreviewUrl || !croppedAreaPixels) {
      return;
    }

    const croppedFile = await getCroppedFile(rawPreviewUrl, croppedAreaPixels);
    if (!croppedFile) {
      alert('Gagal memproses crop gambar');
      return;
    }

    await uploadFoto(croppedFile);
    handleCloseCropModal();
  }

  function handleCloseCropModal() {
    setShowCropModal(false);
    setCroppedAreaPixels(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    if (rawPreviewUrl) {
      URL.revokeObjectURL(rawPreviewUrl);
      setRawPreviewUrl(null);
    }
  }

  // --- LOGIKA SOSIAL MEDIA ---
  async function loadSocialMediaMaster() {
    try {
      const res = await masterDataApi.getSocialMedia();
      setSocialMediaList(res.data.data || res.data || []);
    } catch (err) { console.error('Failed to load social media options:', err); }
  }

  async function handleSaveSocial() {
    try {
      setSavingSocial(true);
      // Pastikan master data sudah dimuat
      let currentMaster = socialMediaList;
      if(currentMaster.length === 0) {
        const res = await masterDataApi.getSocialMedia();
        currentMaster = res.data.data || res.data || [];
        setSocialMediaList(currentMaster);
      }

      const formData = new FormData();
      formData.append('nama_alumni', profile?.nama || '');
      
      let index = 0;
      for (const platform of SOCIAL_PLATFORMS) {
        const url = socialForm[platform.key]?.trim();
        if (url) {
          const master = currentMaster.find(sm => (sm.nama_sosmed || sm.nama || '').toLowerCase().includes(platform.key));
          if (master) {
            formData.append(`social_media[${index}][id_sosmed]`, master.id_sosmed || master.id);
            formData.append(`social_media[${index}][url]`, url);
            index++;
          }
        }
      }

      await alumniApi.updateProfile(formData);
      setEditingSocial(false);
      setShowAddSocial(false);
      onShowSuccess('Tautan sosial berhasil diperbarui');
      onRefresh(); // Refresh data di parent
    } catch (err) { 
      alert('Gagal menyimpan tautan sosial'); 
    } finally { 
      setSavingSocial(false); 
    }
  }

  // Persiapan render
  const fotoUrl = profile?.foto ? getImageUrl(profile.foto) : null;
  const latestPendingFields = profile?.latest_pending_fields || [];
  const hasPersonalPending = profile?.latest_personal_info_status === 'pending';
  const isFotoPending = hasPersonalPending && (
    latestPendingFields.includes('foto') ||
    latestPendingFields.includes('foto_path') ||
    latestPendingFields.includes('gambar_path')
  );
  const hasNonPhotoPersonalPending = hasPersonalPending && latestPendingFields.some(
    (field) => !['foto', 'foto_path', 'gambar_path'].includes(field)
  );
  const socialLinks = [];
  if (profile?.linkedin) socialLinks.push({ key: 'linkedin', url: profile.linkedin, icon: <FaLinkedin size={16} /> });
  if (profile?.github) socialLinks.push({ key: 'github', url: profile.github, icon: <FaGithub size={16} /> });
  if (profile?.instagram) socialLinks.push({ key: 'instagram', url: profile.instagram, icon: <FaInstagram size={16} /> });
  if (profile?.facebook) socialLinks.push({ key: 'facebook', url: profile.facebook, icon: <FaFacebook size={16} /> });
  if (profile?.website) socialLinks.push({ key: 'website', url: profile.website, icon: <FaGlobe size={16} /> });

  // console.log(fotoUrl)
  return (
    <div className="lg:col-span-4 space-y-6">
      
      {/* Input File Tersembunyi */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFotoSelect} accept="image/*" />

      {/* KOTAK 1: INFO PROFIL */}
      <div className="bg-white rounded-4xl p-8 shadow-sm text-center border border-slate-100">
        <div className="relative w-32 h-32 mx-auto mb-5">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50">
            {fotoUrl ? (
              <img src={fotoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary/40">
                {profile?.nama?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          {isFotoPending && (
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">
              PENDING
            </span>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={savingFoto} 
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#2A3E3F] transition-colors border-2 border-white shadow-sm disabled:opacity-50"
          >
            {savingFoto ? <Loader2 size={14} className="animate-spin"/> : <Edit size={14} />}
          </button>
        </div>
        
        <h2 className="text-xl font-black text-primary">{profile?.nama || '-'}</h2>
        <p className="text-sm font-semibold text-primary/60 mb-6">
          Angkatan {profile?.tahun_masuk || '-'}
          {profile?.jurusan?.nama && ` • ${profile.jurusan.nama}`}
        </p>
        {hasNonPhotoPersonalPending && (
          <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-bold text-amber-700">
            <Clock size={13} /> Perubahan profil terbaru menunggu persetujuan admin
          </div>
        )}

        <div className="space-y-3 pt-6 border-t border-slate-100 text-left">
          <div className="flex items-center gap-3 text-primary/70">
            <Mail size={16} className="shrink-0" />
            <span className="text-sm font-medium truncate">{profile?.email || '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-primary/70">
            <Phone size={16} className="shrink-0" />
            <span className="text-sm font-medium">{profile?.no_hp || '-'}</span>
          </div>
        </div>
      </div>

      {/* KOTAK 2: TAUTAN SOSIAL */}
      <div className="bg-white rounded-4xl p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-black text-primary">Tautan Sosial</h3>
          {editingSocial ? (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingSocial(false); setShowAddSocial(false); initSocialForm(profile); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
                Batal
              </button>
              <button onClick={handleSaveSocial} disabled={savingSocial} className="text-xs font-bold text-primary hover:underline cursor-pointer disabled:opacity-50">
                {savingSocial ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          ) : (
            <button onClick={() => { setEditingSocial(true); loadSocialMediaMaster(); }} className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center">
              <Edit size={12} className="mr-1" />Edit
            </button>
          )}
        </div>

        {editingSocial ? (
          <div className="space-y-4 mb-6">
            {SOCIAL_PLATFORMS.map((platform) => {
              const hasValue = socialForm[platform.key];
              if (!hasValue && !showAddSocial) return null;
              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{platform.icon}</div>
                  <input 
                    type="text" 
                    value={socialForm[platform.key] || ''} 
                    onChange={(e) => setSocialForm(prev => ({ ...prev, [platform.key]: e.target.value }))} 
                    placeholder={platform.placeholder} 
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary"
                  />
                  {hasValue && (
                    <button onClick={() => setSocialForm(prev => ({ ...prev, [platform.key]: '' }))} className="text-slate-300 hover:text-red-500 cursor-pointer">
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            {!showAddSocial && (
              <button onClick={() => setShowAddSocial(true)} className="flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-primary transition-colors cursor-pointer mt-2">
                <Plus size={16} /> Tampilkan semua platform
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {socialLinks.length > 0 ? socialLinks.map((link) => (
                <div key={link.key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-primary/70 truncate pr-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{link.icon}</div>
                    <span className="text-sm font-medium truncate">{displayUrl(link.url)}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 font-medium">Belum ada tautan sosial</p>
              )}
            </div>
            {socialLinks.length === 0 && (
              <button onClick={() => { setEditingSocial(true); setShowAddSocial(true); loadSocialMediaMaster(); }} className="flex items-center gap-2 text-sm font-bold text-primary/60 hover:text-primary transition-colors cursor-pointer">
                <Plus size={16} /> Tambahkan tautan sosial
              </button>
            )}
          </>
        )}
      </div>

      {showCropModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseCropModal} />
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-primary">Atur Crop Foto Profil</h3>
                <p className="text-xs text-primary/60 font-medium">Sesuaikan area foto sebelum dikirim ke admin.</p>
              </div>
              <button onClick={handleCloseCropModal} className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="relative w-full h-[360px] bg-slate-900 rounded-2xl overflow-hidden">
                {rawPreviewUrl && (
                  <Cropper
                    image={rawPreviewUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                  />
                )}
              </div>

              <div className="mt-5">
                <label className="block text-[11px] font-bold text-slate-500 mb-2">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#425A5C]"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseCropModal}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleApplyCrop}
                  disabled={savingFoto}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-[#2A3E3F] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingFoto ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Gunakan Foto Ini
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}