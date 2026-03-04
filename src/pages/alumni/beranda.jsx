import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, Briefcase, Users, ArrowRight, Calendar, AlertCircle, MapPin,
  X, Hourglass, Building2, Bookmark, GraduationCap, Sun, Sunset, Moon, CloudSun,
  FileText, CheckCircle2, Clock
} from 'lucide-react';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import StatusPengajuanModal from '../../components/alumni/StatusPengajuanModal';

// --- Helper Greeting ---
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Selamat Pagi', icon: <Sun size={18} className="text-amber-400" /> };
  if (h < 15) return { text: 'Selamat Siang', icon: <CloudSun size={18} className="text-amber-500" /> };
  if (h < 18) return { text: 'Selamat Sore', icon: <Sunset size={18} className="text-orange-500" /> };
  return { text: 'Selamat Malam', icon: <Moon size={18} className="text-indigo-400" /> };
}

// --- Data Dummy ---
const DUMMY_ALUMNI = [
  { id: 1, name: "John Smith", angkatan: "2022", role: "MBA Candidate", company: "Harvard University", tags: "Kuliah", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, name: "Alice Johnson", angkatan: "2020", role: "Founder & CEO", company: "NextGen Solutions", tags: "Wirausaha", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, name: "Charlie Davis", angkatan: "2021", role: "Data Analyst", company: "Mencari Pekerjaan", tags: "Mencari", image: "https://randomuser.me/api/portraits/men/46.jpg" },
  { id: 4, name: "Sarah Lee", angkatan: "2017", role: "Product Designer", company: "Creative Studio", tags: "Bekerja", image: "https://randomuser.me/api/portraits/women/68.jpg" },
];

const DUMMY_JOBS = [
  { id: 1, title: "IT Support", company: "Smec", location: "Malang, Jawa Timur", deadline: "3 hari lagi", time: "25 Mei 2026, 23:59 WIB", image: "/Desain Poster Job.jpg" },
  { id: 2, title: "IT Support", company: "Smec", location: "Malang, Jawa Timur", deadline: "3 hari lagi", time: "25 Mei 2026, 23:59 WIB", image: "/Desain Poster Job.jpg" },
  { id: 3, title: "IT Support", company: "Smec", location: "Malang, Jawa Timur", deadline: "3 hari lagi", time: "25 Mei 2026, 23:59 WIB", image: "/Desain Poster Job.jpg" },
  { id: 4, title: "IT Support", company: "Smec", location: "Malang, Jawa Timur", deadline: "3 hari lagi", time: "25 Mei 2026, 23:59 WIB", image: "/Desain Poster Job.jpg" },
];

const DUMMY_COMPANIES = [
  { id: 1, name: "Tech Nusantara Ltd.", location: "Jakarta, Indonesia", alumniCount: 124 },
  { id: 2, name: "Global Innovation Inc.", location: "Bandung, Indonesia", alumniCount: 98 },
  { id: 3, name: "Creative Digital Agency", location: "Remote", alumniCount: 76 },
  { id: 4, name: "Manufacture Pro", location: "Surabaya, Indonesia", alumniCount: 54 },
  { id: 5, name: "State Bank Persero", location: "Jakarta, Indonesia", alumniCount: 42 },
];
// --- Komponen Card Profil Alumni ---
function AlumniProfileCard({ data, onImageClick }) {
  if (!data) return null;

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full cursor-pointer">
      
      {/* --- BAGIAN 1 & 2: Kontainer Atas --- */}
      <div className="flex gap-4 mb-4 relative">

        {/* BAGIAN 1: Gambar Profil */}
        <div 
          className="w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 cursor-pointer group"
          onClick={(e) => {
            e.stopPropagation(); // Mencegah klik menyebar ke card utama
            onImageClick(data.image); // Memanggil modal popup
          }}
        >
          <img 
            src={data.image || `https://ui-avatars.com/api/?name=${data.name.replace(' ', '+')}&background=3C5759&color=fff&size=150`} 
            alt={data.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* BAGIAN 2: Penjelasan (Teks) */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-2">
            <h3 className="font-bold text-[#3C5759] text-sm line-clamp-1">{data.name}</h3>
            <p className="text-slate-400 text-[11px]">Angkatan {data.angkatan}</p>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5 text-slate-600">
              <GraduationCap size={14} className="text-[#3C5759] shrink-0 mt-0.5" />
              <span className="text-[11px] font-semibold line-clamp-2 leading-tight">{data.role}</span>
            </div>
            <div className="flex items-start gap-1.5 text-slate-500">
              <Building2 size={14} className="text-slate-400 shrink-0 mt-0.5" />
              <span className="text-[11px] font-medium line-clamp-2 leading-tight">{data.company}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BAGIAN 3: Footer (Tag Satu Warna) --- */}
      <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#3C5759]/10 text-[#3C5759]">
          {data.tags}
        </span>
        
        <button className="flex items-center gap-1 text-[12px] font-bold text-[#3C5759] hover:underline transition-all cursor-pointer">
          Lihat Profil <ArrowRight size={14} />
        </button>
      </div>
      
    </motion.div>
  );
}

// --- Komponen Card Lowongan (Penuh Kanan-Kiri, Potong Atas-Bawah dengan Gelombang) ---
function JobPosterCard({ data, onImageClick }) {
  if (!data) return null;
  return (
    <motion.div 
      whileHover={{ y: -8, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} 
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full cursor-pointer transition-all duration-300 group"
    >
      {/* Kontainer Gambar */}
      <div 
        className="h-56 overflow-hidden relative cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(data.image);
        }}
      >
        <img 
          src={data.image || "/Desain Poster Job.jpg"} 
          alt="Lowongan" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Poster+Not+Found"; }} 
        />
        
        {/* --- EFEK GELOMBANG MENGGUNAKAN SVG --- */}
        <svg 
          className="absolute -bottom-[1px] left-0 w-full h-8 z-20" 
          viewBox="0 0 1440 100" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fill="#ffffff" 
            d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
          ></path>
        </svg>
        
        {/* Overlay gradasi halus */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent z-10" />
      </div>

      <div className="p-5 pt-4 flex-1 flex flex-col relative z-20">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-black text-[#3C5759] text-lg leading-tight flex-1 line-clamp-2">{data.title}</h3>
          <span className="text-red-500 text-[10px] font-black uppercase bg-red-50 px-2 py-1 rounded-md ml-2 shrink-0">
            {data.deadline}
          </span>
        </div>
        
        {data.time && (
          <div className="mb-3">
            <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium">
              Berakhir: {data.time}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#3C5759]">
            <Building2 size={16} />
          </div>
          <span className="font-bold text-sm text-slate-700 line-clamp-1">{data.company}</span>
        </div>

        <div className="bg-slate-50 rounded-xl px-3 py-2 self-start mb-4 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
            <MapPin size={14} className="text-[#3C5759]" />
            <span className="line-clamp-1">{data.location}</span>
          </div>
        </div>

        <p className="text-slate-500 text-[12px] leading-relaxed mb-6 line-clamp-3">
          Bergabunglah bersama tim profesional kami untuk mengelola infrastruktur IT dan memberikan dukungan teknis terbaik bagi perusahaan.
        </p>

        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] font-medium italic">Dipasang 2 hari lalu</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
              <Bookmark size={18} className="text-slate-300 hover:text-[#3C5759]" />
            </button>
            <button className="p-2 bg-[#3C5759]/5 hover:bg-[#3C5759]/10 rounded-full transition-colors cursor-pointer">
              <ArrowRight size={18} className="text-[#3C5759]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default function Beranda() {
  const greeting = getGreeting();
  const user = { nama_alumni: 'Wiwik Ainun', status: 'pending' }; 
  const isVerified = user?.status === 'ok';
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = (isStatusOpen || selectedImage) ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isStatusOpen, selectedImage]);

  const firstName = user.nama_alumni ? user.nama_alumni.split(' ')[0] : "Alumni";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-[#3C5759]/20 overflow-x-hidden relative">
      <Navbar user={user} />

      {/* HERO SECTION */}
      <div 
        className="relative pt-20 pb-28 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/backgroundAlumni.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40 z-0" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-slate-50 z-1" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 text-white mt-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#3C5759] border-2 border-white/40 shadow-xl flex items-center justify-center text-xl font-black">
               {user.nama_alumni?.charAt(0) || "A"}
            </div>
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
        {/* --- SECTION NOTIFIKASI & TUGAS --- */}
        <div className="mb-12 flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            
            {/* 1. STATUS VERIFIKASI (Muncul HANYA jika BELUM terverifikasi / status !== 'ok') */}
            {!isVerified && (
              <motion.div 
                key="verifikasi-alert"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <div className="bg-white rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-5 border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
                  {/* Accent line on the left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400 rounded-l-2xl"></div>
                  
                  {/* Icon Container */}
                  <div className="bg-amber-50 p-3.5 rounded-2xl text-amber-500 shrink-0 ml-2 md:ml-0">
                    <AlertCircle size={28} strokeWidth={2.5} />
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 ml-2 md:ml-0">
                    <h3 className="text-base font-bold text-slate-800 mb-1">Status Verifikasi Akun</h3>
                    <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
                      Akun Anda sedang dalam proses peninjauan. Anda tetap dapat memperbarui profil, namun akses ke fitur bursa kerja dan jejaring alumni akan dikunci hingga proses verifikasi selesai.
                    </p>
                  </div>
                  
                  {/* Action Button */}
                  <button 
                    onClick={() => setIsStatusOpen(true)} 
                    className="w-full md:w-auto mt-2 md:mt-0 bg-[#3C5759] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    LIHAT STATUS
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. TUGAS KUESIONER (Muncul HANYA jika SUDAH terverifikasi / status === 'ok') */}
            {isVerified && (
              <motion.div 
                key="kuesioner-alert"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
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
                  <button 
                    className="w-full md:w-auto mt-2 md:mt-0 bg-[#3C5759] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    ISI SEKARANG
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
        {/* --- END SECTION NOTIFIKASI --- */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-2xl font-black text-[#3C5759] tracking-tight">Jejaring Alumni Terbaru</h2>
               <p className="text-slate-400 text-sm font-medium mt-1 text-[#3C5759]">Saling terhubung dengan rekan satu almamater</p>
            </div>
            <button className="flex items-center gap-2 text-[12px] font-bold text-[#3C5759] bg-white border border-slate-200 px-5 py-2.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
              Lihat Semua <ArrowRight size={14}/>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DUMMY_ALUMNI.map((alumni) => <AlumniProfileCard key={alumni.id} data={alumni} />)}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-2xl font-black text-[#3C5759] tracking-tight">Lowongan Pekerjaan</h2>
               <p className="text-slate-400 text-sm font-medium mt-1 text-[#3C5759]">Peluang karir terbaik dari perusahaan mitra</p>
            </div>
            <button className="flex items-center gap-2 text-[12px] font-bold text-[#3C5759] bg-white border border-slate-200 px-5 py-2.5 rounded-full hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
              Lihat Semua <ArrowRight size={14}/>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {DUMMY_JOBS.map((job) => (
              <JobPosterCard 
                key={job.id} 
                data={job} 
                onImageClick={(img) => setSelectedImage(img)} 
              />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm overflow-hidden">
            <h2 className="text-xl font-black text-[#3C5759] tracking-tight mb-8">Top 5 Perusahaan Perekrut Alumni</h2>
            <div className="divide-y divide-slate-50">
              {DUMMY_COMPANIES.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between py-5 group hover:bg-slate-50/50 transition-all px-4 rounded-xl cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#3C5759] group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#3C5759]">{comp.name}</h3>
                      <p className="text-slate-400 text-[11px] font-medium">{comp.location}</p>
                    </div>
                  </div>
                  <div className="bg-slate-100/60 text-[#3C5759] px-5 py-2 rounded-xl border border-slate-100">
                    <span className="text-sm font-black">{comp.alumniCount} Alumni</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        <StatusPengajuanModal 
        isOpen={isStatusOpen} 
        onClose={() => setIsStatusOpen(false)} 
      />

        {/* Modal Pratinjau Gambar */}
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedImage(null)} 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                <img 
                  src={selectedImage} 
                  alt="Pratinjau Poster" 
                  className="max-w-full max-h-[85vh] object-contain"
                  onError={(e) => { e.target.src = "https://placehold.co/800x600?text=Poster+Not+Found"; }}
                />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#3C5759]">Pratinjau Poster Lowongan</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}