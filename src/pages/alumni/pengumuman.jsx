import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertCircle, Megaphone, Calendar, Pin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Komponen
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import { AlumniSkeleton } from '../../components/alumni/skeleton'; // Menggunakan skeleton yang sama untuk konsistensi sementara

// Konfigurasi & API
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';

// Ganti dengan ilustrasi SVG kamu jika ada (contoh: announcement.svg)
// import AnnouncementImg from '../../assets/svg/announcement.svg';

export default function PengumumanAlumni() {
  const navigate = useNavigate();

  // State Data
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWaktu, setSelectedWaktu] = useState('Terbaru');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State Modal (Image Preview)
  const [selectedImage, setSelectedImage] = useState(null);

  // Opsi Dropdown
  const waktuOptions = ['Terbaru', 'Terlama'];

  // Fungsi Fetch Data
  const fetchPengumuman = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Parameter request (Hanya ambil yang statusnya aktif untuk alumni)
      const params = { page, per_page: 8, status: 'aktif' };
      
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedWaktu) params.sort = selectedWaktu === 'Terbaru' ? 'desc' : 'asc';

      const res = await alumniApi.getPengumuman(params);
      const responseData = res.data?.data;

      if (responseData?.data) {
        setPengumuman(responseData.data);
        setTotalPages(responseData.last_page || 1);
        setCurrentPage(responseData.current_page || 1);
      } else if (Array.isArray(responseData)) {
        setPengumuman(responseData);
        setTotalPages(1);
      } else {
        setPengumuman([]);
      }
    } catch (err) {
      console.error('Failed to load pengumuman:', err);
      setError(err.response?.data?.message || 'Gagal memuat data pengumuman');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedWaktu]);

  // Efek memuat data saat filter berubah
  useEffect(() => {
    fetchPengumuman(1);
  }, [fetchPengumuman]);

  // Kunci scroll saat modal gambar terbuka
  useEffect(() => {
    document.body.style.overflow = selectedImage ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  // Handler Pencarian
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPengumuman(1);
  };

  // Helper Foto
  const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/800x600?text=Pengumuman'; // Placeholder default
    if (path.startsWith("http")) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  };

  return (
    <div className='w-full min-h-screen bg-[#f8f9fa] flex flex-col font-sans selection:bg-primary/20 overflow-x-hidden'>
      
      {/* --- HEADER SECTION --- */}
      <section className="relative pt-30 pb-24 w-full z-30 bg-primary rounded-b-[2.5rem]">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
              Pengumuman Sekolah
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Informasi terbaru seputar kegiatan, agenda, berita, dan kebijakan dari almamater tercinta. 
              Jangan lewatkan informasi penting di sini.
            </p>
          </div>

          {/* Elemen Dekoratif Kanan (Gunakan SVG/Icon jika ada) */}
          <div className="hidden lg:flex items-center justify-center opacity-80">
             {/* Jika punya gambar SVG untuk pengumuman, letakkan di sini. Sementara pakai icon besar */}
             <Megaphone size={120} className="text-white/20 -rotate-12" strokeWidth={1} />
          </div>

        </div>
      </section>

      {/* --- FLOATING FILTER & SEARCH SECTION --- */}
      <section className="relative z-40 max-w-7xl mx-auto px-6 lg:px-12 -mt-10 mb-8 w-full">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100">
          
          <div className="flex flex-col lg:flex-row lg:items-start gap-3 w-full">
            
            {/* FORM PENCARIAN (Ditambahkan mt-3 agar sejajar dengan dropdown) */}
            <form 
              onSubmit={handleSearch} 
              className="mt-3 flex h-11.75 w-full lg:flex-1 border-2 border-gray-100 rounded-xl bg-white overflow-hidden transition-all focus-within:border-gray-200"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari judul atau isi pengumuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-10 pr-4 bg-transparent text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary text-white px-6 md:px-8 h-full font-bold text-sm hover:bg-[#2e4042] transition-colors cursor-pointer border-l-2 border-gray-100"
              >
                Cari
              </button>
            </form>

            {/* DROPDOWN FILTER */}
            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
              <div className="w-full lg:w-48 relative z-50">
                <SmoothDropdown 
                  options={waktuOptions} 
                  value={selectedWaktu} 
                  onSelect={(val) => setSelectedWaktu(val)} 
                  placeholder="Urutkan Berdasarkan" 
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- MAIN CONTENT (CARD AREA) --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-20 flex flex-col pb-12">
        {loading ? (
           // Sementara meminjam skeleton alumni, atau buat PengumumanSkeleton khusus nantinya
          <AlumniSkeleton /> 
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button onClick={() => fetchPengumuman(currentPage)} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#2e4042] transition-colors">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : pengumuman.length === 0 ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="text-center">
              <Megaphone size={56} className="text-slate-300 mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-black text-primary mb-2">Tidak Ada Pengumuman</h2>
              <p className="text-slate-500 text-sm font-medium">Belum ada pengumuman atau coba ubah kata kunci pencarian Anda.</p>
            </div>
          </div>
        ) : (
          <>
            {/* PENGUMUMAN CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pengumuman.map((item) => {
                const annDate = item.created_at || item.tanggal_dibuat
                  ? new Date(item.created_at || item.tanggal_dibuat).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                  : '-';
                  
                return (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/alumni/pengumuman/${item.id}`)}
                    className={`bg-white rounded-2xl border ${item.is_pinned ? 'border-primary/30 bg-primary/5' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col group`}
                  >
                    {/* Area Gambar (Klik untuk Zoom) */}
                    <div 
                      className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0"
                      onClick={(e) => { 
                        e.stopPropagation(); // Mencegah pindah halaman saat gambar diklik
                        setSelectedImage(getImageUrl(item.foto)); 
                      }}
                    >
                      <img 
                        src={getImageUrl(item.foto)} 
                        alt={item.judul} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Pengumuman'; }}
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                      
                      {item.is_pinned && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-primary px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Pin size={12} className="fill-primary" /> Disematkan
                        </div>
                      )}
                    </div>

                    {/* Area Teks (Klik untuk Detail) */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-2.5">
                        <Calendar size={14} className="text-primary" />
                        <span>{annDate}</span>
                      </div>
                      
                      <h3 className="font-bold text-slate-800 text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.judul}
                      </h3>
                      
                      <div className="text-sm text-slate-500 line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.konten }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="mt-12 mb-4 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    fetchPengumuman(page);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODAL POPUP PREVIEW GAMBAR --- */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100 min-h-75">
                <img
                  src={selectedImage}
                  alt="Pratinjau Pengumuman"
                  className="max-w-full max-h-[85vh] object-contain"
                  onError={(e) => { e.target.src = "https://placehold.co/800x600?text=Gambar+Tidak+Ditemukan"; }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2.5 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md border border-white/20"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}