import React from 'react';
import { Star, X } from 'lucide-react';
import { alertConfirm } from '../../../utilitis/alert';

export default function FeaturedAlumniList({ featuredAlumni, onRemoveFeatured, STORAGE_BASE_URL }) {
  if (!featuredAlumni || featuredAlumni.length === 0) {
    return null; // Sembunyikan jika tidak ada alumni yang disorot
  }

  // BATASI MAKSIMAL 4 ALUMNI SAJA
  const displayAlumni = featuredAlumni.slice(0, 4);

  const handleRemove = async (alumni) => {
    const alumniName = alumni.nama || alumni.name || 'Alumni';
    const { isConfirmed } = await alertConfirm(`Hapus "${alumniName}" dari sorotan Beranda?`);
    if (isConfirmed) {
      onRemoveFeatured(alumni.id);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm transition-all w-full">
      <div className="flex items-center justify-between mb-4 border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2">
          <Star className="text-amber-500 fill-amber-500" size={20} />
          <h3 className="font-bold text-amber-900 text-sm sm:text-base">Alumni Pilihan (Beranda)</h3>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full ml-2">
            {displayAlumni.length} / 4 Disorot
          </span>
        </div>
      </div>

      {/* MENGGUNAKAN GRID AGAR SEJAJAR RAPI MAKSIMAL 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayAlumni.map((alumni) => (
          <div 
            key={alumni.id} 
            className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-100 shadow-sm relative group w-full"
          >
            {/* Tombol Hapus (Muncul saat di-hover) */}
            <button 
              onClick={() => handleRemove(alumni)}
              className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shadow-sm cursor-pointer"
              title="Hapus dari sorotan"
            >
              <X size={12} />
            </button>

            {/* Foto Profile */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              <img 
                src={getImageUrl(alumni.foto_thumbnail || alumni.foto) || `https://ui-avatars.com/api/?name=${alumni.nama || alumni.name || 'A'}&background=fcd34d&color=78350f`} 
                alt={alumni.nama || alumni.name || 'Alumni'}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${alumni.nama || alumni.name || 'A'}&background=fcd34d&color=78350f`; }}
              />
            </div>

            {/* Info Singkat */}
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-800 truncate">{alumni.nama || alumni.name || 'Alumni'}</span>
              <span className="text-[10px] text-slate-500 truncate">{alumni.jurusan?.nama_jurusan || alumni.jurusan?.nama || alumni.pekerjaan || 'Alumni'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}