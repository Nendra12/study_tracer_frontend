import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { STORAGE_BASE_URL } from '../../api/axios';
import LockOverlay from './LockOverlay';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function AlumniProfileCard({ data, locked, onImageClick }) {
  const navigate = useNavigate();

  if (!data) return null;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${data.name ? data.name.replace(' ', '+') : 'A'}&background=3C5759&color=fff&size=150`;
  const originalSrc = data.foto ? getImageUrl(data.foto) : defaultAvatar;
  const imageSrc = data.foto_thumbnail ? getImageUrl(data.foto_thumbnail) : originalSrc;

  return (
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''} h-full`}>
      <motion.div
        onClick={() => {
          if (!locked && data.id) navigate(`/alumni/daftar-alumni/${data.id}`);
        }}
        className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full ${locked ? '' : 'cursor-pointer hover:shadow-md transition-shadow'}`}
      >
        {/* BAGIAN ATAS: Foto dan Info Singkat */}
        <div className="flex items-center gap-4 mb-4 relative">
          {/* Gambar Profil */}
          <div
            className={`w-14 h-14 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200 ${locked ? '' : 'cursor-pointer group'}`}
            onClick={(e) => {
              if (locked || !onImageClick) return;
              e.stopPropagation(); 
              onImageClick(originalSrc);
            }}
          >
            <img
              src={imageSrc}
              alt={data.name}
              className={`w-full h-full object-cover ${locked ? '' : 'transition-transform duration-300 group-hover:scale-110'}`}
              onError={(e) => { if (e.target.src !== originalSrc) e.target.src = originalSrc; }}
            />
          </div>

          {/* Teks Info */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-bold text-[#3c5759] text-base line-clamp-1">{data.name}</h3>
            <p className="text-[#526061] text-xs font-semibold">
              {data.major || data.jurusan || '-'} • {data.year || data.angkatan || '-'}
            </p>
          </div>
        </div>

        {/* BAGIAN BAWAH: Box Pekerjaan/Status */}
        <div className="mt-auto bg-[#f3f4f4] rounded-xl px-4 py-2.5 text-center flex items-center justify-center">
           <p className="text-xs font-bold text-[#526061] uppercase tracking-wider line-clamp-1">
             {data.job || data.role || data.status || '-'}
           </p>
        </div>
      </motion.div>
      {locked && <LockOverlay message="Verifikasi & isi kuesioner untuk akses" />}
    </div>
  );
}