import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Building2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate
import { STORAGE_BASE_URL } from '../../api/axios';
import LockOverlay from './LockOverlay';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function AlumniProfileCard({ data, locked, onImageClick }) {
  const navigate = useNavigate(); // 2. INISIALISASI NAVIGATE

  if (!data) return null;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${data.name ? data.name.replace(' ', '+') : 'A'}&background=3C5759&color=fff&size=150`;
  const imageSrc = data.foto ? getImageUrl(data.foto) : defaultAvatar;

  return (
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''} h-full`}>
      <motion.div 
        whileHover={locked ? {} : { y: -5 }} 
        // 3. TAMBAHKAN ONCLICK PADA KARTU
        onClick={() => {
          if (!locked && data.id) navigate(`/alumni/${data.id}`);
        }}
        className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full ${locked ? '' : 'cursor-pointer hover:shadow-md transition-shadow'}`}
      >
        
        {/* BAGIAN 1 & 2: Kontainer Atas */}
        <div className="flex gap-4 mb-4 relative">
          
          {/* BAGIAN 1: Gambar Profil */}
          <div 
            className={`w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 ${locked ? '' : 'cursor-pointer group'}`}
            onClick={(e) => {
              if (locked || !onImageClick) return;
              e.stopPropagation(); // Mencegah pindah halaman saat gambar diklik
              onImageClick(imageSrc);
            }}
          >
            <img 
              src={imageSrc} 
              alt={data.name} 
              className={`w-full h-full object-cover ${locked ? '' : 'transition-transform duration-300 group-hover:scale-110'}`}
            />
          </div>

          {/* BAGIAN 2: Penjelasan (Teks) */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-2">
              <h3 className="font-bold text-primary text-sm line-clamp-1">{data.name}</h3>
              <p className="text-slate-400 text-[11px]">Angkatan {data.angkatan}</p>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-start gap-1.5 text-slate-600">
                <GraduationCap size={14} className="text-primary shrink-0 mt-0.5" />
                <span className="text-[11px] font-semibold line-clamp-2 leading-tight">{data.role || '-'}</span>
              </div>
              <div className="flex items-start gap-1.5 text-slate-500">
                <Building2 size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="text-[11px] font-medium line-clamp-2 leading-tight">{data.company || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BAGIAN 3: Footer (Tag Satu Warna) */}
        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary">
            {data.tags || '-'}
          </span>
          {!locked && (
            <button className="flex items-center gap-1 text-[12px] font-bold text-primary hover:underline transition-all cursor-pointer">
              Lihat Profil <ArrowRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
      {locked && <LockOverlay message="Verifikasi & isi kuesioner untuk akses" />}
    </div>
  );
}