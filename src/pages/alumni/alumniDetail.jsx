import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, GraduationCap, Briefcase, Globe, Award, Loader2, AlertCircle, Building2, Rocket, LineChart
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaFacebook, FaGlobe, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import PublicProfileBar from '../../components/alumni/PublicProfileBar';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Kuliah': return <GraduationCap size={18} className="text-[#3C5759]/40" />;
    case 'Wirausaha': return <Rocket size={18} className="text-[#3C5759]/40" />;
    case 'Mencari Pekerjaan':
    case 'Mencari': return <LineChart size={18} className="text-[#3C5759]/40" />;
    case 'Bekerja':
    default: return <Briefcase size={18} className="text-[#3C5759]/40" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Bekerja': return 'bg-emerald-500';
    case 'Kuliah': return 'bg-blue-500';
    case 'Wirausaha': return 'bg-amber-500';
    case 'Mencari Pekerjaan':
    case 'Mencari': return 'bg-orange-500';
    default: return 'bg-slate-500';
  }
};

export default function AlumniDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const fromProfile = location.state?.fromProfile === true;
  
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlumniProfile();
  }, [id]);

  async function fetchAlumniProfile() {
    try {
      setLoading(true);
      setError(null);
      const res = await alumniApi.getAlumniPublicProfile(id);
      setAlumni(res.data.data);
    } catch (err) {
      console.error('Failed to load alumni profile:', err);
      setError(err.response?.data?.message || 'Gagal memuat profil alumni');
    } finally {
      setLoading(false);
    }
  }
  
  const user = {
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto,
    can_access_all: true,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-[#3C5759] mx-auto mb-4" />
            <p className="text-sm text-[#3C5759]/60 font-medium">Memuat profil...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <AlertCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-[#3C5759] mb-2">{error || 'Profil Tidak Ditemukan'}</h2>
            <p className="text-sm text-[#3C5759]/60 font-medium mb-6 max-w-md">
              {error ? 'Terjadi kesalahan saat memuat profil. Silakan coba lagi.' : 'Profil alumni yang Anda cari tidak tersedia.'}
            </p>
            <button
              onClick={() => navigate('/alumni')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer"
            >
              <ArrowLeft size={16} /> Ke Direktori Alumni
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const imageSrc = getImageUrl(alumni.foto);
  const currentCareer = alumni.current_career;
  const skills = alumni.skills || [];
  const riwayat = alumni.riwayat_status || [];

  // Extract current career display info
  let currentStatus = currentCareer?.status || 'Alumni';
  let currentRole = null;
  let currentCompany = null;
  let currentPeriod = null;

  if (currentCareer) {
    currentPeriod = `${currentCareer.tahun_mulai || '-'} - ${currentCareer.tahun_selesai || 'Sekarang'}`;
    
    if (currentCareer.pekerjaan) {
      currentRole = currentCareer.pekerjaan.posisi;
      currentCompany = currentCareer.pekerjaan.perusahaan?.nama || '-';
    } else if (currentCareer.kuliah) {
      currentRole = currentCareer.kuliah.jenjang ? `Mahasiswa ${currentCareer.kuliah.jenjang}` : 'Mahasiswa';
      currentCompany = currentCareer.kuliah.universitas?.nama || '-';
    } else if (currentCareer.wirausaha) {
      currentRole = 'Wirausaha';
      currentCompany = currentCareer.wirausaha.nama_usaha || '-';
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <Navbar user={user} />

      {/* --- BACKGROUND HERO --- */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-[#3C5759] via-[#4A6B6D] to-[#2A3E3F] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" />
        </div>
        <svg className="absolute bottom-0 left-0 w-full h-16" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8f9fa" d="M0,60L120,55C240,50,480,40,720,42C960,44,1200,58,1320,65L1440,72L1440,100L0,100Z" />
        </svg>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-20 -mt-32 pb-20">

        {/* BAR PROFIL PUBLIK (hanya muncul jika dari halaman profil) */}
        {fromProfile && <PublicProfileBar alumniId={id} alumniNama={alumni.nama} />}

        {/* Tombol Kembali (hanya muncul jika dari direktori alumni) */}
        {!fromProfile && (
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate('/alumni')}
            className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} /> Kembali ke Direktori
          </motion.button>
        )}

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl border-8 border-white shadow-2xl overflow-hidden bg-slate-50">
                {imageSrc ? (
                  <img src={imageSrc} alt={alumni.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-black text-[#3C5759]/20 bg-[#3C5759]/5">
                    {alumni.nama?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              {currentStatus && (
                <div className={`absolute -bottom-3 -right-3 ${getStatusColor(currentStatus)} text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border-4 border-white`}>
                  {currentStatus}
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black text-[#3C5759] tracking-tight leading-none mb-3">
                {alumni.nama}
              </h1>
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm font-bold text-[#3C5759]/60">
                {currentRole && (
                  <span className="flex items-center gap-2">
                    {getStatusIcon(currentStatus)} {currentRole}
                    {currentCompany && currentCompany !== '-' && (
                      <> di <span className="text-[#3C5759]">{currentCompany}</span></>
                    )}
                  </span>
                )}
                {alumni.jurusan?.nama && (
                  <span className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-[#3C5759]/30" /> {alumni.jurusan.nama}
                  </span>
                )}
                {alumni.tahun_masuk && (
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#3C5759]/30" /> Angkatan {alumni.tahun_masuk}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* SIDEBAR KIRI */}
          <div className="lg:col-span-4 space-y-8">
            {/* Status Karier Card */}
            {currentCareer && (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  {getStatusIcon(currentStatus)} Status Karier Saat Ini
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(currentStatus)}`} />
                      <span className="text-sm font-bold text-[#3C5759]">{currentStatus}</span>
                    </div>
                  </div>
                  {currentRole && (
                    <div>
                      <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Posisi / Peran</p>
                      <span className="text-sm font-bold text-[#3C5759]">{currentRole}</span>
                    </div>
                  )}
                  {currentCompany && currentCompany !== '-' && (
                    <div>
                      <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">
                        {currentStatus === 'Kuliah' ? 'Universitas' : currentStatus === 'Wirausaha' ? 'Nama Usaha' : 'Perusahaan'}
                      </p>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-[#3C5759]/40" />
                        <span className="text-sm font-bold text-[#3C5759]">{currentCompany}</span>
                      </div>
                    </div>
                  )}
                  {currentPeriod && (
                    <div>
                      <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Periode</p>
                      <span className="text-sm font-bold text-[#3C5759]">{currentPeriod}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info Akademik */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <GraduationCap size={14} /> Informasi Akademik
              </h2>
              <div className="space-y-4">
                {alumni.jurusan?.nama && (
                  <div>
                    <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Jurusan</p>
                    <span className="text-sm font-bold text-[#3C5759]">{alumni.jurusan.nama}</span>
                  </div>
                )}
                {alumni.tahun_masuk && (
                  <div>
                    <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Tahun Masuk</p>
                    <span className="text-sm font-bold text-[#3C5759]">{alumni.tahun_masuk}</span>
                  </div>
                )}
                {alumni.tahun_lulus && (
                  <div>
                    <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Tahun Lulus</p>
                    <span className="text-sm font-bold text-[#3C5759]">{new Date(alumni.tahun_lulus).getFullYear()}</span>
                  </div>
                )}
                {alumni.tempat_lahir && (
                  <div>
                    <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Tempat Lahir</p>
                    <span className="text-sm font-bold text-[#3C5759]">{alumni.tempat_lahir}</span>
                  </div>
                )}
                {alumni.jenis_kelamin && (
                  <div>
                    <p className="text-[10px] font-black text-[#3C5759]/30 uppercase tracking-widest mb-1">Jenis Kelamin</p>
                    <span className="text-sm font-bold text-[#3C5759]">{alumni.jenis_kelamin}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Award size={14} /> Keahlian
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 text-[11px] font-black text-[#3C5759]/70 bg-[#3C5759]/5 rounded-xl border border-[#3C5759]/5">
                      {skill.nama}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {(alumni.instagram || alumni.linkedin || alumni.github || alumni.facebook || alumni.website) && (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xs font-black text-[#3C5759]/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Globe size={14} /> Media Sosial
                </h2>
                <div className="flex flex-wrap gap-3">
                  {alumni.linkedin && (
                    <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-[#0077B5] hover:text-white transition-all">
                      <FaLinkedin size={20} />
                    </a>
                  )}
                  {alumni.github && (
                    <a href={alumni.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-black hover:text-white transition-all">
                      <FaGithub size={20} />
                    </a>
                  )}
                  {alumni.instagram && (
                    <a href={alumni.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all">
                      <FaInstagram size={20} />
                    </a>
                  )}
                  {alumni.facebook && (
                    <a href={alumni.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-[#1877F2] hover:text-white transition-all">
                      <FaFacebook size={20} />
                    </a>
                  )}
                  {alumni.website && (
                    <a href={alumni.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-[#3C5759]/5 flex items-center justify-center text-[#3C5759]/60 hover:bg-[#3C5759] hover:text-white transition-all">
                      <FaGlobe size={20} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* KONTEN KANAN */}
          <div className="lg:col-span-8 space-y-10">
            {/* Riwayat Karier */}
            {riwayat.length > 0 && (
              <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-black text-[#3C5759] tracking-tight flex items-center gap-3 mb-10">
                  <Briefcase size={22} /> Riwayat Karier
                </h2>
                <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
                  {riwayat.map((item, idx) => {
                    let title = item.status?.nama || '-';
                    let subtitle = '';
                    let location = '';
                    const periode = `${item.tahun_mulai || '-'} - ${item.tahun_selesai || 'Sekarang'}`;

                    if (item.pekerjaan) {
                      title = item.pekerjaan.posisi || title;
                      subtitle = item.pekerjaan.perusahaan?.nama || '';
                      const kota = item.pekerjaan.perusahaan?.kota || '';
                      const prov = item.pekerjaan.perusahaan?.provinsi || '';
                      location = [kota, prov].filter(Boolean).join(', ');
                    } else if (item.kuliah) {
                      title = item.kuliah.jenjang ? `Mahasiswa ${item.kuliah.jenjang}` : (item.status?.nama || 'Kuliah');
                      subtitle = item.kuliah.universitas?.nama || '';
                      location = item.kuliah.jurusan_kuliah?.nama || '';
                    } else if (item.wirausaha) {
                      title = 'Wirausaha';
                      subtitle = item.wirausaha.nama_usaha || '';
                      location = item.wirausaha.bidang_usaha?.nama || '';
                    }

                    return (
                      <div key={item.id || idx} className="relative">
                        <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full bg-white border-4 border-[#3C5759] z-10" />
                        <span className="text-[10px] font-black text-[#3C5759]/40 uppercase tracking-[0.2em]">{periode}</span>
                        <h3 className="text-lg font-black text-[#3C5759] mt-1">{title}</h3>
                        {subtitle && <p className="text-sm font-bold text-[#3C5759]/50 mb-2">{subtitle}</p>}
                        {location && <p className="text-sm text-[#3C5759]/60 font-medium">{location}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Privacy Note */}
            <div className="bg-[#3C5759]/5 rounded-2xl p-6 border border-[#3C5759]/10">
              <p className="text-sm text-[#3C5759]/60 font-medium text-center">
                Informasi sensitif seperti email, nomor telepon, dan alamat tidak ditampilkan untuk menjaga privasi alumni.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
