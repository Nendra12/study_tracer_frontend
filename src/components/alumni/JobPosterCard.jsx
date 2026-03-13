import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, MoveUpRight } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';
import LockOverlay from './LockOverlay';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function JobPosterCard({ data, onImageClick, locked }) {
  if (!data) return null;

  const fotoUrl = getImageUrl(data.foto || data.foto_lowongan || data.banner) || 'https://i.pinimg.com/736x/13/40/11/1340118d98bb8e13d0fc55fa303a13ab.jpg'; // Menggunakan fallback default CareerSection
  
  // Penyesuaian variabel data
  const judul = data.judul || data.role || data.judul_lowongan || '—';
  const perusahaanNama = data.perusahaan?.nama || data.perusahaan?.nama_perusahaan || data.company || '—';
  const tipePekerjaan = data.tipe_pekerjaan || data.type || 'Full-time';
  const deskripsi = data.deskripsi || data.description || 'Tidak ada deskripsi tersedia.';
  
  const lokasi = data.perusahaan?.kota
    ? `${data.perusahaan.kota.nama}${data.perusahaan.kota.provinsi ? ', ' + data.perusahaan.kota.provinsi.nama : ''}`
    : (data.lokasi || data.location || '—');

  return (
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''} h-full`}>
      <motion.div
        whileHover={locked ? {} : { y: -4 }}
        className={`bg-white rounded-[2rem] overflow-hidden border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col h-full transition-all duration-500
          ${locked ? '' : 'hover:shadow-[0_20px_50px_rgba(60,87,89,0.1)] group cursor-pointer'}`}
      >
        
        {/* BAGIAN ATAS: Job Banner (Bisa diklik untuk preview) */}
        <div 
          className="h-60 w-full overflow-hidden relative"
          onClick={(e) => {
            if (locked || !onImageClick) return;
            e.stopPropagation(); // Mencegah klik menyebar ke Link Detail jika dibungkus
            onImageClick(fotoUrl, e);
          }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
          <img
            src={fotoUrl}
            alt={judul}
            className={`w-full h-full object-cover ${locked ? '' : 'transform group-hover:scale-105 transition-transform duration-700'}`}
            onError={(e) => { e.target.src = 'https://i.pinimg.com/736x/13/40/11/1340118d98bb8e13d0fc55fa303a13ab.jpg'; }}
          />
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-[#3c5759] uppercase">
              {tipePekerjaan}
            </span>
          </div>
        </div>

        {/* BAGIAN TENGAH: Job Content */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#3c5759] leading-tight mb-1 group-hover:text-amber-600 transition-colors">
              {judul}
            </h3>
            <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider">
              {perusahaanNama}
            </p>
          </div>

          <p className="text-sm text-[#526061] leading-relaxed mb-6 line-clamp-2">
            {deskripsi}
          </p>

          {/* BAGIAN BAWAH: Footer Card (Lokasi & Tombol Panah) */}
          <div className="mt-auto pt-4 border-t border-[#f3f4f4] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#9ca3af]">
              <MapPin size={16} />
              <span className="text-xs font-bold line-clamp-1 max-w-[150px]">{lokasi}</span>
            </div>
            
            <button className={`w-8 h-8 rounded-full flex items-center justify-center transition-all 
              ${locked ? 'bg-slate-100 text-slate-400' : 'bg-[#f3f4f4] text-[#3c5759] group-hover:bg-[#3c5759] group-hover:text-white'}`}
            >
              <MoveUpRight size={15} />
            </button>
          </div>
        </div>

      </motion.div>

      {/* OVERLAY KUNCI */}
      {locked && <LockOverlay message="Verifikasi & isi kuesioner untuk akses" />}
    </div>
  );
}