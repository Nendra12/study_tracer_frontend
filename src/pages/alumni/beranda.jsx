import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  ArrowRight,
  AlertCircle,
  X,
  User,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  BellRing,
  Megaphone,
  Pin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import JobsImg from '../../assets/svg/news-broadcast-svgrepo-com.svg';

// Import Komponen & API Eksternal
import StatusPengajuanModal from "../../components/alumni/StatusPengajuanModal";
import { alumniApi } from "../../api/alumni";
import { STORAGE_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { BerandaSkeleton } from "../../components/alumni/skeleton";
import AlumniProfileCard from "../../components/alumni/AlumniProfileCard";
import JobPosterCard from "../../components/alumni/JobPosterCard";
import TopPerusahaan from "../../components/alumni/TopPerusahaan";
import PengumumanKampus from "../../components/alumni/PengumumanSekolah";
import EducationIcon from "../../assets/svg/education-cap-svgrepo-com.svg"
import DateIcon from "../../assets/svg/date-range-svgrepo-com.svg"
import BuildingIcon from "../../assets/svg/building-svgrepo-com.svg"
import UserIcon from "../../assets/svg/user-id-svgrepo-com.svg"

// Import Asset Sapaan
import morning from '../../assets/morning.png';
import afternoon from '../../assets/afternoon.png';
import night from '../../assets/moon.png';

// Helper untuk URL gambar pengumuman
const getPengumumanImageUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  return `${STORAGE_BASE_URL}/${foto}`;
};

const mockStats = [
  { label: "Bekerja", percentage: 65, color: "bg-emerald-500" },
  { label: "Melanjutkan Studi", percentage: 20, color: "bg-blue-500" },
  { label: "Wirausaha", percentage: 10, color: "bg-amber-500" },
  { label: "Mencari Kerja", percentage: 5, color: "bg-[#9ca3af]" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12)
    return {
      text: "Selamat Pagi",
      icon: <img src={morning} alt={"Selamat Pagi"} className='w-10 sm:w-12 drop-shadow-md' />,
    };
  if (h < 15)
    return {
      text: "Selamat Siang",
      icon: <img src={afternoon} alt={"Selamat Siang"} className='w-10 sm:w-12 drop-shadow-md' />,
    };
  if (h < 18)
    return {
      text: "Selamat Sore",
      icon: <img src={afternoon} alt={"Selamat Sore"} className='w-10 sm:w-12 drop-shadow-md' />,
    };
  return {
    text: "Selamat Malam",
    icon: <img src={night} alt={"Selamat Malam"} className='w-10 sm:w-12 drop-shadow-md' />,
  };
}

export default function Beranda() {
  const greeting = getGreeting();
  const { user: authUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  // State
  const [berandaData, setBerandaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // State untuk pengumuman dari API
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // Data dinamis untuk statistik & universitas
  const [statsData, setStatsData] = useState([]);
  const [topUniversitas, setTopUniversitas] = useState([]);

  // Fetch API Logic
  useEffect(() => {
    let cancelled = false;
    async function fetchBeranda() {
      try {
        setLoading(true);
        const res = await alumniApi.getBeranda();
        if (!cancelled) setBerandaData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch beranda:", err);
          setError(err.response?.data?.message || "Gagal memuat data beranda");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBeranda();

    // Fetch pengumuman published
    async function fetchPengumuman() {
      try {
        setLoadingAnnouncements(true);
        const res = await alumniApi.getPengumuman({ per_page: 5, status: 'aktif' });
        const responseData = res.data?.data;
        let items = [];
        if (responseData?.data) {
          items = responseData.data;
        } else if (Array.isArray(responseData)) {
          items = responseData;
        }
        // Pastikan yang pinned selalu muncul pertama
        items.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return 0;
        });
        setAnnouncements(items);
      } catch (err) {
        console.error('Failed to fetch pengumuman:', err);
      } finally {
        setLoadingAnnouncements(false);
      }
    }
    fetchPengumuman();

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-fetch beranda data saat user kembali ke tab (agar kuesioner yang diaktifkan kembali muncul)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !loading) {
        try {
          const res = await alumniApi.getBeranda();
          setBerandaData(res.data.data);
        } catch (err) {
          console.error('Error refreshing beranda on visibility change:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading]);

  // Fetch alumni directory untuk compute statistik & top universitas
  useEffect(() => {
    async function fetchDirectoryStats() {
      try {
        const res = await alumniApi.getAlumniDirectory({ per_page: 1000 });
        const responseData = res.data.data;
        const allAlumni = responseData?.data || (Array.isArray(responseData) ? responseData : []);

        if (allAlumni.length > 0) {
          // Hitung distribusi status
          const statusCount = {};
          allAlumni.forEach(a => {
            const s = a.status || 'Lainnya';
            statusCount[s] = (statusCount[s] || 0) + 1;
          });
          const total = allAlumni.length;
          const colorMap = {
            'Bekerja': 'bg-emerald-500',
            'Kuliah': 'bg-blue-500',
            'Wirausaha': 'bg-amber-500',
            'Mencari Pekerjaan': 'bg-[#9ca3af]',
            'Belum Bekerja': 'bg-red-400',
          };
          const computed = Object.entries(statusCount)
            .map(([label, count]) => ({
              label,
              percentage: Math.round((count / total) * 100),
              color: colorMap[label] || 'bg-slate-400',
            }))
            .sort((a, b) => b.percentage - a.percentage);
          setStatsData(computed);

          // Hitung top universitas dari field 'company' alumni berstatus 'Kuliah'
          const univCount = {};
          allAlumni.forEach(a => {
            if (a.status === 'Kuliah' && a.company) {
              univCount[a.company] = (univCount[a.company] || 0) + 1;
            }
          });
          const topUnivs = Object.entries(univCount)
            .map(([name, alumniCount]) => ({ name, alumniCount, location: '' }))
            .sort((a, b) => b.alumniCount - a.alumniCount)
            .slice(0, 5);
          setTopUniversitas(topUnivs);
        }
      } catch (err) {
        console.error('Failed to compute directory stats:', err);
      }
    }
    fetchDirectoryStats();
  }, []);

  // Modal Scroll Lock
  useEffect(() => {
    document.body.style.overflow = isStatusOpen || selectedImage ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isStatusOpen, selectedImage]);

  // Ekstraksi Data dari API
  const profile = berandaData?.profile;
  const isVerified = berandaData?.is_verified ?? false;
  const hasCompletedKuesioner = berandaData?.has_completed_kuesioner ?? false;
  const canAccessAll = berandaData?.can_access_all ?? false;
  const statusPengajuan = berandaData?.status_pengajuan;
  const kuesionerPending = berandaData?.kuesioner_pending || [];
  const alumniTerbaru = berandaData?.alumni_terbaru || { locked: true, data: [] };
  const lowonganTerbaru = berandaData?.lowongan_terbaru || { locked: true, data: [] };
  const topPerusahaan = berandaData?.top_perusahaan || { locked: true, data: [] };

  const namaAlumni = profile?.nama || authUser?.profile?.nama || "Alumni";
  const firstName = namaAlumni.split(" ")[0];
  // console.log(profile)

  const tahunLulus = profile?.tahun_lulus?.split("-")[0] ?? null;
  const jurusan = profile?.jurusan ?? null;

  // Gunakan data dinamis jika ada, fallback ke mockStats
  const finalStats = statsData.length > 0 ? statsData : mockStats;
  const statusNew = profile?.current_status?.status ?? null;
  const place =
    profile?.current_status?.perusahaan ??
    profile?.current_status?.universitas ??
    null;

  // Refresh data ketika kuesioner selesai diisi
  useEffect(() => {
    if (hasCompletedKuesioner && !loading) {
      const refreshData = async () => {
        try {
          // Refresh user data di context (untuk update navbar)
          await refreshUser();
          // Refresh beranda data (untuk update konten halaman)
          const res = await alumniApi.getBeranda();
          setBerandaData(res.data.data);
        } catch (err) {
          console.error('Error refreshing data:', err);
        }
      };
      refreshData();
    }
  }, [hasCompletedKuesioner, loading, refreshUser]);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen selection:bg-primary/20 overflow-x-hidden">

      {/* ================= HERO SECTION (DESAIN BARU) ================= */}
      <div className="relative bg-primary pt-28 pb-32 overflow-hidden rounded-b-[3rem] shadow-xl">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-primary/80 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-[30%] h-[50%] bg-fourth/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-white mt-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">

            {/* Left: Greeting & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 lg:max-w-xl"
            >
              <div className="flex items-center gap-3 font-semibold mb-4 bg-white/10 border border-white/20 px-4 py-2 rounded-md backdrop-blur-sm shadow-lg">
                {greeting.icon}
                <span className="text-white text-sm md:text-base tracking-wide">
                  {greeting.text}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
                Halo,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fourth to-third">
                  {/* Mengambil kata pertama saja */}
                  {namaAlumni ? namaAlumni.split(' ')[0] : 'Alumni'}
                </span>
              </h1>
              <p className="text-lg text-[#cbd5e1] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
                Portal ini dirancang untuk memantau progres karir Anda,
                menemukan peluang eksklusif, dan menjaga silaturahmi dengan
                almamater tercinta.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full">
                <button
                  onClick={() => navigate("/alumni/lowongan")}
                  className="cursor-pointer w-full sm:w-auto px-8 py-3.5 bg-white text-primary rounded-md text-sm font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 transition-all duration-300 ease-in-out"
                >
                  <ArrowRight size={18} /> Lihat Lowongan 
                </button>
                <button
                  onClick={() => navigate('/alumni/profile')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-md text-sm font-bold backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User size={18} /> Perbarui Profil
                </button>
              </div>
            </motion.div>

            {/* Right: Floating Contextual Cards */}
            <div className="hidden lg:flex relative z-10 w-full max-w-[450px] h-[320px] items-center justify-center">
              {/* 1. Kuesioner Progress Card (Main Center Card) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: -2, y: [-8, 8, -8] }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.2 },
                  rotate: { duration: 0.6, delay: 0.2 },
                  y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                }}
                className="absolute inset-0 m-auto w-[340px] h-[210px] bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
                      <ClipboardCheck size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-base tracking-wide leading-tight">
                        Data Tracer
                      </h4>
                      <p className="text-slate-500 text-xs font-medium">
                        Tahun Lulus: {tahunLulus}
                      </p>
                    </div>
                  </div>
                  {isVerified ? (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                      <ShieldCheck size={12} strokeWidth={3} /> Terverifikasi
                    </div>
                  ) : (
                    <div className="bg-amber-500/20 border border-amber-500/50 text-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                      <Clock size={12} strokeWidth={3} /> Pending
                    </div>
                  )}
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between text-xs font-bold items-end">
                    <span className="text-slate-600">Progres Kuesioner</span>
                    <span className="text-2xl font-black text-primary">
                      {hasCompletedKuesioner ? "100%" : "75%"}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: hasCompletedKuesioner ? "100%" : "75%" }}
                      transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic font-medium">
                    {hasCompletedKuesioner ? "Terima kasih telah mengisi kuesioner." : "Selesaikan bagian kuesioner untuk divalidasi sistem."}
                  </p>
                </div>
              </motion.div>

              {/* 2. Notifikasi Info Kampus */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
                transition={{
                  opacity: { delay: 0.7, duration: 0.5 },
                  y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 },
                }}
                className="absolute -bottom-8 -left-6 z-30 bg-white/95 backdrop-blur-md text-slate-800 p-3 pr-6 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate("/alumni/pengumuman")}
              >
                <div className="relative">
                  <img src={JobsImg} alt="" className="w-10 h-10" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Info Kampus
                  </span>
                  <span className="text-sm font-black">Lihat Pengumuman</span>
                </div>
              </motion.div>

              {/* 3. Decorative Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }}
                transition={{
                  opacity: { delay: 0.9, duration: 0.4 },
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.5 },
                }}
                className="absolute top-10 -left-6 z-0 bg-white/10 border border-white/20 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white backdrop-blur-md rotate-12"
              >
                <GraduationCap size={22} strokeWidth={2} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 pb-20">

        {loading ? (
          <BerandaSkeleton canAccsess={canAccessAll} />
        ) : error && !berandaData ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 mt-10">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Data</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {/* Quick Summary Cards (Statistik Profil Personal) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              {[
                { label: "Tahun Lulus", value: tahunLulus || "-", icon: DateIcon },
                { label: "Jurusan", value: jurusan || "-", icon: EducationIcon },
                { label: "Status Saat Ini", value: statusNew || "-", icon: UserIcon },
                { label: `${statusNew === "Bekerja" ? 'Instansi/Perusahaan' : 'Universitas'}`, value: place || "-", icon: BuildingIcon },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-md transition-shadow">
                  <img src={item.icon} alt="" className="w-8 h-8 mb-3"/>
                  <p className="text-xs text-third font-bold uppercase tracking-wider mb-1 line-clamp-1" title={item.label}>
                    {item.label}
                  </p>
                  <p className="text-sm sm:text-base font-black text-primary leading-tight line-clamp-2" title={item.value}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* SECTION ALERTS (VERIFIKASI & KUESIONER) */}
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                {/* 1. STATUS VERIFIKASI */}
                {!isVerified && (
                  <motion.div key="verifikasi-alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                    <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-amber-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
                      <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 shrink-0">
                        <AlertCircle size={30} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          Akun Menunggu Verifikasi
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                          Akses fitur bursa kerja dan jejaring alumni sedang dibatasi. Tim admin kami akan melakukan verifikasi data Anda segera.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsStatusOpen(true)}
                        className="w-full md:w-auto bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-lg shadow-amber-200"
                      >
                        CEK STATUS
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. TUGAS KUESIONER */}
                {kuesionerPending.length > 0 && (isVerified ? !hasCompletedKuesioner : true) && (
                  <motion.div key="kuesioner-alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                      <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          Isi Tracer Study
                        </h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                          Mohon bantu almamater dengan mengisi kuesioner pelacakan alumni untuk meningkatkan kualitas mutu pendidikan.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (isVerified && kuesionerPending[0]?.id) {
                            navigate(`/alumni/kuesioner/${kuesionerPending[0].id}`);
                          }
                        }}
                        className={`w-full md:w-auto bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 
                        ${isVerified ? "cursor-pointer" : "cursor-n opacity-50 cursor-not-allowed"}`}
                      >
                        ISI SEKARANG
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* JEJARING ALUMNI TERBARU */}
            <section className="bg-white p-6 sm:p-8 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mt-2">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-primary tracking-tight">
                    Jejaring Alumni
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Kenali rekan sejawat dan bangun koneksi profesional
                  </p>
                </div>
                <button
                  onClick={() => { if (canAccessAll) navigate("/alumni/daftar-alumni"); }}
                  className={`group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${canAccessAll ? "bg-white text-primary border-slate-200 hover:border-primary cursor-pointer" : "text-slate-300 border-slate-100 cursor-not-allowed"}`}
                >
                  Lihat Semua{" "}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {alumniTerbaru.data?.length > 0 ? (
                  alumniTerbaru.data.slice(0, 4).map((alumni) => (
                    <div
                      key={alumni.id}
                      onClick={() => {
                        if (!alumniTerbaru.locked) navigate(`/alumni/daftar-alumni/${alumni.id}`, { state: { alumni } });
                      }}
                      className={!alumniTerbaru.locked ? "cursor-pointer" : ""}
                    >
                      <AlumniProfileCard
                        data={alumni}
                        locked={alumniTerbaru.locked}
                        onImageClick={(img, e) => {
                          if (e) e.stopPropagation();
                          if (!alumniTerbaru.locked) setSelectedImage(img);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <Users size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-400 text-sm">Belum ada data alumni baru</p>
                  </div>
                )}
              </div>
            </section>

            {/* GRID: PENGUMUMAN & STATISTIK */}
            <div className="grid lg:grid-cols-3 gap-6">
              <PengumumanKampus 
                announcements={announcements} 
                loading={loadingAnnouncements} 
                getImageUrl={getPengumumanImageUrl} 
              />

              {/* Statistics (Static Mocks) */}
              <section className="bg-primary text-white rounded-md p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h2 className="text-xl font-black relative z-10">Statistik Lulusan</h2>
                <p className="text-xs text-white/60 mb-8 font-medium relative z-10">Distribusi status alumni saat ini.</p>

                <div className="space-y-5 relative z-10">
                  {finalStats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm font-bold mb-2">
                        <span className="text-white/90">{stat.label}</span>
                        <span>{stat.percentage}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full rounded-full ${stat.color}`}
                        ></motion.div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* LOWONGAN PEKERJAAN */}
            <section className="bg-white p-6 sm:p-8 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-primary tracking-tight">Peluang Karir</h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Temukan pekerjaan yang sesuai dengan keahlianmu</p>
                </div>
                <button
                  onClick={() => { if (canAccessAll) navigate("/alumni/lowongan"); }}
                  className={`group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${canAccessAll ? "bg-white text-primary border-slate-200 hover:border-primary cursor-pointer" : "text-slate-300 border-slate-100 cursor-not-allowed"}`}
                >
                  Cari Lowongan <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {lowonganTerbaru.data?.length > 0 ? (
                  lowonganTerbaru.data.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      onClick={() => {
                        if (!lowonganTerbaru.locked) navigate(`/alumni/lowongan/${job.id}`);
                      }}
                      className={!lowonganTerbaru.locked ? "cursor-pointer h-full" : "h-full"}
                    >
                      <JobPosterCard
                        data={job}
                        locked={lowonganTerbaru.locked}
                        onImageClick={(img, e) => {
                          if (e) e.stopPropagation();
                          if (!lowonganTerbaru.locked) setSelectedImage(img);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <Briefcase size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-400 text-sm">Belum ada lowongan pekerjaan saat ini</p>
                  </div>
                )}
              </div>
            </section>

            {/* TOP PERUSAHAAN*/}
            <TopPerusahaan
              data={topPerusahaan.data}
              dataUniversitas={topUniversitas}
              locked={topPerusahaan.locked}
            />

          </div>
        )}
      </main>

      <AnimatePresence>
        <StatusPengajuanModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          data={statusPengajuan}
        />

        {selectedImage && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all cursor-pointer"
                >
                  <X size={20} className="text-slate-800" />
                </button>
              </div>
              <div className="bg-slate-50 flex items-center justify-center p-2 min-h-75">
                <img
                  src={selectedImage}
                  alt="Pratinjau"
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              </div>
              <div className="p-6 text-center border-t border-slate-100 bg-white">
                <h3 className="font-bold text-slate-800">Pratinjau Gambar</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}