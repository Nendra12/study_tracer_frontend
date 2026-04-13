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
  
  // State Management
  const [data, setData] = useState(null);
  const [otherAnnouncements, setOtherAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

  // Helper untuk Gambar
  const getImageUrl = (path) => {
    // Jika tidak ada gambar, kembalikan string kosong atau path ke gambar default lokal Anda
    if (!path) return ''; 
    if (path.startsWith("http")) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Memastikan halaman kembali ke atas setiap kali ID berubah
      window.scrollTo(0, 0); 
      
      try {
        // 1. Ambil data detail pengumuman utama
        const resDetail = await alumniApi.getPengumumanDetail(id);
        const responseData = resDetail.data?.data || resDetail.data;
        setData(responseData);

        // 2. Ambil daftar pengumuman untuk sidebar kanan
        try {
          // Tambahkan argumen parameter seperti di Beranda agar tidak mengambil seluruh data
          const resList = await alumniApi.getPengumuman({ per_page: 5, status: 'aktif' });
          const responseData = resList.data?.data;
          
          // Tangani kemungkinan response pagination Laravel atau response langsung array
          const items = responseData?.data || (Array.isArray(responseData) ? responseData : []);
          
          // Filter pengumuman yang sedang dibuka, lalu batasi maksimal 4
          const filteredOthers = items
            .filter((item) => String(item.id) !== String(id))
            .slice(0, 4);
            
          setOtherAnnouncements(filteredOthers);
        } catch (errList) {
          console.error("Gagal memuat daftar pengumuman lainnya:", errList);
          // Fallback dummy data jika API list error/belum siap
          // setOtherAnnouncements([
          //   { id: '101', judul: 'Jadwal Reuni Akbar Angkatan 2020', created_at: new Date().toISOString() },
          //   { id: '102', judul: 'Lowongan Pekerjaan Khusus Alumni Jurusan IPA', created_at: new Date().toISOString() },
          // ]);
        }

      } catch (err) {
        console.error("Gagal memuat detail:", err);
        // // Fallback dummy data detail jika API error
        // setData({
        //   id: id,
        //   judul: "Pengumuman Sekolah (Simulasi Data)",
        //   konten: "Ini adalah simulasi detail untuk pengumuman. Saat API sudah dihubungkan dan berfungsi dengan baik, data aslinya akan muncul di sini.\n\nPastikan Anda selalu mengecek halaman ini untuk informasi terbaru dari almamater tercinta.",
        //   created_at: new Date().toISOString(),
        //   status: "aktif",
        //   is_pinned: false,
        //   foto: null
        // });
        setOtherAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <PengumumanDetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-center py-20 text-slate-500 font-bold">
          Pengumuman tidak ditemukan.
          <br />
          <button onClick={() => navigate(-1)} className="mt-4 text-[#425A5C] hover:underline">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // Format Tanggal
  const annDate = data.created_at || data.tanggal_dibuat
    ? new Date(data.created_at || data.tanggal_dibuat).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 pt-28 px-4 sm:px-6">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Tombol Kembali */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/alumni/pengumuman')}
            className="group cursor-pointer flex items-center gap-2 text-slate-500 hover:text-[#425A5C] transition-all font-bold text-sm bg-white px-5 py-2.5 rounded-md shadow-sm border border-slate-200 hover:shadow-md w-fit hover:-translate-x-1"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Kembali ke Daftar Pengumuman
          </button>
        </div>

        {/* --- GRID LAYOUT UTAMA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* KOLOM KIRI (Konten Utama) */}
          <div className={otherAnnouncements.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
            <div className="bg-white rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              
              {/* Gambar Banner */}
              <div
                className="w-full h-56 md:h-[400px] bg-slate-100 relative group cursor-pointer overflow-hidden"
                onClick={() => setShowImageModal(true)}
              >
                <img
                  src={getImageUrl(data.foto || data.foto_thumbnail)}
                  alt={data.judul}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Tidak+Ada+Gambar'; // Fallback jika gambar rusak
                  }}
                />
                {/* Efek Hover Gambar */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent group-hover:bg-black/10 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="bg-black/50 text-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold tracking-wider">
                    Lihat Gambar Penuh
                  </span>
                </div>

                {/* Badge Pin */}
                <div className="absolute top-5 right-5 flex gap-2">
                  {data.is_pinned && (
                    <span className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 backdrop-blur text-[#425A5C] shadow-lg flex items-center gap-1.5">
                      <Pin size={12} className="fill-[#425A5C]" /> Disematkan
                    </span>
                  )}
                </div>
              </div>

              {/* Isi Konten */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                  <div className="p-3 rounded-2xl text-[#425A5C] bg-[#425A5C]/10 flex-shrink-0 shadow-sm w-fit">
                    <Megaphone size={24} />
                  </div>
                  <div className="pt-1">
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

                <div className="prose max-w-none">
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-[15px]" dangerouslySetInnerHTML={{ __html: data.konten }} />
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (Sidebar Daftar Pengumuman - Lebar 1/3) */}
          {otherAnnouncements.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-md shadow-sm border border-slate-100 p-5 sticky top-28">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Megaphone size={18} className="text-[#425A5C]" />
                  Pengumuman Lainnya
                </h3>
                
                <div className="space-y-4">
                  {otherAnnouncements.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => navigate(`/alumni/pengumuman/${item.id}`)}
                      className="group cursor-pointer flex gap-3 border border-transparent hover:border-slate-200 hover:bg-slate-50 p-2.5 rounded-lg transition-all"
                    >
                      <div className="w-16 h-16 shrink-0 rounded-md bg-slate-100 overflow-hidden relative">
                        {getImageUrl(item.foto || item.foto_thumbnail) ? (
                          <img
                            src={getImageUrl(item.foto || item.foto_thumbnail)}
                            alt={item.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/150x150?text=No+Img';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-200/50">
                            <Megaphone size={20} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-semibold text-sm text-slate-700 group-hover:text-[#425A5C] transition-colors line-clamp-2 mb-1.5 leading-snug">
                          {item.judul}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Calendar size={12} />
                          <span>
                            {new Date(item.created_at || item.tanggal_dibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL / POP-UP GAMBAR LENGKAP */}
      <AnimatePresence>
        {showImageModal && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
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
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-black/60 border border-white/20 text-white p-2 rounded-full hover:bg-black/90 transition-all cursor-pointer shadow-xl z-10 backdrop-blur-md"
              >
                <X size={20} />
              </button>

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