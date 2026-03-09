import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  ArrowRight,
  AlertCircle,
  X,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatusPengajuanModal from "../../components/alumni/StatusPengajuanModal";
import { alumniApi } from "../../api/alumni";
import { STORAGE_BASE_URL } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// Import Komponen Eksternal
import { BerandaSkeleton } from "../../components/alumni/skeleton";
import AlumniProfileCard from "../../components/alumni/AlumniProfileCard";
import JobPosterCard from "../../components/alumni/JobPosterCard";
import TopPerusahaan from "../../components/alumni/TopPerusahaan";
import morning from '../../assets/morning.png';
import afternoon from '../../assets/afternoon.png';
import night from '../../assets/moon.png';
import Loader from "../../components/Loaders";

import { useOutletContext } from "react-router-dom";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12)
    return {
      text: "Selamat Pagi",
      icon: <img src={morning} alt={"Selamat Pagi"} className='w-15 '/>,
    };
  if (h < 15)
    return {
      text: "Selamat Siang",
      icon: <img src={afternoon} alt={"Selamat Siang"} className='w-15 '/>,
    };
  if (h < 18)
    return {
      text: "Selamat Sore",
      icon: <img src={afternoon} alt={"Selamat Sore"} className='w-15 '/>,
    };
  return {
    text: "Selamat Malam",
    icon: <img src={night} alt={"Selamat Malam"} className='w-15 '/>,
  };
}

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function Beranda() {
  const { selesai, setSelesai } = useOutletContext();

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
        setSelesai(false)
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
  const alumniTerbaru = berandaData?.alumni_terbaru || {
    locked: true,
    data: [],
  };
  const lowonganTerbaru = berandaData?.lowongan_terbaru || {
    locked: true,
    data: [],
  };
  const topPerusahaan = berandaData?.top_perusahaan || {
    locked: true,
    data: [],
  };

  const namaAlumni = profile?.nama || authUser?.alumni?.nama_alumni || "Alumni";
  const firstName = namaAlumni.split(" ")[0];

  
  return (
    <>
      <div className="w-full mt-13">
        {/* HERO SECTION - Background Full Width */}
        <section
          className="relative pt-12 pb-32 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/backgroundAlumni.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/50 z-0" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-50 z-[1]" />

          {/* Hero Content Container - Aligned with Navbar */}
          <div className="relative z-10 mt-5 max-w-7xl mx-auto px-6 lg:px-12 text-white">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-5"
            >
              <div>
                <div className="flex items-end gap-5 text-white/90 text-sm font-semibold mb-1">
                  <span>{greeting.icon}</span>
                  <span className="mb-2">{greeting.text}</span>
                </div>
                <h1 className="text-4xl mt-5 font-black tracking-tight uppercase leading-tight">
                  Halo, {firstName}!
                </h1>
                <p className="text-white/80 mt-1 text-sm max-w-md font-medium">
                  Selamat datang kembali. Pantau progres karir dan perkembangan
                  jejaring almamatermu.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <div className="relative z-20 -mt-16 pb-24">
          {/* LOGIKA RENDERING YANG BERSIH */}
          {loading ? (
            <BerandaSkeleton canAccsess={canAccessAll} />
            // <Loader />
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
                        <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-amber-100 shadow-sm relative overflow-hidden">
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
                          <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-blue-100 shadow-sm relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                            <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 shrink-0">
                              <FileText size={30} strokeWidth={2.5} />
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
                  {/* FIX KARTU PANJANG: Penambahan items-start */}
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
                  {/* FIX KARTU PANJANG: Penambahan items-start */}
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