import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Briefcase, Users, Building2, 
  ArrowRight, TrendingUp, Calendar, AlertCircle,
  CheckCircle2, Lock, Clock, FileText, Heart, 
  Sun, Sunset, Moon, CloudSun
} from 'lucide-react';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Selamat Pagi', icon: <Sun size={18} className="text-amber-400" /> };
  if (h < 15) return { text: 'Selamat Siang', icon: <CloudSun size={18} className="text-amber-500" /> };
  if (h < 18) return { text: 'Selamat Sore', icon: <Sunset size={18} className="text-orange-500" /> };
  return { text: 'Selamat Malam', icon: <Moon size={18} className="text-indigo-400" /> };
}

function QuickAction({ icon, label, desc, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-4 text-left w-full group"
    >
      <div className="p-3 rounded-xl bg-[#3C5759]/10 text-[#3C5759] group-hover:bg-[#3C5759] group-hover:text-white transition-all duration-300 group-hover:rotate-3">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-[#3C5759] group-hover:translate-x-1 transition-all duration-300" />
    </motion.button>
  );
}

// --- Komponen StatCard dengan Animasi ---
function StatCard({ title, value, status, desc, icon, active, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col h-full relative overflow-hidden group hover:border-[#3C5759]/30 transition-colors duration-300 hover:shadow-[0_20px_40px_-15px_rgba(60,87,89,0.15)]"
    >
      {/* Efek Garis Bawah Meluas saat di-hover */}
      <div className="absolute bottom-0 left-0 h-1.5 bg-[#3C5759] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

      <div className="flex justify-between items-start mb-5 relative z-10">
        {/* Ikon dengan animasi scale & rotate */}
        <div className={`p-3.5 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${active ? 'bg-[#3C5759] text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
          !active ? 'bg-slate-100 text-slate-400' : 
          status === 'tertunda' ? 'bg-amber-100 text-amber-600' : 
          'bg-emerald-100 text-emerald-600'
        }`}>
          {!active ? <Lock size={10} /> : status === 'tertunda' ? <Clock size={10} /> : <CheckCircle2 size={10} />}
          <span>{!active ? "Terkunci" : status === 'aktif' ? 'Aktif' : 'Pending'}</span>
        </div>
      </div>
      
      <div className="flex-1 relative z-10">
        <h4 className="text-slate-500 font-semibold text-xs mb-1 group-hover:text-[#3C5759] transition-colors">{title}</h4>
        <h2 className={`text-4xl font-black tracking-tight mt-1 ${!active ? 'text-slate-300' : 'text-slate-800'}`}>
          {value}
        </h2>
        <p className="text-slate-500 text-xs mt-3 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function Beranda() {
  const greeting = getGreeting();
  const user = { nama_alumni: 'Wiwik Ainun', status: 'pending', tahun_lulus: '2024' };
  const isVerified = user?.status === 'ok';
  const profileProgress = 65; 

  const STATS = [
    { id: 1, title: "Kelengkapan Profil", value: `${profileProgress}%`, status: profileProgress === 100 ? "aktif" : "tertunda", desc: "Lengkapi data diri untuk pengalaman terbaik.", icon: <UserCheck />, active: true },
    { id: 2, title: "Bursa Kerja", value: isVerified ? "12" : "---", status: isVerified ? "aktif" : "terkunci", desc: "Lowongan eksklusif dari mitra sekolah.", icon: <Briefcase />, active: isVerified },
    { id: 3, title: "Kuesioner", value: "2", status: "tertunda", desc: "Bantu almamater dengan mengisi kuesioner.", icon: <FileText />, active: true },
    { id: 4, title: "Jejaring Alumni", value: "5k+", status: "terkunci", desc: "Terhubung dengan teman-teman alumni dan perluas jaringan profesional.", icon: <Users />, active: false },
    { id: 5, title: "Mitra Perusahaan", value: "100+", status: "terkunci", desc: "Lihat berbagai perusahaan mitra yang bekerja sama dengan sekolah.", icon: <Building2 />, active: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-[#3C5759]/20 overflow-x-hidden">
      
      <Navbar user={user} />

      {/* === HERO SECTION === */}
      <div className="relative pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <img src="/backgroundAlumni.jpg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-slate-50/70 to-slate-50" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-center gap-5 md:gap-6">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ type: "spring" }}
                className="relative"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white/10 backdrop-blur-md border-2 border-white/40 shadow-2xl flex items-center justify-center text-white text-3xl sm:text-4xl font-black">
                   {user.nama_alumni.substring(0, 2).toUpperCase()}
                </div>
                <div className={`absolute -bottom-2 -right-2 p-2 rounded-full border-4 border-transparent bg-clip-padding ${isVerified ? 'bg-emerald-400' : 'bg-amber-400'}`}>
                   {isVerified ? <CheckCircle2 size={16} className="text-white"/> : <Clock size={16} className="text-white"/>}
                </div>
              </motion.div>
              <div>
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 text-white/90 text-sm mb-1.5 font-medium">
                  {greeting.icon} {greeting.text}
                </motion.div>
                <motion.h1 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
                  Halo, {user.nama_alumni.split(' ')[0]}!
                </motion.h1>
                <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-white/80 mt-2 text-sm sm:text-base">
                  Pantau progres karir dan data studimu di sini.
                </motion.p>
              </div>
            </div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex gap-3">
              <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-3 text-white shadow-lg">
                <Calendar size={18} className="text-white/80" />
                <span className="text-sm font-bold tracking-wide">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <main className="relative z-20 flex-1 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 -mt-20 pb-24 w-full">
        
        {/* === BANNER VERIFIKASI === */}
        <AnimatePresence>
          {!isVerified && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-slate-200/50 border-l-[10px] border-l-[#3C5759]">
                <div className="bg-amber-50 p-4 rounded-full text-amber-500">
                  <AlertCircle size={36} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-800 mb-1.5">Verifikasi Diperlukan</h3>
                  <p className="text-slate-500 text-sm md:text-base max-w-4xl">Lengkapi profil Anda dan tunggu verifikasi admin untuk membuka semua fitur eksklusif, termasuk akses ke bursa kerja dari mitra industri kami.</p>
                </div>
                <button className="bg-[#3C5759] text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-[#2A3D3E] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 whitespace-nowrap">
                  Lengkapi Profil Sekarang
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === QUICK ACTIONS GRID === */}
        <section className="mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <QuickAction icon={<Briefcase size={22}/>} label="Cari Lowongan" desc="Temukan pekerjaan impian" />
            <QuickAction icon={<FileText size={22}/>} label="Isi Kuesioner" desc="Tingkatkan kualitas sekolah" />
            <QuickAction icon={<UserCheck size={22}/>} label="Perbarui Profil" desc="Jaga informasimu terbaru" />
            <QuickAction icon={<Heart size={22}/>} label="Lowongan Tersimpan" desc="Lihat yang kamu simpan" />
          </div>
        </section>

        {/* === DASHBOARD STATS === */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#3C5759]/10 rounded-xl text-[#3C5759]">
                <TrendingUp size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ringkasan Aktivitas</h2>
                <p className="text-slate-500 text-sm mt-0.5">Pantau statistik akun Anda secara real-time</p>
              </div>
            </div>
          </div>
          
          {/* Menggunakan Grid 3 Kolom Standar:
            Semua kartu akan memiliki lebar yang sama. 
            Kartu ke-4 dan ke-5 akan berada di kiri dan tengah bawah.
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {STATS.map((item, index) => (
              <StatCard key={item.id} {...item} index={index} />
            ))}
          </div>
        </section>

      </main>

      <Footer />

    </div>
  );
}