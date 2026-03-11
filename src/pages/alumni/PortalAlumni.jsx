import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  BellRing,
  AlertCircle,
  X,
} from "lucide-react";

import morning from "../../assets/morning.png";
import afternoon from "../../assets/afternoon.png";
import night from "../../assets/moon.png";
import StatusPengajuanModal from "../../components/alumni/StatusPengajuanModal";
import { alumniApi } from "../../api/alumni";
import { useEffect } from "react";

// --- MOCK DATA ---
const mockProfile = {
  name: "Danendra",
  major: "Rekayasa Perangkat Lunak",
  graduationYear: "2023",
  status: "Bekerja",
  company: "Tech Solutions Inc.",
  isVerified: false, // Set to false untuk menampilkan notifikasi
  tracerProgress: 75,
  hasCompletedKuesioner: false, // Tambahan untuk kuesioner
};

const mockAnnouncements = [
  {
    id: 1,
    title: "Job Fair Nasional 2026",
    date: "15 Mar 2026",
    desc: "Ikuti bursa kerja tahunan dengan lebih dari 50 perusahaan teknologi terkemuka.",
  },
  {
    id: 2,
    title: "Batas Akhir Pengisian Tracer Study",
    date: "30 Mar 2026",
    desc: "Mohon segera lengkapi kuesioner tracer study Anda untuk keperluan akreditasi sekolah.",
  },
];


const mockStats = [
  { label: "Bekerja", percentage: 65, color: "bg-emerald-500" },
  { label: "Melanjutkan Studi", percentage: 20, color: "bg-blue-500" },
  { label: "Wirausaha", percentage: 10, color: "bg-amber-500" },
  { label: "Mencari Kerja", percentage: 5, color: "bg-[#9ca3af]" },
];

// Mock data status pengajuan
const mockStatusPengajuan = {
  status: "pending",
  tanggal_pengajuan: "2024-01-15",
  keterangan: "Data Anda sedang dalam proses verifikasi oleh tim admin. Mohon menunggu 1-3 hari kerja.",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12)
    return {
      text: "Selamat Pagi",
      icon: (
        <img
          src={morning}
          alt={"Selamat Pagi"}
          className="w-10 sm:w-12 drop-shadow-md"
        />
      ),
    };
  if (h < 15)
    return {
      text: "Selamat Siang",
      icon: (
        <img
          src={afternoon}
          alt={"Selamat Siang"}
          className="w-10 sm:w-12 drop-shadow-md"
        />
      ),
    };
  if (h < 18)
    return {
      text: "Selamat Sore",
      icon: (
        <img
          src={afternoon}
          alt={"Selamat Sore"}
          className="w-10 sm:w-12 drop-shadow-md"
        />
      ),
    };
  return {
    text: "Selamat Malam",
    icon: (
      <img
        src={night}
        alt={"Selamat Malam"}
        className="w-10 sm:w-12 drop-shadow-md"
      />
    ),
  };
}

export default function AlumniPortal() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const greeting = getGreeting();
  const isVerified = mockProfile.isVerified;
  const hasCompletedKuesioner = mockProfile.hasCompletedKuesioner;
  const kuesionerPending = [{ id: 1, title: "Tracer Study 2024" }]; // Dummy data
  const [berandaData, setBerandaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lock body scroll when modals are open
  useEffect(() => {
    document.body.style.overflow = isStatusOpen || selectedImage ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isStatusOpen, selectedImage]);

  useEffect(() => {
    let cancelled = false;
    async function fetchBeranda() {
      try {
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

  // console.log(berandaData)
  // console.log("kocakk")
  return (
    <div>
      {/* ================= HERO SECTION ================= */}
      <div className="relative bg-[#3c5759] pt-30 pb-28 overflow-hidden rounded-b-[3rem] shadow-xl">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-[#526061] rounded-full blur-[120px] pointer-events-none opacity-50"></div>
        <div className="absolute bottom-[-20%] right-[-5%] w-[30%] h-[50%] bg-[#f3f4f4]/20 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
            {/* Left: Greeting & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 lg:max-w-xl"
            >
              <div className="flex items-center gap-3 font-semibold mb-4 bg-fourth border border-primary/20 px-4 py-2 rounded-3xl backdrop-blur-sm shadow-lg">
                {greeting.icon}
                <span className="text-primary text-sm md:text-base tracking-wide">
                  {greeting.text}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                Halo,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3f4f4] to-[#9ca3af]">
                  {mockProfile.name}
                </span>
              </h1>
              <p className="text-lg text-[#9ca3af] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Portal ini dirancang untuk memantau progres karir Anda,
                menemukan peluang eksklusif, dan menjaga silaturahmi dengan
                almamater tercinta.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#3c5759] rounded-full text-sm font-black shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  <ClipboardCheck size={18} /> Isi Kuesioner Sekarang
                </button>
                <button className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-full text-sm font-bold backdrop-blur-md transition-all flex items-center justify-center gap-2">
                  <User size={18} /> Perbarui Profil
                </button>
              </div>
            </motion.div>

            {/* Right: Floating Contextual Cards (From previous prompt) */}
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
                {/* Glow effect */}
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
                        Tahun Lulus: 2023
                      </p>
                    </div>
                  </div>
                  {isVerified ? (
                    <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                      <ShieldCheck size={12} strokeWidth={3} /> Terverifikasi
                    </div>
                  ) : (
                    <div className="bg-amber-500/20 border border-amber-500/50 text-amber-300 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                      <Clock size={12} strokeWidth={3} /> Pending
                    </div>
                  )}
                </div>

                <div className="relative z-10 space-y-3">
                  <div className="flex justify-between text-xs font-bold items-end">
                    <span className="text-slate-600">Progres Kuesioner</span>
                    <span className="text-2xl font-black text-primary">
                      75%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{
                        delay: 0.8,
                        duration: 1.2,
                        ease: "easeOut",
                      }}
                      className="h-full bg-gradient-to-r from-third to-white rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic font-medium">
                    Selesaikan 2 bagian lagi untuk divalidasi sistem.
                  </p>
                </div>
              </motion.div>

              {/* 3. Notifikasi Update Almamater (Bottom Left) */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0, y: [-5, 5, -5] }}
                transition={{
                  opacity: { delay: 0.7, duration: 0.5 },
                  y: {
                    repeat: Infinity,
                    duration: 7,
                    ease: "easeInOut",
                    delay: 2,
                  },
                }}
                className="absolute -bottom-8 -left-6 z-30 bg-white/95 backdrop-blur-md text-slate-800 p-3 pr-6 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate("/alumni/berita")}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-third/10 flex items-center justify-center text-third">
                    <BellRing size={20} strokeWidth={2.5} />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                    Info Kampus
                  </span>
                  <span className="text-sm font-black">Agenda Reuni Akbar</span>
                </div>
              </motion.div>

              {/* 4. Decorative Icon (Floating independent) */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }}
                transition={{
                  opacity: { delay: 0.9, duration: 0.4 },
                  y: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "easeInOut",
                    delay: 1.5,
                  },
                }}
                className="absolute top-10 -left-6 z-0 bg-primary/80 border border-white/20 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white backdrop-blur-md rotate-12"
              >
                <GraduationCap size={22} strokeWidth={2} />
              </motion.div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30 pb-20">
        {/* Profile Quick Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              label: "Tahun Lulus",
              value: mockProfile.graduationYear,
              icon: <Calendar size={20} />,
            },
            {
              label: "Jurusan",
              value: mockProfile.major,
              icon: <GraduationCap size={20} />,
            },
            {
              label: "Status Saat Ini",
              value: mockProfile.status,
              icon: <User size={20} />,
            },
            {
              label: "Instansi/Perusahaan",
              value: mockProfile.company,
              icon: <Building2 size={20} />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#f3f4f4] text-[#3c5759] flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <p className="text-xs text-[#9ca3af] font-bold uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-sm sm:text-base font-black text-[#3c5759] leading-tight">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 mb-10">
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
                      dibatasi. Tim admin kami akan melakukan verifikasi data
                      Anda segera.
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
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
                        Mohon bantu almamater dengan mengisi kuesioner pelacakan
                        alumni untuk meningkatkan kualitas mutu pendidikan.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (kuesionerPending[0]?.id)
                          alert(
                            `Navigasi ke kuesioner ID: ${kuesionerPending[0].id}`,
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
        <section className="mb-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">
                Jejaring Alumni
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Kenali rekan sejawat dan bangun koneksi profesional
              </p>
            </div>
            <button className="group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border bg-white text-primary border-slate-200 hover:border-primary cursor-pointer transition-all">
              Lihat Semua{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockLatestAlumni.map((alumni) => (
              <div
                key={alumni.id}
                className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={alumni.avatar}
                    alt={alumni.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-primary text-base">
                      {alumni.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {alumni.major} • {alumni.year}
                    </p>
                  </div>
                </div>
                <div className="bg-[#f3f4f4] rounded-xl px-3 py-2 text-center">
                  <p className="text-xs font-bold text-slate-600">
                    {alumni.job}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEFT COLUMN: Announcements & Jobs */}
        <div className="grid lg:grid-cols-3 gap-5 space-y-8">
          {/* Announcements */}
          <section className="bg-white rounded-[2rem] lg:col-span-2 mb-0 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-[#3c5759]">
                  Pengumuman Sekolah
                </h2>
                <p className="text-sm text-[#9ca3af] mt-1 font-medium">
                  Informasi terbaru seputar kegiatan dan agenda.
                </p>
              </div>
              <button className="text-sm font-bold text-[#3c5759] hover:text-[#526061] flex items-center gap-1">
                Lihat Semua <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {mockAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="group p-5 rounded-2xl border border-gray-100 hover:border-[#3c5759]/30 hover:bg-[#f3f4f4]/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#3c5759] group-hover:text-[#526061]">
                        {ann.title}
                      </h3>
                      <p className="text-sm text-[#526061] mt-2 line-clamp-2">
                        {ann.desc}
                      </p>
                    </div>
                    <span className="shrink-0 px-3 py-1 bg-[#f3f4f4] text-[#526061] text-xs font-bold rounded-lg border border-gray-200">
                      {ann.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#3c5759] text-white rounded-[2rem] p-6 sm:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h2 className="text-xl font-black relative z-10">
              Statistik Lulusan
            </h2>
            <p className="text-xs text-white/60 mb-6 font-medium relative z-10">
              Distribusi status alumni tahun 2023.
            </p>

            <div className="space-y-4 relative z-10">
              {mockStats.map((stat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-white/90">{stat.label}</span>
                    <span>{stat.percentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
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

        {/* Job Vacancies */}
        <section className="bg-white rounded-[2rem] mt-8 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#3c5759]">
                Peluang Karir
              </h2>
              <p className="text-sm text-[#9ca3af] mt-1 font-medium">
                Lowongan eksklusif dari mitra industri sekolah.
              </p>
            </div>
            <button className="text-sm font-bold text-[#3c5759] hover:text-[#526061] flex items-center gap-1">
              Cari Lowongan <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all bg-white flex flex-col justify-between h-full"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f3f4f4] flex items-center justify-center text-[#9ca3af] mb-4">
                    <Building2 size={24} />
                  </div>
                  <h3 className="font-bold text-[#3c5759] text-lg">
                    {job.role}
                  </h3>
                  <p className="text-sm font-semibold text-[#526061] mb-4">
                    {job.company}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#9ca3af] bg-[#f3f4f4] px-2.5 py-1 rounded-md">
                      <MapPin size={12} /> {job.location}
                    </span>
                    <span className="text-xs font-semibold text-[#9ca3af] bg-[#f3f4f4] px-2.5 py-1 rounded-md">
                      {job.type}
                    </span>
                  </div>
                  <button className="w-full py-2.5 rounded-xl border-2 border-[#3c5759] text-[#3c5759] font-bold text-sm hover:bg-[#3c5759] hover:text-white transition-colors">
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT COLUMN: Sidebar (Stats & Latest Alumni) */}
        <div className="space-y-8">{/* Statistics */}</div>
      </main>

      {/* MODALS */}
      <AnimatePresence>
        <StatusPengajuanModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          data={mockStatusPengajuan}
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
    </div>
  );
}
