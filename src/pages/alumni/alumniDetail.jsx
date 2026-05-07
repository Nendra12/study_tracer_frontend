import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GraduationCap, Briefcase, Award, AlertCircle, Layout, Image as ImageIcon, Star, Clock, Lock,
  School,
  BriefcaseBusiness,
  Printer,
  Loader2
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaFacebook, FaGlobe, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import PublicProfileBar, { generateCvPdf } from '../../components/alumni/PublicProfileBar';
import { useThemeSettings } from '../../context/ThemeContext';
import { toastError } from '../../utilitis/alert';
import Connection from '../../components/alumni/Connection';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { AlumniDetailSkeleton } from '../../components/alumni/skeleton';
import { useConnections } from '../../hooks/useConnections';
import UpButton from '../../components/alumni/UpButton';

const MotionButton = motion.button;
const MotionDiv = motion.div;

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

function getAlumniId(entity) {
  if (!entity) return null;
  return entity.id || entity.id_alumni || entity.alumni_id || null;
}

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
  const [connectionCount, setConnectionCount] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const { theme } = useThemeSettings();
  const {
    statusMap, loadingStatusMap, actionLoadingMap,
    fetchStatus, registerAlumniIds, sendRequest,
    acceptRequest, rejectRequest, removeOrCancel, block, unblock,
  } = useConnections();

  useEffect(() => { fetchAlumniProfile(); }, [id]);

  useEffect(() => {
    const profileId = getAlumniId(alumni) || id;
    const myAlumniId = getAlumniId(authUser?.profile) || getAlumniId(authUser);
    if (!profileId || String(profileId) === String(myAlumniId)) return;
    registerAlumniIds([profileId]);
    fetchStatus(profileId);
  }, [alumni, id, authUser, fetchStatus, registerAlumniIds]);

  async function fetchAlumniProfile() {
    try {
      setLoading(true);
      setError(null);
      const myAlumniId = getAlumniId(authUser?.profile) || getAlumniId(authUser);
      const requestedId = id;
      const isSelf = myAlumniId && requestedId && String(myAlumniId) === String(requestedId);
      if (!isSelf) {
        try {
          const statusEntry = await fetchStatus(requestedId, { force: true });
          if (statusEntry?.status === 'blocked_by_them') {
            setAlumni(null);
            setError('Anda tidak dapat melihat profil ini.');
            return;
          }
        } catch (statusErr) {
          console.warn('Failed to check connection status before profile load:', statusErr);
        }
      }
      const res = await alumniApi.getAlumniPublicProfile(id);
      setAlumni(res.data.data);

      // Fetch connection count stats
      try {
        const statsRes = await alumniApi.getAlumniConnectionStats(id);
        setConnectionCount(statsRes.data?.data?.connections_count || 0);
      } catch (statsErr) {
        console.warn('Failed to fetch connection stats:', statsErr);
      }
    } catch (err) {
      console.error('Failed to load alumni profile:', err);
      setError(err.response?.data?.message || 'Gagal memuat profil alumni');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (<div className="min-h-screen bg-white font-sans flex flex-col"><AlumniDetailSkeleton /></div>);
  }

  if (error || !alumni) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <AlertCircle size={56} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">{error || 'Profil Tidak Ditemukan'}</h2>
            <p className="text-sm text-slate-500 font-medium mb-6 max-w-md">
              {error ? 'Terjadi kesalahan saat memuat profil. Silakan coba lagi.' : 'Profil alumni yang Anda cari tidak tersedia.'}
            </p>
            <button onClick={() => navigate('/alumni')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-all cursor-pointer">
              <ArrowLeft size={16} /> Ke Portal Alumni
            </button>
          </div>
        </main>
      </div>
    );
  }

  const imageSrc = getImageUrl(alumni.foto);
  const profileId = getAlumniId(alumni) || id;
  const myAlumniId = getAlumniId(authUser?.profile) || getAlumniId(authUser);
  const isSelfProfile = String(profileId) === String(myAlumniId);
  const currentCareer = alumni.current_career;
  const skills = alumni.skills || [];
  const riwayat = alumni.riwayat_status || [];
  const portofolioList = alumni.portofolio || [];

  const deskripsiByRiwayat = {};
  (alumni.deskripsi_karier || []).forEach(d => { deskripsiByRiwayat[d.status_karier_id] = d.deskripsi; });

  let currentStatus = currentCareer?.status || 'Alumni';
  let currentRole = null;
  let currentCompany = null;
  let currentLocation = null;
  let currentAddress = null;
  let currentPeriod = null;

  if (currentCareer) {
    currentPeriod = `${currentCareer.tahun_mulai || '-'} - ${currentCareer.tahun_selesai || 'Sekarang'}`;
    if (currentCareer.pekerjaan) {
      currentRole = currentCareer.pekerjaan.posisi;
      currentCompany = currentCareer.pekerjaan.perusahaan?.nama || '-';
      currentLocation = [currentCareer.pekerjaan.kota, currentCareer.pekerjaan.provinsi].filter(Boolean).join(', ');
      currentAddress = currentCareer.pekerjaan.jalan || null;
    } else if (currentCareer.kuliah) {
      currentRole = currentCareer.kuliah.jenjang ? `Mahasiswa ${currentCareer.kuliah.jenjang}` : 'Mahasiswa';
      currentCompany = currentCareer.kuliah.universitas?.nama || currentCareer.kuliah.universitas || '-';
      currentLocation = [currentCareer.kuliah.kota?.nama || currentCareer.kuliah.kota, currentCareer.kuliah.provinsi?.nama || currentCareer.kuliah.provinsi].filter(Boolean).join(', ');
      currentAddress = currentCareer.kuliah.alamat || null;
    } else if (currentCareer.wirausaha) {
      currentRole = 'Wirausaha';
      currentCompany = currentCareer.wirausaha.nama_usaha || '-';
      currentLocation = [currentCareer.wirausaha.kota?.nama || currentCareer.wirausaha.kota, currentCareer.wirausaha.provinsi?.nama || currentCareer.wirausaha.provinsi].filter(Boolean).join(', ');
      currentAddress = currentCareer.wirausaha.alamat || null;
    }
  }

  const socialLinks = [
    { url: alumni.linkedin, icon: <FaLinkedin size={16} />, text: 'text-[#0077B5]' },
    { url: alumni.instagram, icon: <FaInstagram size={16} />, text: 'text-pink-600' },
    { url: alumni.github, icon: <FaGithub size={16} />, text: 'text-black' },
    { url: alumni.facebook, icon: <FaFacebook size={16} />, text: 'text-[#1877F2]' },
  ].filter(s => s.url);

  const riwayatColors = [
    'bg-red-50/60',
    'bg-emerald-50/60',
    'bg-orange-50/60'
  ];

  async function handlePrintPdf() {
    try {
      setDownloadingPdf(true);
      const webLink = window.location.origin;
      await generateCvPdf(alumni, webLink, theme?.logo, theme?.namaSekolah);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toastError('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">

      {/* ===== GRADIENT HEADER ===== */}
      <div className="h-42 md:h-52 w-full bg-gradient-to-r from-pink-500 via-orange-400 to-slate-900 relative"></div>

      <main className="flex-1 transition-all duration-500 pb-20 relative max-w-7xl mx-auto px-6 lg:px-8" >

        {/* ===== PROFILE HEADER ===== */}
        <div data-pdf-section={true} className="relative -mt-16 lg:-mt-20 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start mb-10">

          {/* Photo & Mobile Info Wrapper */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-8 items-center lg:items-start w-full lg:w-auto">
            {/* Photo */}
            <MotionDiv initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="shrink-0 relative z-10">
              <div className="w-50 h-50 lg:w-66 lg:h-66 lg:rounded-[60px] rounded-[30px] border-[4px] lg:border-[6px] border-white overflow-hidden bg-slate-100 shadow-md">
                {imageSrc ? (
                  <img src={imageSrc} alt={alumni.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-300 bg-slate-100 leading-snug">
                    {alumni.nama?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
            </MotionDiv>

            {/* Mobile Info (Below photo) - Hidden on lg+ */}
            <div className="flex-1 min-w-0 lg:hidden flex flex-col items-center text-center pb-2 px-4">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                {alumni.nama}
              </h1>
              <div className="flex items-center justify-center gap-2 mb-4">
                {
                  currentCareer?.pekerjaan ? <BriefcaseBusiness size={22} className='text-slate-900 shrink-0 mt-0.5' /> : <GraduationCap size={22} className='text-slate-900 shrink-0 mt-0.5' />
                }
                <p className="line-clamp-2 text-slate-900 tracking-tight leading-tight">
                  {currentCareer?.pekerjaan ? `Bekerja sebagai ${currentRole}` : (currentRole || 'Alumni')}
                  {currentCompany && currentCompany !== '-' ? ` di ${currentCompany}` : ''}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className={`w-7 h-7 rounded-full bg-blue-50/50 flex items-center justify-center transition-all hover:scale-110 ${s.text}`}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Info & Shared Bottom Sections */}
          <div className="flex-1 w-full lg:self-end lg:mt-24 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">

            <div className="flex-1 min-w-0 w-full">
              {/* Desktop Info - Hidden on mobile/tablet */}
              <div className="hidden lg:block">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  {alumni.nama}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                  {
                    currentCareer?.pekerjaan ? <BriefcaseBusiness size={22} className='text-slate-900' /> : <GraduationCap size={22} className='text-slate-900' />
                  }

                  <span className="text-base lg:text-base text-slate-900 tracking-tight leading-tight">
                    {currentCareer?.pekerjaan ? `Bekerja sebagai ${currentRole}` : (currentRole || 'Alumni')}
                    {currentCompany && currentCompany !== '-' ? ` di ${currentCompany}` : ''}
                  </span>
                </div>
              </div>

              {!isSelfProfile ? (
                <div className="flex gap-3 w-full lg:w-auto">
                  <Connection alumniId={profileId} statusEntry={statusMap[String(profileId)]}
                    isLoading={loadingStatusMap[String(profileId)]} isActionLoading={actionLoadingMap[String(profileId)]}
                    onConnect={sendRequest} onAccept={acceptRequest} onReject={rejectRequest}
                    onRemove={removeOrCancel} onBlock={block} onUnblock={unblock}
                    className="w-full [&>div:last-child]:flex [&>div:last-child]:w-full lg:[&>div:last-child]:w-auto [&_button]:flex-1 lg:[&_button]:flex-none [&_button]:text-xs [&_button]:px-5 [&_button]:py-3 lg:[&_button]:py-2 [&_button]:rounded-xl lg:[&_button]:rounded-md [&_button]:font-bold"
                  />
                </div>
              ) : (
                <div data-public-profile-bar={true} className="flex gap-3 w-full lg:w-auto">
                  <button
                    onClick={handlePrintPdf}
                    disabled={downloadingPdf}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 lg:py-2 bg-slate-900 text-white rounded-xl lg:rounded-md text-xs font-bold shadow-sm hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {downloadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} 
                    {downloadingPdf ? 'Memproses...' : 'Print Profil'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col print:hidden items-start lg:items-end gap-4 shrink-0 w-full lg:w-auto">
              {/* Social Icons Desktop */}
              <div className="hidden lg:flex gap-2">
                {socialLinks.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    className={`w-7 h-7 rounded-full bg-blue-50/50 flex items-center justify-center transition-all hover:scale-110 ${s.text}`}>
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 lg:flex gap-4 lg:gap-8 text-center mt-2 w-full lg:w-auto bg-slate-50 lg:bg-transparent rounded-2xl lg:rounded-none p-4 lg:p-0 border lg:border-none border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Koneksi</p>
                  <p className="text-xl lg:text-3xl font-black text-slate-900 leading-none">{connectionCount}</p>
                </div>
                {alumni.jurusan?.nama && (
                  <div className="border-l border-slate-200 lg:border-none">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jurusan</p>
                    <p className="text-xl lg:text-3xl font-black text-slate-900 leading-none uppercase truncate px-2">{alumni.jurusan.nama}</p>
                  </div>
                )}
                {alumni.tahun_masuk && (
                  <div className="border-l border-slate-200 lg:border-none">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Angkatan</p>
                    <p className="text-xl lg:text-3xl font-black text-slate-900 leading-none">{alumni.tahun_masuk}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ===== SKILLS ===== */}
        {skills.length > 0 && (
          <div data-pdf-section={true} className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Star size={24} className="text-slate-900" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Keahlian</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, idx) => (
                <span key={idx} className="px-5 py-2 text-sm font-bold text-slate-800 bg-orange-100/80 rounded-full">
                  {skill.nama}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== INFO AKADEMIK & STATUS KARIER - 2 COLUMNS ===== */}
        <div data-pdf-section={true} className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-16">

          {/* Informasi Akademik */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <School size={24} className="text-slate-900" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Informasi Akademik</h2>
            </div>
            <div className="border-t border-slate-200 flex flex-col">

              <div className="py-6 border-b border-slate-200">
                <p className="text-sm text-slate-500 tracking-tight leading-tight mb-2">Program Studi Utama</p>
                <div className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">{alumni.jurusan?.nama || '-'}</div>
                <p className="text-[10px] text-[#3b82f6] uppercase tracking-tight leading-tight mt-3">JURUSAN</p>
              </div>

              <div className="py-6 border-b border-slate-200">
                <p className="text-sm text-slate-500 tracking-tight leading-tight mb-2">Masa Studi Akademik</p>
                <div className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">
                  {alumni.tahun_masuk || '-'} <span className="text-slate-300 mx-2">—</span> {alumni.tahun_lulus ? new Date(alumni.tahun_lulus).getFullYear() : 'Sekarang'}
                </div>
                <p className="text-[10px] text-[#3b82f6] uppercase tracking-tight leading-tight mt-3">ANGKATAN & KELULUSAN</p>
              </div>

              <div className="py-6 border-b border-slate-200 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 tracking-tight leading-tight mb-1">Tempat Lahir</p>
                  <p className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">{alumni.tempat_lahir || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 tracking-tight leading-tight mb-1">Jenis Kelamin</p>
                  <p className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">{alumni.jenis_kelamin || '-'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Status Karier Saat Ini */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BriefcaseBusiness size={24} className="text-slate-900" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Status Karier</h2>
            </div>
            <div className="border-t border-slate-200 flex flex-col">

              <div className="py-6 border-b border-slate-200">
                <p className="text-sm text-slate-500 tracking-tight leading-tight mb-2">Aktivitas Saat Ini</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusColor(currentStatus)}`} />
                  <div className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">{currentStatus}</div>
                </div>
                <p className="text-[10px] text-[#3b82f6] uppercase tracking-tight leading-tight mt-3">STATUS UTAMA</p>
              </div>

              <div className="py-6 border-b border-slate-200">
                <p className="text-sm text-slate-500 tracking-tight leading-tight mb-2">Posisi / Peran Terakhir</p>
                <div className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight line-clamp-2">{currentRole || '-'}</div>
                <p className="text-[10px] text-[#3b82f6] uppercase tracking-tight leading-tight mt-3">PERAN</p>
              </div>

              <div className="py-6 border-b border-slate-200 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 tracking-tight leading-tight mb-1">Periode</p>
                  <p className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">{currentPeriod || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 tracking-tight leading-tight mb-1">Lokasi</p>
                  <p className="text-xl lg:text-2xl text-slate-900 tracking-tight leading-tight">{currentLocation || '-'}</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ===== RIWAYAT KARIER ===== */}
        {riwayat.length > 0 && (
          <div data-pdf-section={true} className="mb-14">
            <div className="flex items-center gap-2 mb-6">
              <Clock size={24} className="text-slate-900" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Riwayat Karier</h2>
            </div>
            <div className="flex flex-col">
              {riwayat.map((item, idx) => {
                let title = item.status?.nama || '-';
                let subtitle = '';
                const periode = `${item.tahun_mulai || '-'} - ${item.tahun_selesai || 'Sekarang'}`;
                const isLast = idx === riwayat.length - 1;

                if (item.pekerjaan) {
                  title = item.pekerjaan.posisi || title;
                  subtitle = item.pekerjaan.perusahaan?.nama || '';
                } else if (item.kuliah) {
                  title = item.kuliah.jenjang ? `Mahasiswa ${item.kuliah.jenjang}` : (item.status?.nama || 'Kuliah');
                  subtitle = item.kuliah.universitas?.nama || item.kuliah.universitas || '';
                } else if (item.wirausaha) {
                  title = 'Wirausaha';
                  subtitle = item.wirausaha.nama_usaha || '';
                }

                const bgColor = riwayatColors[idx % riwayatColors.length];

                return (
                  <div key={item.id || idx} className="flex gap-4 md:gap-6">
                    {/* Timeline Column */}
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#3b82f6] ring-[4px] ring-white z-10 shadow-sm shrink-0 mt-6 md:mt-8" />
                      {!isLast && <div className="w-[3px] bg-[#3b82f6] flex-1 my-1 rounded-full" />}
                    </div>

                    {/* Content Column */}
                    <div className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
                      <div className={`${bgColor} rounded-2xl p-6 md:p-8`}>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1 tracking-tight leading-tight">{title}</h3>
                        {subtitle && <p className="text-sm font-bold text-slate-700 mb-3 tracking-tight leading-tight">{subtitle} • {periode}</p>}

                        {(item.deskripsi || deskripsiByRiwayat[item.id]) ? (
                          <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap tracking-tight"
                            dangerouslySetInnerHTML={{ __html: item.deskripsi || deskripsiByRiwayat[item.id] || "" }} />
                        ) : (
                          <p className="text-xs md:text-sm text-slate-500 leading-relaxed tracking-tight">
                            Tidak ada deskripsi detail untuk riwayat karier ini.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== PORTOFOLIO ===== */}
        {portofolioList.length > 0 && (
          <div data-pdf-section={true} className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <Briefcase size={24} className="text-slate-900" />
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Project dan Portofolio</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portofolioList.map((porto, idx) => (
                <div key={idx} className="bg-white overflow-hidden flex flex-col">
                  <div className="h-48 rounded-xl overflow-hidden mb-4 bg-slate-100">
                    {porto.gambar ? (
                      <img src={getImageUrl(porto.gambar)} alt={porto.judul}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={40} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-black text-sm text-slate-900 line-clamp-1 mb-2">{porto.judul}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-3 mb-4">{porto.deskripsi}</p>
                    {porto.link_project && (
                      <a href={porto.link_project} target="_blank" rel="noopener noreferrer"
                        className="inline-block mt-auto w-fit px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors rounded-md text-[10px] font-bold uppercase tracking-wider">
                        Lihat Project
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
      <UpButton />
    </div>
  );
}