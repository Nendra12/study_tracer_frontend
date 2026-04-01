import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Megaphone, Pin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { PengumumanDetailSkeleton } from '../../components/alumni/skeleton'; 

export default function PengumumanDetailAlumni() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pop-up gambar
  const [showImageModal, setShowImageModal] = useState(false);

  // Helper untuk Gambar
  const getImageUrl = (path) => {
    if (!path) return imgPengumuman; // Fallback ke gambar lokal
    if (path.startsWith("http")) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Ambil data dari API
        const res = await alumniApi.getPengumumanDetail(id);
        const responseData = res.data?.data || res.data;
        setData(responseData);
      } catch (err) {
        console.error("Gagal memuat detail:", err);
        // --- FALLBACK DUMMY DATA SEMENTARA JIKA API BELUM SIAP ---
        // Jika API error (misal 404), kita tampilkan data dummy agar UI tetap bisa dilihat
        setData({
          id: id,
          judul: "Pengumuman Sekolah (Simulasi Data)",
          konten: "Ini adalah simulasi detail untuk pengumuman. Saat API sudah dihubungkan dan berfungsi dengan baik, data aslinya akan muncul di sini.\n\nPastikan Anda selalu mengecek halaman ini untuk informasi terbaru dari almamater tercinta.",
          created_at: new Date().toISOString(),
          status: "aktif",
          is_pinned: false,
          foto: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return <PengumumanDetailSkeleton />;
  }
  
  if (!data) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center py-20 text-slate-500 font-bold">
          Pengumuman tidak ditemukan.
          <br/>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#425A5C] hover:underline">Kembali</button>
        </div>
      </div>
    );
  }

  const annDate = data.created_at || data.tanggal_dibuat
    ? new Date(data.created_at || data.tanggal_dibuat).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 pt-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate('/alumni/pengumuman')} 
          className="group cursor-pointer flex items-center gap-2 text-slate-500 hover:text-[#425A5C] transition-all font-bold text-sm bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 hover:shadow-md w-fit hover:-translate-x-1"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
          Kembali ke Daftar Pengumuman
        </button>

        {/* Card Detail Utama */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Banner Image (Bisa di-klik untuk Pop-up) */}
          <div 
            className="w-full h-56 md:h-80 bg-slate-100 relative group cursor-pointer overflow-hidden"
            onClick={() => setShowImageModal(true)}
          >
            <img 
              src={getImageUrl(data.foto || data.foto_thumbnail)} 
              alt={data.judul} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay gradien & efek gelap saat di-hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:bg-black/10 transition-colors duration-300"></div>

            {/* Hint Klik Gambar */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="bg-black/50 text-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider">
                Lihat Gambar Penuh
              </span>
            </div>

            {/* Status Floating Badge */}
            <div className="absolute top-5 right-5 flex gap-2">
              {data.is_pinned && (
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur text-[#425A5C] shadow-lg flex items-center gap-1.5">
                  <Pin size={12} className="fill-[#425A5C]" /> Disematkan
                </span>
              )}
            </div>
          </div>

          {/* Konten Text */}
          <div className="p-6 md:p-10">
            {/* Header Judul */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl text-[#425A5C] bg-[#425A5C]/10 flex-shrink-0 shadow-sm w-fit">
                <Megaphone size={24} />
              </div>
              <div className="pt-1">
                {/* Ukuran Teks Judul Diperkecil tapi tetap tebal */}
                <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-3">
                  {data.judul}
                </h1>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                  <Calendar size={14} className="text-[#425A5C]" /> 
                  <span>Dipublikasikan pada {annDate}</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            {/* Teks Konten */}
            <div className="prose max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-[15px]">
                {data.konten}
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* --- RENDER MODAL GAMBAR (POP-UP LIGHTBOX) --- */}
      <AnimatePresence>
        {showImageModal && (
          <div 
            className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative flex justify-center items-center max-w-4xl max-h-[90vh] w-full rounded-2xl"
              onClick={(e) => e.stopPropagation()} 
            >
              {/* Tombol Close Mengambang */}
              <button 
                onClick={() => setShowImageModal(false)} 
                className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-black/60 border border-white/20 text-white p-2 rounded-full hover:bg-black/90 transition-all cursor-pointer shadow-xl z-10 backdrop-blur-md"
              >
                <X size={20} />
              </button>
              
              {/* Tampilan Gambar Full */}
              <div className="relative overflow-hidden flex items-center justify-center rounded-2xl w-full">
                <img 
                  src={getImageUrl(data.foto || data.foto_thumbnail)} 
                  alt={data.judul} 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}