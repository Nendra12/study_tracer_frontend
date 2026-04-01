import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Building2, ArrowRight, GraduationCap, Rocket, LineChart } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';

// --- Helper to build image URL ---
function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

// --- Helper untuk ikon status ---
const getStatusIcon = (status) => {
  switch (status) {
    case 'Kuliah': return <GraduationCap size={16} className="text-primary/50 shrink-0 mt-0.5" />;
    case 'Wirausaha': return <Rocket size={16} className="text-primary/50 shrink-0 mt-0.5" />;
    case 'Mencari Pekerjaan':
    case 'Mencari': return <LineChart size={16} className="text-primary/50 shrink-0 mt-0.5" />;
    case 'Bekerja':
    default: return <Briefcase size={16} className="text-primary/50 shrink-0 mt-0.5" />;
  }
};

export default function AlumniProfileCard({ alumni, onClick, onImageClick }) {
  const imageSrc = alumni.foto ? getImageUrl(alumni.foto) : null;

  // console.log(alumni)
  return (
    <motion.div
      onClick={onClick}
      className="bg-white rounded-3xl flex flex-col overflow-hidden border border-primary/5 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      {/* AREA GAMBAR */}
      <div
        className="h-56 w-full bg-white relative overflow-hidden cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (imageSrc) onImageClick(imageSrc);
        }}
      >
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={alumni.name} 
            className="w-full h-full object-cover transition-transform duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary/20 bg-primary/5">
            {alumni.name?.charAt(0) || 'A'}
          </div>
        )}

        {/* Efek Gelombang Bawah */}
        <svg
          className="absolute bottom-0 left-0 w-[102%] -translate-x-[1%] h-10 z-20 translate-y-px"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
          ></path>
        </svg>
      </div>

      {/* AREA KONTEN BAWAH */}
      <div className="p-6 pt-1 flex-1 flex flex-col relative z-20 bg-white">
        <div className="mb-5 text-center">
          <h3 className="font-black text-primary text-xl leading-tight line-clamp-1">{alumni.name}</h3>
          <p className="text-[11px] font-bold text-primary/40 mt-1 uppercase tracking-widest">Angkatan {alumni.angkatan}</p>
        </div>

        {/* Penjelasan Detail */}
        <div className="space-y-3 mb-6 px-1">
          <div className="flex items-start gap-3 text-primary/80">
            <Briefcase size={16} className="text-primary/50 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold line-clamp-2">{alumni.role || '-'}</p>
          </div>
          <div className="flex items-start gap-3 text-primary/80">
            <Building2 size={16} className="text-primary/50 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold line-clamp-2">{alumni.company || '-'}</p>
          </div>
          <div className="flex items-start gap-3 text-primary/80">
            {getStatusIcon(alumni.status)}
            <p className="text-sm font-semibold line-clamp-2">{alumni.status || '-'}</p>
          </div>
        </div>

        {/* Tombol Lihat Profil */}
        <div className="mt-auto pt-4 border-t border-primary/10 flex items-center justify-end">
          <button
            onClick={(e) => { 
                e.stopPropagation(); 
                onClick(); 
            }}
            className="flex items-center gap-1.5 text-[13px] font-bold text-primary hover:text-[#2A3E3F] hover:underline transition-all cursor-pointer"
          >
            Lihat Profil <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}