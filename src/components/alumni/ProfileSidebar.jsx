import React, { useState, useRef, useEffect } from 'react';
import { Edit, Mail, Phone, Plus, X, Loader2 } from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
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
  
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({});
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Inisialisasi form sosial saat profile berubah
  useEffect(() => {
    initSocialForm(profile);
  }, [profile]);

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
  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSavingFoto(true);
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('nama_alumni', profile?.nama || '');
      
      await alumniApi.updateProfile(formData);
      onShowSuccess('Foto berhasil diperbarui');
      onRefresh(); // Refresh data di parent
    } catch (err) { 
      alert('Gagal mengunggah foto'); 
    } finally { 
      setSavingFoto(false); 
      if(fileInputRef.current) fileInputRef.current.value = '';
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
  const socialLinks = [];
  if (profile?.linkedin) socialLinks.push({ key: 'linkedin', url: profile.linkedin, icon: <FaLinkedin size={16} /> });
  if (profile?.github) socialLinks.push({ key: 'github', url: profile.github, icon: <FaGithub size={16} /> });
  if (profile?.instagram) socialLinks.push({ key: 'instagram', url: profile.instagram, icon: <FaInstagram size={16} /> });
  if (profile?.facebook) socialLinks.push({ key: 'facebook', url: profile.facebook, icon: <FaFacebook size={16} /> });
  if (profile?.website) socialLinks.push({ key: 'website', url: profile.website, icon: <FaGlobe size={16} /> });

  return (
    <div className="lg:col-span-4 space-y-6">
      
      {/* Input File Tersembunyi */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFotoChange} accept="image/*" />

      {/* KOTAK 1: INFO PROFIL */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm text-center border border-slate-100">
        <div className="relative w-32 h-32 mx-auto mb-5">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50">
            {fotoUrl ? (
              <img src={fotoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#3C5759]/10 flex items-center justify-center text-3xl font-bold text-[#3C5759]/40">
                {profile?.nama?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={savingFoto} 
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#3C5759] rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-[#2A3E3F] transition-colors border-2 border-white shadow-sm disabled:opacity-50"
          >
            {savingFoto ? <Loader2 size={14} className="animate-spin"/> : <Edit size={14} />}
          </button>
        </div>
        
        <h2 className="text-xl font-black text-[#3C5759]">{profile?.nama || '-'}</h2>
        <p className="text-sm font-semibold text-[#3C5759]/60 mb-6">
          Angkatan {profile?.tahun_masuk || '-'}
          {profile?.jurusan?.nama && ` • ${profile.jurusan.nama}`}
        </p>

        <div className="space-y-3 pt-6 border-t border-slate-100 text-left">
          <div className="flex items-center gap-3 text-[#3C5759]/70">
            <Mail size={16} className="shrink-0" />
            <span className="text-sm font-medium truncate">{profile?.email || '-'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#3C5759]/70">
            <Phone size={16} className="shrink-0" />
            <span className="text-sm font-medium">{profile?.no_hp || '-'}</span>
          </div>
        </div>
      </div>

      {/* KOTAK 2: TAUTAN SOSIAL */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-black text-[#3C5759]">Tautan Sosial</h3>
          {editingSocial ? (
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingSocial(false); setShowAddSocial(false); initSocialForm(profile); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">
                Batal
              </button>
              <button onClick={handleSaveSocial} disabled={savingSocial} className="text-xs font-bold text-[#3C5759] hover:underline cursor-pointer disabled:opacity-50">
                {savingSocial ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          ) : (
            <button onClick={() => { setEditingSocial(true); loadSocialMediaMaster(); }} className="text-xs font-bold text-[#3C5759] hover:underline cursor-pointer flex items-center">
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
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20 text-[#3C5759]"
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
              <button onClick={() => setShowAddSocial(true)} className="flex items-center gap-2 text-sm font-bold text-[#3C5759]/60 hover:text-[#3C5759] transition-colors cursor-pointer mt-2">
                <Plus size={16} /> Tampilkan semua platform
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {socialLinks.length > 0 ? socialLinks.map((link) => (
                <div key={link.key} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-[#3C5759]/70 truncate pr-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{link.icon}</div>
                    <span className="text-sm font-medium truncate">{displayUrl(link.url)}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 font-medium">Belum ada tautan sosial</p>
              )}
            </div>
            {socialLinks.length === 0 && (
              <button onClick={() => { setEditingSocial(true); setShowAddSocial(true); loadSocialMediaMaster(); }} className="flex items-center gap-2 text-sm font-bold text-[#3C5759]/60 hover:text-[#3C5759] transition-colors cursor-pointer">
                <Plus size={16} /> Tambahkan tautan sosial
              </button>
            )}
          </>
        )}
      </div>

    </div>
  );
}