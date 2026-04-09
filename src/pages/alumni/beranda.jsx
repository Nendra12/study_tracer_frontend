import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, AlertCircle, X, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import API & Context
import { alumniApi } from "../../api/alumni";
import { STORAGE_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// Import Assets
import JobsImg from '../../assets/svg/news-broadcast-svgrepo-com.svg';
import EducationIcon from "../../assets/svg/education-cap-svgrepo-com.svg";
import DateIcon from "../../assets/svg/date-range-svgrepo-com.svg";
import BuildingIcon from "../../assets/svg/building-svgrepo-com.svg";
import UserIcon from "../../assets/svg/user-id-svgrepo-com.svg";
import morning from '../../assets/morning.png';
import afternoon from '../../assets/afternoon.png';
import night from '../../assets/moon.png';

// Import Components
import StatusPengajuanModal from "../../components/alumni/StatusPengajuanModal";
import { BerandaSkeleton } from "../../components/alumni/skeleton";
import JobPosterCard from "../../components/alumni/beranda/JobPosterCard";
import TopPerusahaan from "../../components/alumni/beranda/TopPerusahaan";
import PengumumanKampus from "../../components/alumni/beranda/PengumumanSekolah";
import HeroBeranda from "../../components/alumni/beranda/HeroBeranda";
import SummaryInfoBeranda from "../../components/alumni/beranda/SummaryInfoBeranda";
import AlertBeranda from "../../components/alumni/beranda/AlertBeranda";
import JejaringBeranda from "../../components/alumni/beranda/JejaringBeranda";

// Helpers
const getPengumumanImageUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  return `${STORAGE_BASE_URL}/${foto}`;
};

const normalizeMitraLogos = (berandaPayload) => {
  const source = Array.isArray(berandaPayload?.mitra_logos) ? berandaPayload.mitra_logos : [];
  const normalized = source
    .map((item) => ({
      name: item?.name || item?.nama || item?.title || 'Mitra',
      image: item?.image || item?.logo || item?.logo_url || item?.foto || null,
    }))
    .filter((item) => item.image)
    .map((item) => ({
      ...item,
      image: item.image.startsWith('http') ? item.image : `${STORAGE_BASE_URL}/${item.image}`,
    }));

  const unique = [];
  const seen = new Set();
  normalized.forEach((item) => {
    const key = `${item.name}|${item.image}`;
    if (!seen.has(key)) { seen.add(key); unique.push(item); }
  });
  return unique;
};

const mockStats = [
  { label: "Bekerja", percentage: 65, color: "bg-emerald-500" },
  { label: "Melanjutkan Studi", percentage: 20, color: "bg-blue-500" },
  { label: "Wirausaha", percentage: 10, color: "bg-amber-500" },
  { label: "Mencari Kerja", percentage: 5, color: "bg-[#9ca3af]" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Selamat Pagi", icon: <img src={morning} alt="Pagi" className='w-10 sm:w-12 drop-shadow-md' /> };
  if (h < 15) return { text: "Selamat Siang", icon: <img src={afternoon} alt="Siang" className='w-10 sm:w-12 drop-shadow-md' /> };
  if (h < 18) return { text: "Selamat Sore", icon: <img src={afternoon} alt="Sore" className='w-10 sm:w-12 drop-shadow-md' /> };
  return { text: "Selamat Malam", icon: <img src={night} alt="Malam" className='w-10 sm:w-12 drop-shadow-md' /> };
}

export default function Beranda() {
  const greeting = getGreeting();
  const { user: authUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [berandaData, setBerandaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
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
        if (!cancelled) setError(err.response?.data?.message || "Gagal memuat data beranda");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBeranda();

    async function fetchPengumuman() {
      try {
        setLoadingAnnouncements(true);
        const res = await alumniApi.getPengumuman({ per_page: 5, status: 'aktif' });
        const responseData = res.data?.data;
        let items = responseData?.data || (Array.isArray(responseData) ? responseData : []);
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

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !loading) {
        try {
          const res = await alumniApi.getBeranda();
          setBerandaData(res.data.data);
        } catch (err) {
          console.error('Error refreshing beranda:', err);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading]);

  useEffect(() => {
    async function fetchDirectoryStats() {
      try {
        const res = await alumniApi.getAlumniDirectory({ per_page: 1000 });
        const responseData = res.data.data;
        const allAlumni = responseData?.data || (Array.isArray(responseData) ? responseData : []);

        if (allAlumni.length > 0) {
          const statusCount = {};
          allAlumni.forEach(a => {
            const s = a.status || 'Lainnya';
            statusCount[s] = (statusCount[s] || 0) + 1;
          });
          const total = allAlumni.length;
          const colorMap = { 'Bekerja': 'bg-emerald-500', 'Kuliah': 'bg-blue-500', 'Wirausaha': 'bg-amber-500', 'Mencari Pekerjaan': 'bg-[#9ca3af]', 'Belum Bekerja': 'bg-red-400' };
          const computed = Object.entries(statusCount)
            .map(([label, count]) => ({ label, percentage: Math.round((count / total) * 100), color: colorMap[label] || 'bg-slate-400' }))
            .sort((a, b) => b.percentage - a.percentage);
          setStatsData(computed);

          const univCount = {};
          allAlumni.forEach(a => {
            if (a.status === 'Kuliah' && a.company) {
              univCount[a.company] = (univCount[a.company] || 0) + 1;
            }
          });
          const topUnivs = Object.entries(univCount).map(([name, alumniCount]) => ({ name, alumniCount, location: '' })).sort((a, b) => b.alumniCount - a.alumniCount).slice(0, 5);
          setTopUniversitas(topUnivs);
        }
      } catch (err) {
        console.error('Failed to compute stats:', err);
      }
    }
    fetchDirectoryStats();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isStatusOpen || selectedImage ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isStatusOpen, selectedImage]);

  // Extract Data
  const profile = berandaData?.profile;
  const isVerified = berandaData?.is_verified ?? false;
  const hasCompletedKuesioner = berandaData?.has_completed_kuesioner ?? false;
  const canAccessAll = berandaData?.can_access_all ?? false;
  const statusPengajuan = berandaData?.status_pengajuan;
  const kuesionerPending = berandaData?.kuesioner_pending || [];
  const alumniTerbaru = berandaData?.alumni_terbaru || { locked: true, data: [] };
  const lowonganTerbaru = berandaData?.lowongan_terbaru || { locked: true, data: [] };
  const topPerusahaan = berandaData?.top_perusahaan || { locked: true, data: [] };
  const partnerLogos = normalizeMitraLogos(berandaData);

  const namaAlumni = profile?.nama || authUser?.profile?.nama || "Alumni";
  const tahunLulus = profile?.tahun_lulus?.split("-")[0] ?? null;
  const jurusan = profile?.jurusan ?? null;
  const finalStats = statsData.length > 0 ? statsData : mockStats;
  const statusNew = profile?.current_status?.status ?? null;
  const place = profile?.current_status?.perusahaan ?? profile?.current_status?.universitas ?? null;

  useEffect(() => {
    if (hasCompletedKuesioner && !loading) {
      const refreshData = async () => {
        try {
          await refreshUser();
          const res = await alumniApi.getBeranda();
          setBerandaData(res.data.data);
        } catch (err) {}
      };
      refreshData();
    }
  }, [hasCompletedKuesioner, loading, refreshUser]);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen selection:bg-primary/20 overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      <HeroBeranda 
        greeting={greeting} namaAlumni={namaAlumni} navigate={navigate} 
        tahunLulus={tahunLulus} isVerified={isVerified} hasCompletedKuesioner={hasCompletedKuesioner} 
      />

      {/* Notifikasi Info Kampus Melayang */}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="hidden lg:flex absolute -top-45 right-80 z-40 bg-white/95 backdrop-blur-md text-slate-800 p-3 pr-6 rounded-2xl shadow-2xl border border-slate-100 items-center gap-3 cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate("/alumni/pengumuman")}>
          <img src={JobsImg} alt="" className="w-10 h-10" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Info Sekolah</span>
            <span className="text-sm font-black">Lihat Pengumuman</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 pb-20">
        {loading ? (
          <BerandaSkeleton canAccsess={canAccessAll} />
        ) : error && !berandaData ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100 mt-10">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Data</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all cursor-pointer">
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            
            {/* 2. SUMMARY CARDS */}
            <SummaryInfoBeranda 
              tahunLulus={tahunLulus} jurusan={jurusan} statusNew={statusNew} place={place}
              DateIcon={DateIcon} EducationIcon={EducationIcon} UserIcon={UserIcon} BuildingIcon={BuildingIcon}
            />

            {/* 3. ALERTS */}
            <AlertBeranda 
              isVerified={isVerified} hasCompletedKuesioner={hasCompletedKuesioner} 
              kuesionerPending={kuesionerPending} setIsStatusOpen={setIsStatusOpen} navigate={navigate} 
            />

            {/* 4. JEJARING ALUMNI */}
            <JejaringBeranda 
              canAccessAll={canAccessAll} alumniTerbaru={alumniTerbaru} 
              navigate={navigate} setSelectedImage={setSelectedImage} 
            />

            {/* GRID: PENGUMUMAN & STATISTIK */}
            <div className="grid lg:grid-cols-3 gap-6">
              <PengumumanKampus announcements={announcements} loading={loadingAnnouncements} getImageUrl={getPengumumanImageUrl} />

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
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${stat.percentage}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: idx * 0.1 }} className={`h-full rounded-full ${stat.color}`}></motion.div>
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
                <button onClick={() => { if (canAccessAll) navigate("/alumni/lowongan"); }} className={`group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${canAccessAll ? "bg-white text-primary border-slate-200 hover:border-primary cursor-pointer" : "text-slate-300 border-slate-100 cursor-not-allowed"}`}>
                  Cari Lowongan <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {lowonganTerbaru.data?.length > 0 ? (
                  lowonganTerbaru.data.slice(0, 4).map((job) => (
                    <div key={job.id} onClick={() => { if (!lowonganTerbaru.locked) navigate(`/alumni/lowongan/${job.id}`); }} className={!lowonganTerbaru.locked ? "cursor-pointer h-full" : "h-full"}>
                      <JobPosterCard data={job} locked={lowonganTerbaru.locked} onImageClick={(img, e) => { if (e) e.stopPropagation(); if (!lowonganTerbaru.locked) setSelectedImage(img); }} />
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

            {/* TOP PERUSAHAAN */}
            <TopPerusahaan data={topPerusahaan.data} dataUniversitas={topUniversitas} partnerLogos={partnerLogos} locked={topPerusahaan.locked} />

          </div>
        )}
      </main>

      <AnimatePresence>
        <StatusPengajuanModal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} data={statusPengajuan} />
        {selectedImage && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSelectedImage(null)} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all cursor-pointer">
                  <X size={20} className="text-slate-800" />
                </button>
              </div>
              <div className="bg-slate-50 flex items-center justify-center p-2 min-h-75">
                <img src={selectedImage} alt="Pratinjau" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}