import React from 'react';
import { Megaphone, Pin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PengumumanSekolah({ announcements, loading, getImageUrl }) {
  const navigate = useNavigate();

  return (
    <section className="bg-white rounded-[2rem] lg:col-span-2 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      {/* Header: Judul & Tombol Lihat Semua */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#3c5759]">Pengumuman Sekolah</h2>
          <p className="text-sm text-[#9ca3af] mt-1 font-medium">
            Informasi terbaru seputar kegiatan dan agenda.
          </p>
        </div>
        
        {/* Tombol Lihat Semua */}
        <button
          onClick={() => navigate("/alumni/pengumuman")}
          className="group flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-full border transition-all bg-white text-[#3c5759] border-slate-200 hover:border-[#3c5759] cursor-pointer shrink-0"
        >
          Lihat Semua <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* List Pengumuman */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : announcements.length > 0 ? (
          announcements.slice(0, 2).map((ann) => {
            const annDate = ann.created_at
              ? new Date(ann.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
              : '-';
            const annImage = getImageUrl(ann.foto_thumbnail || ann.foto);

            return (
              <div 
                key={ann.id} 
                onClick={() => navigate(`/alumni/pengumuman/${ann.id}`)} // Opsional: jika mau cardnya bisa diklik ke detail
                className="group p-5 rounded-2xl border border-gray-100 hover:border-[#3c5759]/30 hover:bg-[#f3f4f4]/50 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {annImage && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={annImage} alt={ann.judul} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {ann.is_pinned && <Pin size={12} className="text-[#3c5759] fill-[#3c5759] flex-shrink-0" />}
                          <h3 className="text-base font-bold text-[#3c5759] group-hover:text-[#526061] line-clamp-1">
                            {ann.judul}
                          </h3>
                        </div>
                        <p className="text-sm text-[#526061] mt-1 line-clamp-2">
                          {ann.konten}
                        </p>
                      </div>
                      
                      {/* Badge Tanggal */}
                      <span className="shrink-0 px-3 py-1 bg-[#f3f4f4] text-[#526061] text-xs font-bold rounded-lg border border-gray-200 w-fit">
                        {annDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Megaphone size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-slate-400 text-sm">Belum ada pengumuman saat ini</p>
          </div>
        )}
      </div>
    </section>
  );
}