import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Users, ArrowRight, AlertCircle, X,
  Sun, Sunset, Moon, CloudSun, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import StatusPengajuanModal from '../../components/alumni/StatusPengajuanModal';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// Import Komponen Eksternal
import BerandaSkeleton from '../../components/alumni/BerandaSkeleton';
import AlumniProfileCard from '../../components/alumni/AlumniProfileCard';
import JobPosterCard from '../../components/alumni/JobPosterCard';
import TopPerusahaan from '../../components/alumni/TopPerusahaan';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Selamat Pagi', icon: <Sun size={18} className="text-amber-400" /> };
  if (h < 15) return { text: 'Selamat Siang', icon: <CloudSun size={18} className="text-amber-500" /> };
  if (h < 18) return { text: 'Selamat Sore', icon: <Sunset size={18} className="text-orange-500" /> };
  return { text: 'Selamat Malam', icon: <Moon size={18} className="text-indigo-400" /> };
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function Beranda() {
  const greeting = getGreeting();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  
  const [berandaData, setBerandaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBeranda() {
      try {
        setLoading(true);
        const res = await alumniApi.getBeranda();
        if (!cancelled) setBerandaData(res.data.data);
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch beranda:', err);
          setError(err.response?.data?.message || 'Gagal memuat data beranda');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBeranda();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.body.style.overflow = (isStatusOpen || selectedImage) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isStatusOpen, selectedImage]);

  const profile = berandaData?.profile;
  const isVerified = berandaData?.is_verified ?? false;
  const hasCompletedKuesioner = berandaData?.has_completed_kuesioner ?? false;
  const canAccessAll = berandaData?.can_access_all ?? false;
  const statusPengajuan = berandaData?.status_pengajuan;
  const kuesionerPending = berandaData?.kuesioner_pending || [];
  const alumniTerbaru = berandaData?.alumni_terbaru || { locked: true, data: [] };
  const lowonganTerbaru = berandaData?.lowongan_terbaru || { locked: true, data: [] };
  const topPerusahaan = berandaData?.top_perusahaan || { locked: true, data: [] };

  const namaAlumni = profile?.nama || authUser?.alumni?.nama_alumni || 'Alumni';
  const firstName = namaAlumni.split(' ')[0];

  const navUser = {
    nama_alumni: namaAlumni,
    foto: profile?.foto,
    can_access_all: canAccessAll,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-[#3C5759]/20 overflow-x-hidden relative">
      <Navbar user={navUser} />

      {/* HERO SECTION */}
      <div className="relative pt-20 pb-28 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/backgroundAlumni.jpg')" }}>
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-slate-50 z-1" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 text-white mt-4">
          <div className="flex items-center gap-4">
            {profile?.foto ? (
              <img src={getImageUrl(profile.foto)} alt={namaAlumni} className="w-16 h-16 rounded-2xl border-2 border-white/40 shadow-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#3C5759] border-2 border-white/40 shadow-xl flex items-center justify-center text-xl font-black">
                {namaAlumni.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-white/80 text-[12px] font-medium mb-0.5">
                {greeting.icon} {greeting.text}
              </div>
              <h1 className="text-3xl font-black tracking-tight uppercase">{firstName}!</h1>
              <p className="text-white/80 mt-1 text-xs">Pantau progres karir dan data studimu di sini.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-20 flex-1 max-w-[1440px] mx-auto px-6 lg:px-12 -mt-16 pb-20 w-full">
        {loading ? (
          <BerandaSkeleton />
        ) : error && !berandaData ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-[#3C5759] text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION NOTIFIKASI & TUGAS */}
            <div className="mb-12 flex flex-col gap-4">
              <AnimatePresence mode="popLayout">
                
                {/* 1. STATUS VERIFIKASI */}
                {!isVerified && (
                  <motion.div key="verifikasi-alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}>
                    <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-l-2xl"></div>
                      <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-500 shrink-0 ml-2 md:ml-0">
                        <AlertCircle size={28} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 ml-2 md:ml-0">
                        <h3 className="text-base font-bold text-slate-800 mb-1">Status Verifikasi Akun</h3>
                        <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
                          Akun Anda sedang dalam proses peninjauan. Anda tetap dapat memperbarui profil, namun akses ke fitur bursa kerja dan jejaring alumni akan dikunci hingga proses verifikasi selesai.
                        </p>
                      </div>
                      <button onClick={() => setIsStatusOpen(true)} className="w-full md:w-auto mt-2 md:mt-0 bg-[#3C5759] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] hover:shadow-lg transition-all cursor-pointer whitespace-nowrap">
                        LIHAT STATUS
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. TUGAS KUESIONER */}
                {kuesionerPending.length > 0 && (isVerified ? !hasCompletedKuesioner : true) && (
                  <motion.div key="kuesioner-alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                    <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
                      <div className="bg-blue-50 p-3.5 rounded-2xl text-blue-500 shrink-0 ml-2 md:ml-0">
                        <FileText size={28} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 ml-2 md:ml-0">
                        <h3 className="text-base font-bold text-slate-800 mb-1">Tugas Kuesioner</h3>
                        <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
                          Anda memiliki formulir kuesioner tracer study yang belum diselesaikan. Mohon luangkan waktu untuk mengisi kuesioner demi peningkatan kualitas pembelajaran almamater kita.
                        </p>
                      </div>
                      <button onClick={() => { if (kuesionerPending[0]?.id) navigate(`/kuesioner/${kuesionerPending[0].id}`); }} className="w-full md:w-auto mt-2 md:mt-0 bg-[#3C5759] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] hover:shadow-lg transition-all cursor-pointer whitespace-nowrap">
                        ISI SEKARANG
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* JEJARING ALUMNI TERBARU */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-[#3C5759] tracking-tight">Jejaring Alumni Terbaru</h2>
                  <p className="text-[#3C5759] text-sm font-medium mt-1">Saling terhubung dengan rekan satu almamater</p>
                </div>
                <button onClick={() => { if (canAccessAll) navigate('/alumni'); }} className={`flex items-center gap-2 text-[12px] font-bold bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-sm transition-all ${canAccessAll ? 'text-[#3C5759] hover:bg-slate-50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
                  Lihat Semua <ArrowRight size={14}/>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {alumniTerbaru.data?.length > 0 ? (
                  alumniTerbaru.data.slice(0, 4).map((alumni) => (
                    <AlumniProfileCard key={alumni.id} data={alumni} locked={alumniTerbaru.locked} onImageClick={(img) => !alumniTerbaru.locked && setSelectedImage(img)} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada data alumni</p>
                  </div>
                )}
              </div>
            </section>

            {/* LOWONGAN PEKERJAAN */}
            <section className="mb-16">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-2xl font-black text-[#3C5759] tracking-tight">Lowongan Pekerjaan</h2>
                  <p className="text-[#3C5759] text-sm font-medium mt-1">Peluang karir terbaik dari perusahaan mitra</p>
                </div>
                <button onClick={() => { if (canAccessAll) navigate('/lowongan'); }} className={`flex items-center gap-2 text-[12px] font-bold bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-sm transition-all ${canAccessAll ? 'text-[#3C5759] hover:bg-slate-50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'}`}>
                  Lihat Semua <ArrowRight size={14}/>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-stretch">
                {lowonganTerbaru.data?.length > 0 ? (
                  lowonganTerbaru.data.slice(0, 4).map((job) => (
                    <JobPosterCard key={job.id} data={job} locked={lowonganTerbaru.locked} onImageClick={(img) => !lowonganTerbaru.locked && setSelectedImage(img)} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Belum ada lowongan tersedia</p>
                  </div>
                )}
              </div>
            </section>

            {/* TOP PERUSAHAAN */}
            <TopPerusahaan data={topPerusahaan.data} locked={topPerusahaan.locked} />
          </>
        )}
      </main>

      <Footer />

      {/* MODALS */}
      <AnimatePresence>
        <StatusPengajuanModal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} data={statusPengajuan} />

        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                <img src={selectedImage} alt="Pratinjau" className="max-w-full max-h-[85vh] object-contain" onError={(e) => { e.target.src = "https://placehold.co/800x600?text=Poster+Not+Found"; }} />
                <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#3C5759]">Pratinjau Gambar</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}