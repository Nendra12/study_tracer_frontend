import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Megaphone, Pin, X } from 'lucide-react'; // Tambahkan icon X

// 1. IMPORT GAMBAR LOKAL
import imgPengumuman from '../../assets/pengumuman.jpg';

// --- DATA DUMMY SEMENTARA ---
const DUMMY_PENGUMUMAN = [
  {
    id: 1,
    judul: "Pembaruan Sistem Tracer Study 2024",
    konten: "Diberitahukan kepada seluruh alumni bahwa sistem Tracer Study akan mengalami pemeliharaan rutin pada tanggal 15 Agustus 2024.\n\nSelama proses ini, portal tidak dapat diakses selama 2 jam. Pemeliharaan ini bertujuan untuk meningkatkan keamanan data dan mempercepat proses pembuatan laporan.\n\nMohon maaf atas ketidaknyamanan yang ditimbulkan. Terima kasih atas pengertiannya.",
    tanggal_dibuat: "2024-08-10",
    status: "aktif",
    is_pinned: true,
    foto: imgPengumuman // Menggunakan gambar lokal
  },
  {
    id: 2,
    judul: "Undangan Job Fair Kampus 2024",
    konten: "Kampus akan mengadakan Job Fair tahunan yang dihadiri oleh lebih dari 50 perusahaan nasional dan multinasional.\n\nAcara akan diselenggarakan di Gedung Serbaguna Utama pada tanggal 20-22 Agustus 2024. Jangan lupa untuk membawa CV terbaik Anda dan berpakaian rapi.",
    tanggal_dibuat: "2024-08-05",
    status: "aktif",
    is_pinned: false,
    foto: imgPengumuman // Menggunakan gambar lokal
  }
];

export default function PengumumanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State untuk pop-up gambar
  const [showImageModal, setShowImageModal] = useState(false);

  // Jadikan gambar lokal sebagai fallback jika foto kosong
  const defaultImage = imgPengumuman;

  useEffect(() => {
    // Simulasi Fetch Data API berdasarkan ID
    setLoading(true);
    setTimeout(() => {
      const found = DUMMY_PENGUMUMAN.find(p => p.id.toString() === id);
      
      if (found) {
        setData(found);
      } else {
        setData({
          id: id,
          judul: "Pengumuman Baru (Simulasi Data)",
          konten: "Ini adalah simulasi detail untuk pengumuman yang baru saja ditambahkan secara lokal. Saat API sudah dihubungkan, data aslinya akan muncul di sini.",
          tanggal_dibuat: new Date().toISOString().split('T')[0],
          status: "aktif",
          is_pinned: false,
          foto: null
        });
      }
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-gray-500 font-bold">Pengumuman tidak ditemukan.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate(-1)} 
          className="group cursor-pointer flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-bold text-sm bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200 hover:shadow-md w-fit hover:-translate-x-1"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> 
          Kembali ke Daftar Pengumuman
        </button>

        {/* Card Detail Utama */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Banner Image (Bisa di-klik untuk Pop-up) */}
          <div 
            className="w-full h-56 md:h-80 bg-slate-100 relative group cursor-pointer"
            onClick={() => setShowImageModal(true)}
          >
            <img 
              src={data.foto || defaultImage} 
              alt={data.judul} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay gradien & efek gelap saat di-hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:bg-black/10 transition-colors duration-300"></div>

            {/* Status Floating Badge */}
            <div className="absolute top-5 right-5 flex gap-2">
              {data.is_pinned && (
                <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-primary shadow-lg flex items-center gap-1.5">
                  <Pin size={12} className="fill-primary" /> Disematkan
                </span>
              )}
              <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg backdrop-blur ${
                data.status === 'aktif' ? 'bg-green-500/90 text-white' : 
                data.status === 'draft' ? 'bg-slate-500/90 text-white' : 'bg-red-500/90 text-white'
              }`}>
                {data.status}
              </span>
            </div>
          </div>

          {/* Konten Text */}
          <div className="p-6 md:p-10">
            {/* Header Judul */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
              <div className="p-3 rounded-2xl text-primary bg-blue-50 flex-shrink-0 shadow-sm border border-blue-100/50 w-fit">
                <Megaphone size={24} />
              </div>
              <div className="pt-1">
                {/* Ukuran Teks Judul Diperkecil */}
                <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-3">
                  {data.judul}
                </h1>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                  <Calendar size={14} /> 
                  <span>Dipublikasikan pada {data.tanggal_dibuat}</span>
                </div>
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            {/* Teks Konten (Ukuran diperkecil ke standar teks paragraf) */}
            <div className="prose max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-[15px]">
                {data.konten}
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* RENDER MODAL GAMBAR SAJA (POP-UP LIGHTBOX) */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
          onClick={() => setShowImageModal(false)} // Klik area gelap (background) untuk menutup
        >
          <div 
            className="relative flex justify-center items-center max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Hindari tertutup kalau gambarnya sendiri yang diklik
          >
            {/* Tombol Close Mengambang di atas gambar */}
            <button 
              onClick={() => setShowImageModal(false)} 
              className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-black/60 border border-white/20 text-white p-2 rounded-full hover:bg-black/90 transition-all cursor-pointer shadow-xl z-10"
            >
              <X size={20} />
            </button>
            
            {/* Tampilan Gambar Full */}
            <img 
              src={data.foto || defaultImage} 
              alt={data.judul} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}