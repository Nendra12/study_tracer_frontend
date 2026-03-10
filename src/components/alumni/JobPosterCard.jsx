import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';
import LockOverlay from './LockOverlay';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function JobPosterCard({ data, onImageClick, locked }) {
  if (!data) return null;

  const fotoUrl = getImageUrl(data.foto);
  
  // Penyesuaian variabel data
  const judul = data.judul || data.role || '—';
  const perusahaanNama = data.perusahaan?.nama || data.company || '—';
  const tipePekerjaan = data.tipe_pekerjaan || data.type || '—';
  
  const lokasi = data.perusahaan?.kota
    ? `${data.perusahaan.kota.nama}${data.perusahaan.kota.provinsi ? ', ' + data.perusahaan.kota.provinsi.nama : ''}`
    : (data.lokasi || '—');

  return (
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''} h-full`}>
      <motion.div
        whileHover={locked ? {} : { y: -4 }}
        className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full transition-all duration-300
          ${locked ? '' : 'hover:shadow-md hover:border-[#3c5759]/20'}`}
      >
        {/* BAGIAN ATAS: Foto Poster & Judul (Sejajar) */}
        <div className="flex items-center gap-3 mb-5 relative">
          {/* Thumbnail Gambar (Menggantikan Logo Icon) */}
          <div 
            className={`w-[60px] h-[60px] shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden ${locked ? '' : 'cursor-pointer group'}`}
            onClick={(e) => {
              if (locked || !onImageClick) return;
              e.stopPropagation();
              onImageClick(fotoUrl || '/Desain Poster Job.jpg', e);
            }}
          >
            <img 
              src={fotoUrl || '/Desain Poster Job.jpg'} 
              alt="Thumbnail Poster" 
              className={`w-full h-full object-cover ${locked ? '' : 'transition-transform duration-300 group-hover:scale-110'}`}
              onError={(e) => { e.target.src = 'https://placehold.co/150?text=No+Img'; }}
            />
          </div>

          {/* Teks Judul & Perusahaan */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-[#3c5759] text-[16px] leading-tight line-clamp-2 mb-1">
              {judul}
            </h3>
            <p className="text-xs font-semibold text-[#526061] line-clamp-1">
              {perusahaanNama}
            </p>
          </div>
        </div>

        {/* BAGIAN TENGAH: Tags Lokasi & Tipe Pekerjaan */}
        <div className="flex flex-col items-start gap-2 mb-5">
          <div className="flex items-start gap-1.5 text-[11px] font-bold text-[#9ca3af] bg-[#f3f4f4] px-3 py-2 rounded-lg w-full">
            <MapPin size={13} className="shrink-0 mt-[1px]" /> 
            <span className="leading-tight text-left">{lokasi}</span>
          </div>
          <span className="text-[11px] font-bold text-[#9ca3af] bg-[#f3f4f4] px-3 py-1.5 rounded-lg w-fit">
            {tipePekerjaan}
          </span>
        </div>

        {/* BAGIAN BAWAH: Tombol Action */}
        <div className="mt-auto pt-1">
          {!locked ? (
            <button className="w-full py-2.5 rounded-xl border-2 border-[#3c5759] text-[#3c5759] font-bold text-sm hover:bg-[#3c5759] hover:text-white transition-colors cursor-pointer flex justify-center items-center">
              Lihat Detail
            </button>
          ) : (
            <div className="w-full py-2.5 rounded-xl border-2 border-slate-200 text-slate-400 font-bold text-sm text-center">
              Terkunci
            </div>
          )}
        </div>

      </motion.div>

      {locked && <LockOverlay message="Verifikasi & isi kuesioner untuk akses" />}
    </div>
  );
}