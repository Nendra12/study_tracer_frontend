import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Briefcase, Users, Building2, 
  ArrowRight, TrendingUp, Calendar, AlertCircle,
  CheckCircle2, Lock, Clock, Star,
  ChevronRight, GraduationCap, MapPin, Zap,
  FileText, Award, Heart, Sun, Sunset, Moon, CloudSun,
  Sparkles, Hand, Menu, X, Bell, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alumniApi, publicApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';

// --- Color palette ---
// Primary: #3C5759 | Secondary: #5A7A7C | Muted: #9AACB0 | Light: #E0E4E6

// --- Greeting helper (icons only, no emoji) ---
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Selamat Pagi', icon: <Sun size={18} className="text-amber-400" /> };
  if (h < 15) return { text: 'Selamat Siang', icon: <CloudSun size={18} className="text-orange-400" /> };
  if (h < 18) return { text: 'Selamat Sore', icon: <Sunset size={18} className="text-orange-500" /> };
  return { text: 'Selamat Malam', icon: <Moon size={18} className="text-indigo-400" /> };
}

// --- Quick Action Button ---
function QuickAction({ icon, label, desc, color, onClick, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/15 shadow-lg hover:shadow-xl hover:bg-white/15 transition-all duration-300 flex items-center gap-4 group cursor-pointer text-left w-full"
    >
      <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-white text-sm">{label}</p>
        <p className="text-white/50 text-xs mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight size={16} className="text-white/40 group-hover:text-white transition-colors group-hover:translate-x-1 transform duration-300" />
    </motion.button>
  );
}

// --- Stat Card ---
function StatCard({ title, value, status, desc, icon, active, grad, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-white/10 backdrop-blur-xl rounded-3xl p-7 border border-white/15 shadow-lg hover:shadow-2xl hover:bg-white/15 transition-all duration-500 flex flex-col h-full group overflow-hidden relative"
    >
      {/* Decorative corner gradient */}
      <div className={`absolute -right-12 -top-12 w-32 h-32 bg-gradient-to-br ${grad} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-[0.15] group-hover:scale-150 transition-all duration-700`} />
      <div className={`absolute -left-8 -bottom-8 w-24 h-24 bg-gradient-to-tr ${grad} opacity-[0.04] rounded-full blur-2xl group-hover:opacity-[0.10] transition-all duration-700`} />

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${grad} text-white shadow-lg group-hover:rotate-3 group-hover:scale-110 transition-all duration-500`}>
          {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
          !active 
            ? 'bg-white/10 text-white/50 border-white/10' 
            : status === 'tertunda' 
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/20' 
              : 'bg-emerald-400/20 text-emerald-300 border-emerald-400/20'
        }`}>
          {!active && <Lock size={10} />}
          {active && status === 'tertunda' && <Clock size={10} />}
          {active && status === 'aktif' && <CheckCircle2 size={10} />}
          <span>{!active ? "Terkunci" : status === 'aktif' ? 'Aktif' : status === 'tertunda' ? 'Pending' : status}</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 relative z-10">
        <h4 className="text-white/50 font-semibold text-xs uppercase tracking-widest">{title}</h4>
        <h2 className={`text-4xl font-black tracking-tight ${!active ? 'text-white/20' : 'text-white'}`}>
          {active ? value : "—"}
        </h2>
        <p className="text-white/50 text-[13px] leading-relaxed">{desc}</p>
      </div>

      <motion.button
        whileHover={{ scale: active ? 1.02 : 1 }}
        whileTap={{ scale: active ? 0.98 : 1 }}
        disabled={!active}
        className={`mt-6 w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
          !active 
            ? 'bg-white/5 text-white/30 cursor-not-allowed' 
            : `bg-gradient-to-r ${grad} text-white hover:shadow-lg cursor-pointer active:scale-95`
        }`}
      >
        {active ? 'Buka Detail' : 'Segera Hadir'} {active && <ArrowRight size={15} />}
      </motion.button>
    </motion.div>
  );
}

// --- Job Card Mini ---
function JobCardMini({ job, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
      className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/15 hover:shadow-lg hover:bg-white/15 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[#3C5759] to-[#5A7A7C] rounded-lg flex items-center justify-center text-white shrink-0">
          <Briefcase size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm truncate group-hover:text-white/80 transition-colors">{job.judul || job.judul_lowongan}</h4>
          <p className="text-white/50 text-xs mt-0.5 truncate">{job.perusahaan?.nama || job.nama_perusahaan}</p>
          <div className="flex items-center gap-2 mt-2">
            {job.tipe_pekerjaan && (
              <span className="text-[10px] font-semibold bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{job.tipe_pekerjaan}</span>
            )}
            {job.lokasi && (
              <span className="text-[10px] text-white/50 flex items-center gap-0.5"><MapPin size={8} /> {job.lokasi}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Progress Ring ---
function ProgressRing({ progress, size = 80, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="url(#progressGradient)" strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0E4E6" />
            <stop offset="100%" stopColor="#9AACB0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black text-white">{progress}%</span>
      </div>
    </div>
  );
}

// === MAIN COMPONENT ===
export default function Beranda() {
  const { user } = useAuth();
  const greeting = getGreeting();

  const [lowongan, setLowongan] = useState([]);
  const [kuesioner, setKuesioner] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const firstName = user?.nama_alumni?.split(' ')[0] || user?.name || 'Alumni';
  const isVerified = user?.status === 'ok';
  const isPending = user?.status === 'pending';
  const tahunLulus = user?.tahun_lulus || '-';
  const avatarUrl = user?.foto
    ? `${STORAGE_BASE_URL}/${user.foto}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=3C5759&color=fff&bold=true`;

  // Calculate profile completeness
  const profileProgress = useMemo(() => {
    if (!user) return 0;
    const fields = ['nama_alumni', 'jenis_kelamin', 'no_hp', 'nis', 'nisn', 'tempat_lahir', 'tanggal_lahir', 'alamat', 'foto', 'tahun_masuk', 'tahun_lulus'];
    const filled = fields.filter(f => user[f]).length;
    return Math.round((filled / fields.length) * 100);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [lowRes, kuesRes] = await Promise.allSettled([
          publicApi.getPublishedLowongan(),
          publicApi.getPublishedKuesioner()
        ]);
        if (lowRes.status === 'fulfilled') {
          const data = lowRes.value.data?.data;
          setLowongan(Array.isArray(data) ? data.slice(0, 3) : (data?.data || []).slice(0, 3));
        }
        if (kuesRes.status === 'fulfilled') {
          const data = kuesRes.value.data?.data;
          setKuesioner(Array.isArray(data) ? data : (data?.data || []));
        }
      } catch { /* silent */ }
      finally { setLoadingData(false); }
    };
    fetchData();
  }, []);

  const STATS = [
    { id: 1, title: "Kelengkapan Profil", value: `${profileProgress}%`, status: profileProgress === 100 ? "aktif" : "tertunda", desc: "Lengkapi profilmu untuk pengalaman terbaik.", icon: <UserCheck />, active: true, grad: "from-[#3C5759] to-[#5A7A7C]" },
    { id: 2, title: "Bursa Kerja", value: `${lowongan.length}+`, status: isVerified ? "aktif" : "terkunci", desc: "Akses lowongan eksklusif mitra sekolah.", icon: <Briefcase />, active: isVerified, grad: isVerified ? "from-[#3C5759] to-[#5A7A7C]" : "from-[#9AACB0] to-[#E0E4E6]" },
    { id: 3, title: "Kuesioner Tracer", value: kuesioner.length > 0 ? `${kuesioner.length} aktif` : "Belum Ada", status: kuesioner.length > 0 ? "tertunda" : "aktif", desc: "Kontribusi data untuk almamater.", icon: <FileText />, active: true, grad: "from-[#5A7A7C] to-[#3C5759]" },
    { id: 4, title: "Jejaring Alumni", value: "5.2k", status: "terkunci", desc: "Cari rekan angkatan & koneksi profesional.", icon: <Users />, active: false, grad: "from-[#9AACB0] to-[#E0E4E6]" },
    { id: 5, title: "Perusahaan Mitra", value: "100+", status: "terkunci", desc: "Daftar industri yang bekerja sama.", icon: <Building2 />, active: false, grad: "from-[#9AACB0] to-[#E0E4E6]" },
    { id: 6, title: "Sertifikasi", value: "Segera", status: "terkunci", desc: "Tingkatkan value profesionalmu.", icon: <Award />, active: false, grad: "from-[#9AACB0] to-[#E0E4E6]" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#3C5759]/10 relative overflow-hidden">

      {/* === FULL-PAGE ANIMATED BACKGROUND (no green filter) === */}
      <div className="fixed inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.08, 1.03, 1.06, 1],
            x: [0, 15, -10, 5, 0],
            y: [0, -10, 8, -5, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-[-40px]"
        >
          <img 
            src="/backgroundAlumni.jpg" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Soft dark overlay for readability — NO green tint */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

        {/* Floating decorative shapes */}
        <motion.div animate={{ y: [0, -15, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-[10%] top-[15%] w-40 h-40 border border-white/10 rounded-full" />
        <motion.div animate={{ y: [0, 12, 0], x: [0, -6, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-[8%] top-[40%] w-24 h-24 border border-white/5 rounded-full" />
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} className="absolute right-[25%] bottom-[20%] w-32 h-32 bg-white/[0.03] rounded-full" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute left-[15%] bottom-[30%] w-48 h-48 border border-white/[0.04] rounded-full" />
        <div className="absolute right-[5%] top-[55%] w-2 h-2 bg-white/20 rounded-full" />
        <div className="absolute left-[30%] top-[25%] w-1.5 h-1.5 bg-white/15 rounded-full" />
        <div className="absolute right-[40%] bottom-[40%] w-1 h-1 bg-white/10 rounded-full" />
      </div>

      {/* === FIXED NAVBAR === */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="bg-white/10 backdrop-blur-2xl border-b border-white/10">
          <div className="w-full px-4 sm:px-8 lg:px-16 h-16 flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl border border-white/20">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-white text-sm tracking-tight">Alumni Tracer</span>
                <span className="block text-white/40 text-[9px] font-medium -mt-0.5 tracking-wider uppercase">Study Platform</span>
              </div>
            </motion.div>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-1.5 py-1 border border-white/10">
              {[
                { label: 'Beranda', active: true },
                { label: 'Lowongan', active: false },
                { label: 'Kuesioner', active: false },
                { label: 'Profil', active: false },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    item.active
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
              >
                <Search size={15} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-white/10 border border-white/10 text-white/60 hover:text-white hover:bg-white/15 transition-all relative cursor-pointer"
              >
                <Bell size={15} />
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-black/20" />
              </motion.button>
              <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm pl-2.5 pr-1 py-1 rounded-full border border-white/10 cursor-pointer hover:bg-white/15 transition-all">
                <span className="text-[11px] font-bold text-white/80 hidden sm:block">{firstName}</span>
                <img src={avatarUrl} className="w-7 h-7 rounded-full border border-white/20 object-cover" alt="Profile" />
              </div>
              <button className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/10 text-white/60 hover:text-white cursor-pointer">
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 relative z-10" />

      {/* === HERO SECTION === */}
      <div className="relative z-10">

        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 pt-10 pb-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left: User greeting */}
            <div className="flex items-center gap-5">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="relative">
                  <img src={avatarUrl} alt="avatar" className="w-18 h-18 rounded-2xl border-3 border-white/30 shadow-2xl object-cover" />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${isVerified ? 'bg-emerald-400' : isPending ? 'bg-amber-400' : 'bg-[#9AACB0]'}`} />
                </div>
              </motion.div>
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-white/60 text-sm font-medium flex items-center gap-2"
                >
                  {greeting.icon} {greeting.text}
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3"
                >
                  {firstName}!
                  <motion.span 
                    initial={{ opacity: 0, rotate: -20 }} 
                    animate={{ opacity: 1, rotate: 0 }} 
                    transition={{ delay: 0.5 }}
                  >
                    <Hand size={28} className="text-white/80" />
                  </motion.span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/40 text-sm mt-1"
                >
                  Pantau progres karir Anda di sini
                </motion.p>
              </div>
            </div>

            {/* Right: Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 flex-wrap"
            >
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                <GraduationCap size={16} className="text-white/70" />
                <span className="text-xs font-bold text-white/90">Angkatan {tahunLulus}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                <Calendar size={16} className="text-white/70" />
                <span className="text-xs font-bold text-white/90">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      <main className="w-full px-4 sm:px-8 lg:px-16 pb-20 pt-8 relative z-10">

        {/* === VERIFICATION BANNER === */}
        <AnimatePresence>
          {!isVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-r from-[#3C5759] via-[#5A7A7C] to-[#3C5759] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-[#3C5759]/15 overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute -right-20 -top-20 w-60 h-60 bg-white/5 rounded-full" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full" />
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/15">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    {isPending ? <Clock size={28} className="text-white" /> : <AlertCircle size={28} className="text-white" />}
                  </motion.div>
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1 tracking-tight flex items-center gap-2 justify-center md:justify-start">
                    {isPending ? 'Akun Sedang Ditinjau' : 'Verifikasi Diperlukan'}
                    <Sparkles size={16} className="text-[#E0E4E6]" />
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                    {isPending
                      ? 'Admin sedang meninjau data Anda. Fitur premium akan aktif setelah verifikasi selesai.'
                      : 'Lengkapi profil dan tunggu verifikasi admin untuk membuka semua fitur.'}
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
                  <button className="bg-white text-[#3C5759] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#3C5759] hover:text-white border-2 border-transparent hover:border-white/30 transition-all cursor-pointer shadow-lg">
                    {isPending ? 'Lihat Status' : 'Lengkapi Profil'}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === QUICK ACTIONS + PROFILE PROGRESS === */}
        <section className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg lg:row-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm">Profil Kamu</h3>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${profileProgress === 100 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-white/70'}`}>
                {profileProgress === 100 ? 'Lengkap' : 'Belum Lengkap'}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <ProgressRing progress={profileProgress} />
              <div className="space-y-2 flex-1">
                <p className="text-xs text-white/60">
                  {profileProgress === 100
                    ? 'Profil kamu sudah lengkap.'
                    : 'Lengkapi profilmu agar lebih mudah ditemukan rekruter.'}
                </p>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="text-xs font-bold text-white flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Edit Profil <ArrowRight size={12} />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickAction icon={<Briefcase size={20} className="text-white" />} label="Cari Lowongan" desc="Temukan pekerjaan impianmu" color="bg-gradient-to-br from-[#3C5759] to-[#5A7A7C]" delay={0.2} />
            <QuickAction icon={<FileText size={20} className="text-white" />} label="Isi Kuesioner" desc="Bantu tingkatkan kualitas sekolah" color="bg-gradient-to-br from-[#5A7A7C] to-[#9AACB0]" delay={0.25} />
            <QuickAction icon={<UserCheck size={20} className="text-white" />} label="Perbarui Profil" desc="Jaga informasimu tetap terkini" color="bg-gradient-to-br from-[#3C5759] to-[#5A7A7C]" delay={0.3} />
            <QuickAction icon={<Heart size={20} className="text-white" />} label="Lowongan Tersimpan" desc="Lihat lowongan yang kamu simpan" color="bg-gradient-to-br from-[#5A7A7C] to-[#3C5759]" delay={0.35} />
          </div>
        </section>

        {/* === STATS GRID === */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-white/10 rounded-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg tracking-tight">Dashboard</h2>
              <p className="text-white/50 text-xs">Ringkasan aktivitas & fitur</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STATS.map((item, index) => (
              <StatCard key={item.id} {...item} index={index} />
            ))}
          </div>
        </section>

        {/* === LATEST JOBS === */}
        {lowongan.length > 0 && (
          <section className="mb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Zap size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg tracking-tight">Lowongan Terbaru</h2>
                    <p className="text-white/50 text-xs">Peluang kerja dari mitra sekolah</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="text-xs font-bold text-white flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Lihat Semua <ArrowRight size={14} />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowongan.map((job, i) => (
                  <JobCardMini key={job.id || i} job={job} index={i} />
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* === MOTIVATIONAL FOOTER BANNER === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/15 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="p-4 bg-white/15 rounded-2xl shadow-sm border border-white/10">
            <Star size={28} className="text-white" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="font-bold text-white text-base mb-1">Jangan Lewatkan Peluang!</h3>
            <p className="text-white/60 text-sm">Pastikan profilmu selalu terbarui dan isi kuesioner tracer untuk membantu sekolah meningkatkan kualitas pendidikan.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-[#3C5759] px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/90 transition-all cursor-pointer shadow-lg whitespace-nowrap"
          >
            Mulai Sekarang
          </motion.button>
        </motion.div>
      </main>

      {/* === FOOTER === */}
      <footer className="relative z-10 mt-auto">
        <div className="bg-black/30 backdrop-blur-2xl border-t border-white/10">
          <div className="w-full px-4 sm:px-8 lg:px-16 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Left: Branding */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                    <GraduationCap className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight">ALUMNI TRACER</p>
                    <p className="text-white/30 text-[9px] font-medium tracking-wider uppercase">Study Platform</p>
                  </div>
                </div>
                <p className="text-white/30 text-[11px] mt-1">Menghubungkan alumni dengan peluang terbaik.</p>
              </div>

              {/* Center: Links */}
              <div className="flex justify-center gap-8">
                {[
                  { label: 'Beranda', icon: <Star size={12} /> },
                  { label: 'Lowongan', icon: <Briefcase size={12} /> },
                  { label: 'Profil', icon: <UserCheck size={12} /> },
                  { label: 'Bantuan', icon: <Heart size={12} /> },
                ].map((item) => (
                  <a key={item.label} href="#" className="text-white/40 hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5 group">
                    <span className="text-white/20 group-hover:text-white/60 transition-colors">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>

              {/* Right: Copyright */}
              <div className="flex flex-col items-center md:items-end gap-1.5">
                <div className="flex items-center gap-2">
                  {['Privasi', 'Syarat'].map((item, i) => (
                    <React.Fragment key={item}>
                      {i > 0 && <span className="text-white/10 text-[10px]">|</span>}
                      <a href="#" className="text-white/30 hover:text-white/60 text-[10px] font-bold uppercase tracking-widest transition-colors">{item}</a>
                    </React.Fragment>
                  ))}
                </div>
                <p className="text-white/20 text-[10px] font-medium">&copy; {new Date().getFullYear()} Hak Cipta Dilindungi.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}