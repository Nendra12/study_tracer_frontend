import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, Edit, AlertCircle, Mail, Phone, Plus, User, Briefcase, Award, ChevronDown, Loader2, Save, X, Check
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// --- Helper to build image URL ---
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

// --- Helper to format display URL ---
function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

// Social media platform config
const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin size={16} />, placeholder: 'https://linkedin.com/in/username' },
  { key: 'github', label: 'GitHub', icon: <FaGithub size={16} />, placeholder: 'https://github.com/username' },
  { key: 'instagram', label: 'Instagram', icon: <FaInstagram size={16} />, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: <FaFacebook size={16} />, placeholder: 'https://facebook.com/username' },
  { key: 'website', label: 'Website', icon: <FaGlobe size={16} />, placeholder: 'https://yourwebsite.com' },
];

export default function Profil() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [fotoPreview, setFotoPreview] = useState(null);

  // Social media editing
  const [editingSocial, setEditingSocial] = useState(false);
  const [socialForm, setSocialForm] = useState({});
  const [socialMediaList, setSocialMediaList] = useState([]);
  const [showAddSocial, setShowAddSocial] = useState(false);

  // Success message
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch profile on mount
  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await alumniApi.getProfile();
      const data = res.data.data;
      setProfile(data);
      initEditForm(data);
      initSocialForm(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError(err.response?.data?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  }

  function initEditForm(data) {
    setEditForm({
      nama_alumni: data?.nama || '',
      nis: data?.nis || '',
      nisn: data?.nisn || '',
      tempat_lahir: data?.tempat_lahir || '',
      tanggal_lahir: data?.tanggal_lahir || '',
      jenis_kelamin: data?.jenis_kelamin || '',
      alamat: data?.alamat || '',
      no_hp: data?.no_hp || '',
      tahun_masuk: data?.tahun_masuk || '',
    });
  }

  function initSocialForm(data) {
    setSocialForm({
      linkedin: data?.linkedin || '',
      github: data?.github || '',
      instagram: data?.instagram || '',
      facebook: data?.facebook || '',
      website: data?.website || '',
    });
  }

  async function loadSocialMediaMaster() {
    try {
      const res = await masterDataApi.getSocialMedia();
      setSocialMediaList(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load social media options:', err);
    }
  }

  // Handle foto
  function handleFotoClick() { fileInputRef.current?.click(); }

  function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoPreview(URL.createObjectURL(file));
    uploadFoto(file);
  }

  async function uploadFoto(file) {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('foto', file);
      formData.append('nama_alumni', profile?.nama || '');
      const res = await alumniApi.updateProfile(formData);
      setProfile(res.data.data);
      setSuccessMsg('Foto berhasil diperbarui');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to upload foto:', err);
      alert('Gagal mengunggah foto: ' + (err.response?.data?.message || err.message));
      setFotoPreview(null);
    } finally {
      setSaving(false);
    }
  }

  function startEditing() { initEditForm(profile); setIsEditing(true); }
  function cancelEditing() { setIsEditing(false); initEditForm(profile); setFotoPreview(null); }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(editForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      const res = await alumniApi.updateProfile(formData);
      setProfile(res.data.data);
      initEditForm(res.data.data);
      setIsEditing(false);
      setSuccessMsg('Profil berhasil diperbarui');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Gagal menyimpan profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSocial() {
    try {
      setSaving(true);
      const socialData = [];
      for (const platform of SOCIAL_PLATFORMS) {
        const url = socialForm[platform.key]?.trim();
        if (url) {
          const master = socialMediaList.find(sm =>
            (sm.nama_sosmed || sm.nama || '').toLowerCase().includes(platform.key)
          );
          if (master) {
            socialData.push({ id_sosmed: master.id_sosmed || master.id, url });
          }
        }
      }
      const formData = new FormData();
      formData.append('nama_alumni', profile?.nama || '');
      socialData.forEach((item, idx) => {
        formData.append(`social_media[${idx}][id_sosmed]`, item.id_sosmed);
        formData.append(`social_media[${idx}][url]`, item.url);
      });
      const res = await alumniApi.updateProfile(formData);
      setProfile(res.data.data);
      initSocialForm(res.data.data);
      setEditingSocial(false);
      setShowAddSocial(false);
      setSuccessMsg('Tautan sosial berhasil diperbarui');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update social media:', err);
      alert('Gagal menyimpan tautan sosial: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  // Navbar user
  const navUser = {
    nama_alumni: profile?.nama || authUser?.alumni?.nama_alumni || 'Alumni',
    foto: profile?.foto || authUser?.alumni?.foto,
    can_access_all: true,
  };

  const fotoUrl = fotoPreview || (profile?.foto ? getImageUrl(profile.foto) : null);

  const socialLinks = [];
  if (profile?.linkedin) socialLinks.push({ key: 'linkedin', name: 'LinkedIn', url: profile.linkedin, icon: <FaLinkedin size={16} /> });
  if (profile?.github) socialLinks.push({ key: 'github', name: 'GitHub', url: profile.github, icon: <FaGithub size={16} /> });
  if (profile?.instagram) socialLinks.push({ key: 'instagram', name: 'Instagram', url: profile.instagram, icon: <FaInstagram size={16} /> });
  if (profile?.facebook) socialLinks.push({ key: 'facebook', name: 'Facebook', url: profile.facebook, icon: <FaFacebook size={16} /> });
  if (profile?.website) socialLinks.push({ key: 'website', name: 'Website', url: profile.website, icon: <FaGlobe size={16} /> });

  const inputClass = (isEdit) => isEdit
    ? "w-full bg-white border border-[#3C5759]/30 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20"
    : "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-semibold text-[#3C5759] focus:outline-none";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
        <Navbar user={navUser} />
        <div className="flex-1 flex items-center justify-center"><Loader2 size={36} className="animate-spin text-[#3C5759]/40" /></div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
        <Navbar user={navUser} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Profil</h2>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-[#3C5759] text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer">Coba Lagi</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <Navbar user={navUser} />
      <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/jpg" className="hidden" onChange={handleFotoChange} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-28 pb-16">
        
        {successMsg && (
          <div className="fixed top-20 right-6 z-50 bg-green-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2">
            <Check size={16} /> {successMsg}
          </div>
        )}

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#3C5759] tracking-tight mb-1">Profil Saya</h1>
            <p className="text-[#3C5759]/70 text-sm font-medium">Kelola informasi pribadi dan pencapaian karier Anda</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button onClick={cancelEditing} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#3C5759]/20 text-[#3C5759] rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                  <X size={16} /> Batal
                </button>
                <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
                </button>
              </>
            ) : (
              <>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#3C5759]/20 text-[#3C5759] rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
                  <Eye size={16} /> Lihat Profil Publik
                </button>
                <button onClick={startEditing} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer">
                  <Edit size={16} /> Perbarui Profil
                </button>
              </>
            )}
          </div>
        </div>

        {/* --- ALERT BOX --- */}
        <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 mb-8 shadow-sm">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-0.5">Kebijakan Pembaruan</h3>
            <p className="text-xs text-amber-700/80 font-medium">Pembaruan pada profil Anda memerlukan persetujuan Admin dan tidak akan langsung ditampilkan di direktori publik</p>
          </div>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- SIDEBAR KIRI --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm text-center">
              <div className="relative w-32 h-32 mx-auto mb-5">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 shadow-inner">
                  {fotoUrl ? (
                    <img src={fotoUrl} alt={profile?.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#3C5759]/20 bg-[#3C5759]/5">
                      {profile?.nama?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <button onClick={handleFotoClick} disabled={saving} className="absolute bottom-0 right-0 w-8 h-8 bg-[#3C5759] rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-[#2A3E3F] transition-colors cursor-pointer shadow-md disabled:opacity-50">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Edit size={14} />}
                </button>
              </div>

              <h2 className="text-xl font-black text-[#3C5759] mb-1">{profile?.nama || '-'}</h2>
              <p className="text-sm font-semibold text-[#3C5759]/60 mb-6">Angkatan {profile?.tahun_masuk || '-'} • {profile?.jurusan?.nama || '-'}</p>

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

            {/* Social Links */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-black text-[#3C5759]">Tautan Sosial</h3>
                {editingSocial ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingSocial(false); setShowAddSocial(false); initSocialForm(profile); }} className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Batal</button>
                    <button onClick={handleSaveSocial} disabled={saving} className="text-xs font-bold text-[#3C5759] hover:underline cursor-pointer disabled:opacity-50">
                      {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setEditingSocial(true); loadSocialMediaMaster(); }} className="text-xs font-bold text-[#3C5759] hover:underline cursor-pointer">
                    <Edit size={12} className="inline mr-1" />Edit
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
                    <button onClick={() => setShowAddSocial(true)} className="flex items-center gap-2 text-sm font-bold text-[#3C5759]/60 hover:text-[#3C5759] transition-colors cursor-pointer">
                      <Plus size={16} /> Tampilkan semua platform
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {socialLinks.length > 0 ? (
                      socialLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3 text-[#3C5759]/70 truncate pr-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{link.icon}</div>
                            <span className="text-sm font-medium truncate">{displayUrl(link.url)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 font-medium">Belum ada tautan sosial</p>
                    )}
                  </div>
                  <button onClick={() => { setEditingSocial(true); setShowAddSocial(true); loadSocialMediaMaster(); }} className="flex items-center gap-2 text-sm font-bold text-[#3C5759]/60 hover:text-[#3C5759] transition-colors cursor-pointer">
                    <Plus size={16} /> Tambahkan tautan sosial
                  </button>
                </>
              )}
            </div>
          </div>

          {/* --- KONTEN KANAN --- */}
          <div className="lg:col-span-8 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            
            {/* TABS */}
            <div className="flex border-b border-slate-100 px-2 overflow-x-auto hide-scrollbar">
              <button onClick={() => navigate('/profil')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${location.pathname === '/profil' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:text-[#3C5759]/70 hover:bg-slate-50'}`}>
                <User size={16} /> Detail Pribadi
              </button>
              <button onClick={() => navigate('/profil2')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${location.pathname === '/profil2' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:text-[#3C5759]/70 hover:bg-slate-50'}`}>
                <Briefcase size={16} /> Status Karier
              </button>
              <button onClick={() => navigate('/profil3')} className={`flex items-center gap-2 px-6 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${location.pathname === '/profil3' ? 'border-[#3C5759] text-[#3C5759]' : 'border-transparent text-slate-400 hover:text-[#3C5759]/70 hover:bg-slate-50'}`}>
                <Award size={16} /> Keahlian
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-8 md:p-10 flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Nama Lengkap</label>
                  <input type="text" readOnly={!isEditing} value={isEditing ? editForm.nama_alumni : (profile?.nama || '')} onChange={(e) => setEditForm(prev => ({ ...prev, nama_alumni: e.target.value }))} className={inputClass(isEditing)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">NIS</label>
                    <input type="text" readOnly={!isEditing} value={isEditing ? editForm.nis : (profile?.nis || '')} onChange={(e) => setEditForm(prev => ({ ...prev, nis: e.target.value }))} className={inputClass(isEditing)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">NISN</label>
                    <input type="text" readOnly={!isEditing} value={isEditing ? editForm.nisn : (profile?.nisn || '')} onChange={(e) => setEditForm(prev => ({ ...prev, nisn: e.target.value }))} className={inputClass(isEditing)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Tempat Lahir</label>
                    <input type="text" readOnly={!isEditing} value={isEditing ? editForm.tempat_lahir : (profile?.tempat_lahir || '')} onChange={(e) => setEditForm(prev => ({ ...prev, tempat_lahir: e.target.value }))} className={inputClass(isEditing)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                    <input type={isEditing ? 'date' : 'text'} readOnly={!isEditing} value={isEditing ? editForm.tanggal_lahir : (profile?.tanggal_lahir || '')} onChange={(e) => setEditForm(prev => ({ ...prev, tanggal_lahir: e.target.value }))} className={inputClass(isEditing)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                  <div className="relative">
                    <select disabled={!isEditing} className={`${inputClass(isEditing)} appearance-none`} value={isEditing ? editForm.jenis_kelamin : (profile?.jenis_kelamin || '')} onChange={(e) => setEditForm(prev => ({ ...prev, jenis_kelamin: e.target.value }))}>
                      <option value="">-</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3C5759]/50 pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">No. HP</label>
                    <input type="text" readOnly={!isEditing} value={isEditing ? editForm.no_hp : (profile?.no_hp || '')} onChange={(e) => setEditForm(prev => ({ ...prev, no_hp: e.target.value }))} className={inputClass(isEditing)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Tahun Masuk</label>
                    <input type="text" readOnly={!isEditing} value={isEditing ? editForm.tahun_masuk : (profile?.tahun_masuk || '')} onChange={(e) => setEditForm(prev => ({ ...prev, tahun_masuk: e.target.value }))} className={inputClass(isEditing)} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#3C5759]/40 uppercase tracking-widest mb-2">Alamat</label>
                  <textarea readOnly={!isEditing} rows="3" value={isEditing ? editForm.alamat : (profile?.alamat || '')} onChange={(e) => setEditForm(prev => ({ ...prev, alamat: e.target.value }))} className={`${inputClass(isEditing)} resize-none`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}
