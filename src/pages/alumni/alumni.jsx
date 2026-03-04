import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Briefcase, 
  Building2,
  ArrowRight,
  X,
  GraduationCap,
  Rocket,
  LineChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';

// --- MOCK DATA ---
const ALUMNI_DATA = [
  { id: 1, name: 'Jane Doe', angkatan: '2019', role: 'Software Engineer', company: 'TechCorp Inc.', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=jane' },
  { id: 2, name: 'John Smith', angkatan: '2022', role: 'MBA Candidate', company: 'Harvard University', status: 'Kuliah', image: 'https://i.pravatar.cc/300?u=john' },
  { id: 3, name: 'Alice Johnson', angkatan: '2020', role: 'Founder & CEO', company: 'NextGen Solutions', status: 'Wirausaha', image: 'https://i.pravatar.cc/300?u=alice' },
  { id: 4, name: 'Bunga', angkatan: '2018', role: 'Product Manager', company: 'Innovate LLC', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=bob' },
  { id: 5, name: 'Charlie Davis', angkatan: '2021', role: 'Data Analyst', company: 'Mencari Pekerjaan', status: 'Mencari Pekerjaan', image: 'https://i.pravatar.cc/300?u=charlie' },
  { id: 6, name: 'Sarah Lee', angkatan: '2017', role: 'Product Designer', company: 'Creative Studio', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=sarah' },
  { id: 7, name: 'Adhyan Agung Elang', angkatan: '2023', role: 'Data Scientist', company: 'Tech Startup', status: 'Bekerja', image: 'https://i.pravatar.cc/300?u=adhyan' },
  { id: 8, name: 'A\'isy Salmaa P.', angkatan: '2022', role: 'Fresh Graduate', company: 'Universitas Brawijaya', status: 'Lulus', image: 'https://i.pravatar.cc/300?u=aisy' },
];

// Helper untuk ikon status
const getStatusIcon = (status) => {
  switch (status) {
    case 'Kuliah': return <GraduationCap size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />;
    case 'Wirausaha': return <Rocket size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />;
    case 'Mencari Pekerjaan': 
    case 'Mencari': return <LineChart size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />;
    case 'Bekerja': 
    default: return <Briefcase size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />;
  }
};

// --- OPSI DROPDOWN ---
const tahunOptions = ['Semua Tahun', '2023', '2022', '2021', '2020'];
const statusOptions = ['Semua Status', 'Bekerja', 'Kuliah', 'Wirausaha', 'Mencari Pekerjaan'];
const univOptions = ['Semua Universitas', 'Universitas Indonesia', 'Institut Teknologi Bandung', 'Universitas Gadjah Mada'];

export default function Alumni() {
  const { user: authUser } = useAuth();
  const user = { 
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto 
  };
  
  const navigate = useNavigate();
  const [selectedTahun, setSelectedTahun] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUniv, setSelectedUniv] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  
  // STATE UNTUK POPUP GAMBAR
  const [selectedImage, setSelectedImage] = useState(null);

  // Mengunci scroll layar saat gambar di-zoom
  useEffect(() => {
    document.body.style.overflow = selectedImage ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      <Navbar user={user} />

      {/* --- HEADER & FILTER SECTION --- */}
      {/* pb-8 untuk mempersempit jarak bagian bawah header */}
      <div className="relative pt-24 pb-8 w-full z-40">
        
        {/* GAMBAR BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/background3.jpeg" 
            alt="Background" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-white/50 md:bg-gradient-to-r md:from-white/80 md:via-white/60 md:to-white/20"></div>
          {/* h-16 diturunkan agar efek gradasinya tidak terlalu tebal ke atas */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#f8f9fa]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-[#3C5759] tracking-tight mb-2 uppercase">Direktori Alumni</h1>
            <p className="text-[#3C5759]/90 text-sm md:text-base max-w-2xl font-semibold drop-shadow-sm">
              Terhubung dengan para lulusan dan perluas jaringan profesional Anda.
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 relative">
            {/* Kolom Pencarian */}
            <div className="relative flex-1 group shadow-sm border border-[#3C5759]/10 rounded-2xl bg-white">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3C5759]/40 group-focus-within:text-[#3C5759] transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="cari berdasarkan nama, perusahaan, atau peran..." 
                className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20 focus:border-transparent transition-all h-[52px] text-[#3C5759] placeholder:text-[#3C5759]/40"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <div className="w-44 bg-white rounded-2xl shadow-sm border border-[#3C5759]/10">
                <SmoothDropdown options={tahunOptions} value={selectedTahun} onSelect={(val) => setSelectedTahun(val === 'Semua Tahun' ? '' : val)} placeholder="Tahun Kelulusan" />
              </div>
              <div className="w-48 bg-white rounded-2xl shadow-sm border border-[#3C5759]/10">
                <SmoothDropdown options={statusOptions} value={selectedStatus} onSelect={(val) => setSelectedStatus(val === 'Semua Status' ? '' : val)} placeholder="Status Pekerjaan" />
              </div>
              <div className="w-52 bg-white rounded-2xl shadow-sm border border-[#3C5759]/10">
                <SmoothDropdown options={univOptions} value={selectedUniv} onSelect={(val) => setSelectedUniv(val === 'Semua Universitas' ? '' : val)} placeholder="Universitas" isSearchable={true} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (CARD AREA) --- */}
      {/* -mt-2 agar jarak filter & card super rapat/pas */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-4 relative z-20 flex flex-col pb-12">
        
        {/* ALUMNI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ALUMNI_DATA.map((alumni) => {
            return (
              <motion.div 
                whileHover={{ y: -8 }}
                key={alumni.id} 
                className="bg-white rounded-3xl flex flex-col overflow-hidden border border-[#3C5759]/5 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                {/* AREA GAMBAR */}
                <div 
                  className="h-56 w-full bg-white relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    if (alumni.image) setSelectedImage(alumni.image);
                  }}
                >
                  {alumni.image ? (
                    <img src={alumni.image} alt={alumni.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-[#3C5759]/20 bg-[#3C5759]/5">
                      {alumni.name.charAt(0)}
                    </div>
                  )}

                  {/* Efek Gelombang Bawah (Fix Bug Garis Hitam dengan w-[102%] & translate-y-[1px]) */}
                  <svg 
                    className="absolute bottom-0 left-0 w-[102%] -translate-x-[1%] h-10 z-20 translate-y-[1px]" 
                    viewBox="0 0 1440 100" 
                    preserveAspectRatio="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      fill="#ffffff" 
                      d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
                    ></path>
                  </svg>
                </div>

                {/* AREA KONTEN BAWAH (Semuanya bg-white murni) */}
                <div className="p-6 pt-1 flex-1 flex flex-col relative z-20 bg-white">
                  <div className="mb-5 text-center">
                    <h3 className="font-black text-[#3C5759] text-xl leading-tight line-clamp-1">{alumni.name}</h3>
                    <p className="text-[11px] font-bold text-[#3C5759]/40 mt-1 uppercase tracking-widest">Angkatan {alumni.angkatan}</p>
                  </div>

                  {/* Penjelasan Detail (Semua Style Teks Sama & Rata Kiri) */}
                  <div className="space-y-3 mb-6 px-1">
                    <div className="flex items-start gap-3 text-[#3C5759]/80">
                      <Briefcase size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold line-clamp-2">{alumni.role}</p>
                    </div>
                    <div className="flex items-start gap-3 text-[#3C5759]/80">
                      <Building2 size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold line-clamp-2">{alumni.company}</p>
                    </div>
                    {/* Status (Bekerja, Kuliah) sekarang sama dengan role & company */}
                    <div className="flex items-start gap-3 text-[#3C5759]/80">
                      {getStatusIcon(alumni.status)}
                      <p className="text-sm font-semibold line-clamp-2">{alumni.status}</p>
                    </div>
                  </div>

                  {/* Tombol Lihat Profil (Hanya warna teks hijau, dipojok kanan bawah) */}
                  <div className="mt-auto pt-4 border-t border-[#3C5759]/10 flex items-center justify-end">
                    <button 
                      onClick={() => navigate(`/alumni/${alumni.id}`)}
                      className="flex items-center gap-1.5 text-[13px] font-bold text-[#3C5759] hover:text-[#2A3E3F] hover:underline transition-all cursor-pointer"
                    >
                      Lihat Profil <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- PAGINATION --- */}
        <div className="mt-12 mb-4 bg-white rounded-xl shadow-sm border border-[#3C5759]/10 overflow-hidden">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
      
      <Footer />

      {/* --- MODAL POPUP PREVIEW GAMBAR --- */}
      <AnimatePresence>
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
              className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                <img 
                  src={selectedImage} 
                  alt="Pratinjau Foto Alumni" 
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Photo+Not+Found"; }}
                />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#3C5759]">Pratinjau Foto Profil</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}