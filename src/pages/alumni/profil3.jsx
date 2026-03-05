import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, AlertCircle, Mail, Phone, Plus, User, Briefcase, Award, Search, X, ShieldCheck, CheckCircle2, Loader2, Save, Check
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaInstagram, FaFacebook, FaGlobe } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import { alumniApi } from '../../api/alumni';
import { masterDataApi } from '../../api/masterData';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function displayUrl(url) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

export default function Profil3() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Skills
  const [masterSkills, setMasterSkills] = useState([]);
  const [mySkills, setMySkills] = useState([]); // [{id, nama_skill}]
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Save state
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [profileRes, skillsRes] = await Promise.all([
        alumniApi.getProfile(),
        masterDataApi.getSkills(),
      ]);
      const data = profileRes.data.data;
      setProfile(data);
      // Map profile skills to array of {id, nama_skill}
      const skills = (data?.skills || []).map(s => ({
        id: s.id || s.id_skill,
        nama_skill: s.nama_skill || s.nama || s.name || '',
      }));
      setMySkills(skills);
      setMasterSkills(skillsRes.data.data || skillsRes.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.message || 'Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  }

  function addSkill(skill) {
    if (mySkills.find(s => s.id === skill.id)) return;
    setMySkills(prev => [...prev, { id: skill.id, nama_skill: skill.nama_skill || skill.nama || skill.name || '' }]);
    setSearchTerm('');
    setShowDropdown(false);
    setHasChanges(true);
  }

  function removeSkill(skillId) {
    setMySkills(prev => prev.filter(s => s.id !== skillId));
    setHasChanges(true);
  }

  async function handleSaveSkills() {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('nama_alumni', profile?.nama || '');
      mySkills.forEach((skill, idx) => {
        formData.append(`skills[${idx}]`, skill.id);
      });
      const res = await alumniApi.updateProfile(formData);
      setProfile(res.data.data);
      setHasChanges(false);
      setSuccessMsg('Keahlian berhasil diperbarui');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save skills:', err);
      alert('Gagal menyimpan keahlian: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  // Filter for search
  const filteredSkills = masterSkills.filter(s => {
    const name = (s.nama_skill || s.nama || s.name || '').toLowerCase();
    const alreadyAdded = mySkills.find(ms => ms.id === s.id);
    return !alreadyAdded && name.includes(searchTerm.toLowerCase());
  });

  const navUser = {
    nama_alumni: profile?.nama || authUser?.alumni?.nama_alumni || 'Alumni',
    foto: profile?.foto || authUser?.alumni?.foto,
    can_access_all: true,
  };

  const fotoUrl = profile?.foto ? getImageUrl(profile.foto) : null;

  const socialLinks = [];
  if (profile?.linkedin) socialLinks.push({ name: 'LinkedIn', url: profile.linkedin, icon: <FaLinkedin size={16} /> });
  if (profile?.github) socialLinks.push({ name: 'GitHub', url: profile.github, icon: <FaGithub size={16} /> });
  if (profile?.instagram) socialLinks.push({ name: 'Instagram', url: profile.instagram, icon: <FaInstagram size={16} /> });
  if (profile?.facebook) socialLinks.push({ name: 'Facebook', url: profile.facebook, icon: <FaFacebook size={16} /> });
  if (profile?.website) socialLinks.push({ name: 'Website', url: profile.website, icon: <FaGlobe size={16} /> });

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
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#3C5759]/20 text-[#3C5759] rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              <Eye size={16} /> Lihat Profil Publik
            </button>
            {hasChanges ? (
              <button onClick={handleSaveSkills} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
              </button>
            ) : (
              <button onClick={() => navigate('/profil')} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer">
                <Edit size={16} /> Perbarui Profil
              </button>
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
              <h3 className="text-base font-black text-[#3C5759] mb-5">Tautan Sosial</h3>
              <div className="space-y-4 mb-6">
                {socialLinks.length > 0 ? socialLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 text-[#3C5759]/70 truncate pr-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{link.icon}</div>
                      <span className="text-sm font-medium truncate">{displayUrl(link.url)}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 font-medium">Belum ada tautan sosial</p>
                )}
              </div>
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

            {/* CONTENT KEAHLIAN */}
            <div className="p-8 md:p-10 flex-1">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-[#3C5759]">
                  <Award size={22} className="stroke-[2.5]" />
                  <h2 className="text-xl font-black tracking-tight">Keahlian & Keahlian Khusus</h2>
                </div>
              </div>

              {/* Keahlian Section */}
              <div className="mb-10">
                <h3 className="text-[15px] font-bold text-[#3C5759] mb-1">Keahlian</h3>
                <p className="text-sm text-[#3C5759]/60 mb-4">Tambahkan keahlian Anda dari daftar yang tersedia.</p>
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari keahlian (contoh: JavaScript, Komunikasi, Figma)..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                    onFocus={() => searchTerm && setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20 focus:border-[#3C5759] text-[#3C5759]"
                  />
                  {/* Dropdown results */}
                  {showDropdown && searchTerm && filteredSkills.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
                      {filteredSkills.slice(0, 10).map((skill) => (
                        <button
                          key={skill.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addSkill(skill)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#3C5759] hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Plus size={14} className="text-[#3C5759]/40" />
                          {skill.nama_skill || skill.nama || skill.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {showDropdown && searchTerm && filteredSkills.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 p-4 text-sm text-slate-400 text-center">
                      Keahlian tidak ditemukan
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {mySkills.length > 0 ? mySkills.map((skill) => (
                    <span key={skill.id} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm">
                      {skill.nama_skill}
                      <button onClick={() => removeSkill(skill.id)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                        <X size={14} />
                      </button>
                    </span>
                  )) : (
                    <p className="text-sm text-slate-400">Belum ada keahlian. Gunakan pencarian di atas untuk menambahkan.</p>
                  )}
                </div>
              </div>

              {/* Save button inline */}
              {hasChanges && (
                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                  <button onClick={handleSaveSkills} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Keahlian
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}} />
    </div>
  );
}