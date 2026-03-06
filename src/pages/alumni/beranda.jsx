import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  ArrowRight,
  AlertCircle,
  X,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Activity,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatusPengajuanModal from "../../components/alumni/StatusPengajuanModal";
import { alumniApi } from "../../api/alumni";
import { useAuth } from "../../context/AuthContext";

// Import Komponen Eksternal
import { BerandaSkeleton } from "../../components/alumni/skeleton";
import AlumniProfileCard from "../../components/alumni/AlumniProfileCard";
import JobPosterCard from "../../components/alumni/JobPosterCard";
import TopPerusahaan from "../../components/alumni/TopPerusahaan";

// Import Asset Sapaan
import morning from '../../assets/morning.png';
import afternoon from '../../assets/afternoon.png';
import night from '../../assets/moon.png';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12)
    return {
      text: "Selamat Pagi",
      icon: <img src={morning} alt={"Selamat Pagi"} className='w-10 sm:w-12 drop-shadow-md'/>,
    };
  if (h < 15)
    return {
      text: "Selamat Siang",
      icon: <img src={afternoon} alt={"Selamat Siang"} className='w-10 sm:w-12 drop-shadow-md'/>,
    };
  if (h < 18)
    return {
      text: "Selamat Sore",
      icon: <img src={afternoon} alt={"Selamat Sore"} className='w-10 sm:w-12 drop-shadow-md'/>,
    };
  return {
    text: "Selamat Malam",
    icon: <img src={night} alt={"Selamat Malam"} className='w-10 sm:w-12 drop-shadow-md'/>,
  };
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
          console.error("Failed to fetch beranda:", err);
          setError(err.response?.data?.message || "Gagal memuat data beranda");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBeranda();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isStatusOpen || selectedImage ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
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

  const namaAlumni = profile?.nama || authUser?.alumni?.nama_alumni || "Alumni";
  const firstName = namaAlumni.split(" ")[0];

  return (
    <>
      <div className="w-full mt-13 bg-[#f8f9fa] min-h-screen">
        
        {/* --- HEADER SECTION --- */}
        <div className="relative pt-24 pb-16 md:pb-12 w-full z-10 shrink-0 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-primary md:bg-linear-to-r md:from-primary md:via-[#365A5D] md:to-[#223637]"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-repeat mix-blend-overlay"></div>
            
            {/* Glowing Orbs untuk efek futuristik */}
            <div className="absolute top-[-10%] right-[10%] w-96 h-96 bg-emerald-400/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[30%] w-80 h-80 bg-blue-400/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
            
            {/* SVG Lengkungan Bawah */}
            <svg className="absolute bottom-0 left-0 w-full h-16 md:h-24 translate-y-px drop-shadow-[0_-4px_10px_rgba(0,0,0,0.05)]" viewBox="0 0 1440 100" preserveAspectRatio="none">
              <path fill="#f8f9fa" d="M0,60L120,55C240,50,480,40,720,42C960,44,1200,58,1320,65L1440,72L1440,100L0,100Z" />
            </svg>
          </div>

          <div className="relative z-10 mt-2 max-w-7xl mx-auto px-6 lg:px-12 text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8 mb-12">
              
              {/* --- BAGIAN KIRI: TEKS --- */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 lg:max-w-xl"
              >
                <div className="flex items-center gap-3 font-semibold mb-4 bg-white/10 border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm">
                  {greeting.icon}
                  <span className="text-white/90 text-sm md:text-base tracking-wide">{greeting.text}</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black tracking-tight uppercase leading-[1.1] mb-5 drop-shadow-md">
                  Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-200">{firstName}!</span>
                </h1>
                <p className="text-white/80 text-base md:text-lg font-medium max-w-md leading-relaxed mb-8">
                  Pantau progres karir, temukan peluang eksklusif, dan perluas jejaring profesionalmu bersama almamater.
                </p>
                
                <div className="flex items-center gap-4 w-full justify-center lg:justify-start">
                  <button onClick={() => navigate('/alumni/profile')} className="px-6 py-3.5 bg-white text-primary hover:bg-slate-50 rounded-full text-sm font-black shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-1">
                    <Users size={16} /> Update Profil
                  </button>
                  <button onClick={() => navigate('/alumni/lowongan')} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md rounded-full text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:-translate-y-1">
                    Cari Peluang <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* --- BAGIAN KANAN: ADVANCED FLOATING UI CARDS --- */}
              <div className="hidden lg:flex relative z-10 w-full max-w-[450px] h-[320px] items-center justify-center">
                
                {/* 1. Main Dashboard Card (Center, slightly tilted) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: -2, y: [-8, 8, -8] }}
                  transition={{ 
                    opacity: { duration: 0.6, delay: 0.2 }, 
                    rotate: { duration: 0.6, delay: 0.2 },
                    y: { repeat: Infinity, duration: 6, ease: "easeInOut" } 
                  }}
                  className="absolute inset-0 m-auto w-[340px] h-[200px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col justify-between overflow-hidden"
                >
                  {/* Decorative mesh inside card */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-400/30 to-transparent rounded-full blur-2xl"></div>

                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 border border-white/30 rounded-2xl flex items-center justify-center shadow-inner">
                        <Activity size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base tracking-wide">Status Tracer</h4>
                        <p className="text-white/70 text-xs font-medium">Progress pengisian</p>
                      </div>
                    </div>
                    {isVerified && (
                      <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 size={12} strokeWidth={3} /> Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="relative z-10 space-y-2.5">
                    <div className="flex justify-between text-xs font-bold items-end">
                      <span className="text-white/80">Kelengkapan Profil</span>
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-white">85%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-300 rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* 2. Job Match Badge (Top Right) */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0, y: [5, -5, 5] }}
                  transition={{ 
                    opacity: { delay: 0.5, duration: 0.5 }, 
                    y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 } 
                  }}
                  className="absolute -top-4 -right-4 z-30 bg-white text-slate-800 p-3 pr-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate('/alumni/lowongan')}
                >
                  <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-2.5 rounded-xl text-amber-600 shadow-inner">
                    <Sparkles size={18} strokeWidth={2.5}/>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Rekomendasi</span>
                    <span className="text-sm font-black leading-none">5 Lowongan Cocok</span>
                  </div>
                </motion.div>

                {/* 3. Connection Badge (Bottom Left) */}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
                  transition={{ 
                    opacity: { delay: 0.7, duration: 0.5 }, 
                    y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 } 
                  }}
                  className="absolute -bottom-6 -left-6 z-30 bg-white/95 backdrop-blur-md text-slate-800 p-3 pr-5 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => navigate('/alumni/daftar-alumni')}
                >
                  <div className="flex -space-x-2.5 shrink-0 relative">
                     <img src="https://i.pravatar.cc/100?img=33" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="Alumni 1" />
                     <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" alt="Alumni 2" />
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 text-[10px] font-black shadow-sm">
                       +120
                     </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Jejaring</span>
                    <span className="text-sm font-black leading-none">Koneksi Alumni</span>
                  </div>
                </motion.div>

                {/* 4. Small Reward Badge (Top Left - Floating independent) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1, y: [-3, 3, -3] }}
                  transition={{ 
                    opacity: { delay: 0.9, duration: 0.4 }, 
                    y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1.5 } 
                  }}
                  className="absolute top-8 -left-4 z-0 bg-[#1E363A] border border-white/20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-amber-300 backdrop-blur-md"
                >
                  <Award size={20} strokeWidth={2.5} />
                </motion.div>

              </div>

            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative z-20 -mt-16 pb-24">
          {/* LOGIKA RENDERING YANG BERSIH */}
          {loading ? (
            <BerandaSkeleton canAccsess={canAccessAll} />
          ) : error && !berandaData ? (
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
                <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  Gagal Memuat Data
                </h2>
                <p className="text-slate-500 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col gap-12">
                
                {/* SECTION NOTIFIKASI & TUGAS */}
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {/* 1. STATUS VERIFIKASI */}
                    {!isVerified && (
                      <motion.div
                        key="verifikasi-alert"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
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
                              Akses fitur bursa kerja dan jejaring alumni sedang
                              dibatasi. Tim admin kami akan melakukan verifikasi
                              data Anda segera.
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
                    {kuesionerPending.length > 0 &&
                      (isVerified ? !hasCompletedKuesioner : true) && (
                        <motion.div
                          key="kuesioner-alert"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-800 mb-1">
                                Isi Tracer Study
                              </h3>
                              <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
                                Mohon bantu almamater dengan mengisi kuesioner
                                pelacakan alumni untuk meningkatkan kualitas mutu
                                pendidikan.
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (kuesionerPending[0]?.id)
                                  navigate(
                                    `/alumni/kuesioner/${kuesionerPending[0].id}`
                                  );
                              }}
                              className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-opacity-90 transition-all cursor-pointer shadow-lg shadow-primary/20"
                            >
                              ISI SEKARANG
                            </button>
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>

                {/* JEJARING ALUMNI TERBARU */}
                <section>
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
                      onClick={() => {
                        if (canAccessAll) navigate("/alumni/daftar-alumni");
                      }}
                      className={`group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${canAccessAll ? "bg-white text-primary border-slate-200 hover:border-primary cursor-pointer" : "text-slate-300 border-slate-100 cursor-not-allowed"}`}
                    >
                      Lihat Semua{" "}
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    {alumniTerbaru.data?.length > 0 ? (
                      alumniTerbaru.data
                        .slice(0, 4)
                        .map((alumni) => (
                          <div 
                            key={alumni.id} 
                            onClick={() => {
                              if (!alumniTerbaru.locked) {
                                navigate(`/alumni/daftar-alumni/${alumni.id}`, { state: { alumni } });
                              }
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
                      <div className="col-span-full py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                        <Users
                          size={32}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        <p className="text-slate-400 text-sm">
                          Belum ada data alumni baru
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* LOWONGAN PEKERJAAN */}
                <section>
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-primary tracking-tight">
                        Peluang Karir
                      </h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        Temukan pekerjaan yang sesuai dengan keahlianmu
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (canAccessAll) navigate("/alumni/lowongan");
                      }}
                      className={`group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all ${canAccessAll ? "bg-white text-primary border-slate-200 hover:border-primary cursor-pointer" : "text-slate-300 border-slate-100 cursor-not-allowed"}`}
                    >
                      Cari Lowongan{" "}
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                    {lowonganTerbaru.data?.length > 0 ? (
                      lowonganTerbaru.data
                        .slice(0, 4)
                        .map((job) => (
                          <div 
                            key={job.id} 
                            onClick={() => {
                              if (!lowonganTerbaru.locked) {
                                navigate(`/alumni/lowongan/${job.id}`);
                              }
                            }}
                            className={!lowonganTerbaru.locked ? "cursor-pointer" : ""}
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
                      <div className="col-span-full py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                        <Briefcase
                          size={32}
                          className="mx-auto mb-2 text-slate-300"
                        />
                        <p className="text-slate-400 text-sm">
                          Belum ada lowongan pekerjaan saat ini
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* TOP PERUSAHAAN */}
                <TopPerusahaan
                  data={topPerusahaan.data}
                  locked={topPerusahaan.locked}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        <StatusPengajuanModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          data={statusPengajuan}
        />

        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              <div className="bg-slate-50 flex items-center justify-center p-2 min-h-[300px]">
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
    </>
  );
}