import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Megaphone, Pin, X, Loader2, AlertCircle } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { STORAGE_BASE_URL } from '../../api/axios';
import PengumumanDetailSkeleton from '../../components/admin/skeleton/PengumumanDetailSkeleton';

// Fallback gambar lokal
import imgPengumuman from '../../assets/pengumuman.jpg';

// Helper untuk URL gambar
const getImageUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  return `${STORAGE_BASE_URL}/${foto}`;
};

export default function PengumumanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk pop-up gambar
  const [showImageModal, setShowImageModal] = useState(false);

  const defaultImage = imgPengumuman;

  useEffect(() => {
    let cancelled = false;
    
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const response = await adminApi.getPengumumanDetail(id);
        if (!cancelled) {
          setData(response.data?.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch pengumuman detail:", err);
          setError(err.response?.data?.message || "Gagal memuat detail pengumuman");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <PengumumanDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Gagal Memuat Data</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-gray-500 font-bold">Pengumuman tidak ditemukan.</div>;

  const imageUrl = getImageUrl(data.foto) || defaultImage;
  const displayDate = data.created_at 
    ? new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : '-';

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
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden">
          
          {/* Banner Image (Bisa di-klik untuk Pop-up) */}
          <div 
            className="w-full h-56 md:h-80 bg-slate-100 relative group cursor-pointer"
            onClick={() => setShowImageModal(true)}
          >
            <img 
              src={imageUrl} 
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
                <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-tight mb-3">
                  {data.judul}
                </h1>
                <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
                  <Calendar size={14} /> 
                  <span>Dipublikasikan pada {displayDate}</span>
                </div>
                {data.posted_by && (
                  <div className="flex items-center gap-2 text-[12px] text-slate-400 font-medium mt-1">
                    <span>Oleh: {data.posted_by.email}</span>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            {/* Teks Konten */}
            <div className="prose max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-[15px]" dangerouslySetInnerHTML={{ __html: data.konten }} />
        
            </div>
          </div>
          
        </div>
      </div>

      {/* RENDER MODAL GAMBAR SAJA (POP-UP LIGHTBOX) */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="relative flex justify-center items-center max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
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
              src={imageUrl} 
              alt={data.judul} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}