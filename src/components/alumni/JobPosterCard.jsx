import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Bookmark, ArrowRight, Clock } from 'lucide-react';
import { STORAGE_BASE_URL } from '../../api/axios';
import hitungMundur from '../../utilitis/hitungMundurTanggal';
import LockOverlay from './LockOverlay';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function JobPosterCard({ data, onImageClick, locked }) {
  if (!data) return null;

  const deadline = data.lowongan_selesai ? hitungMundur(data.lowongan_selesai) : null;
  const fotoUrl = getImageUrl(data.foto);
  const perusahaanNama = data.perusahaan?.nama || '-';
  const lokasi = data.perusahaan?.kota 
    ? `${data.perusahaan.kota.nama}${data.perusahaan.kota.provinsi ? ', ' + data.perusahaan.kota.provinsi.nama : ''}`
    : (data.lokasi || '-');
  const waktuBerakhir = data.lowongan_selesai 
    ? new Date(data.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', 23:59 WIB'
    : null;

  return (
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''}`}>
      <motion.div 
        whileHover={locked ? {} : { y: -8 }} 
        className={`bg-white rounded-[1.75rem] overflow-hidden border border-slate-100 shadow-sm flex flex-col transition-all duration-300 group ${locked ? '' : 'hover:shadow-xl'}`}
      >
        
        {/* --- KOTAK GAMBAR --- */}
        <div 
          className={`h-[220px] w-full bg-white relative overflow-hidden rounded-t-[1.75rem] ${locked ? '' : 'cursor-pointer'}`}
          onClick={(e) => {
            if (locked || !onImageClick) return;
            e.stopPropagation();
            onImageClick(fotoUrl || "/Desain Poster Job.jpg", e);
          }}
        >
          {/* Gambar Background */}
          <img 
            src={fotoUrl || "/Desain Poster Job.jpg"} 
            alt="Lowongan" 
            className={`w-full h-full object-cover relative z-0 transition-transform duration-700 ease-out ${locked ? '' : 'group-hover:scale-105'}`}
            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Poster+Not+Found"; }} 
          />
          
          {/* PEMBUNGKUS SVG MASKING: Trik scale-x-[1.05] untuk menutupi celah pinggir */}
          <svg 
            className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[105%] h-[40px] z-20 pointer-events-none scale-x-[1.05]" 
            viewBox="0 0 1440 100" 
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="#ffffff" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>

        {/* --- AREA KONTEN BAWAH --- */}
        <div className="p-6 pt-2 flex flex-col relative z-20 bg-white">
          
          <div className="flex flex-col gap-2 mb-4 mt-1">
            <h3 className="font-black text-slate-800 text-[18px] leading-snug line-clamp-2">
              {data.judul}
            </h3>
            
            {deadline && deadline !== '-' && (
              <div className="self-start"> 
                 <span className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase bg-red-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                  <Clock size={12} strokeWidth={2.5} /> {deadline}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
              <Building2 size={20} />
            </div>
            <span className="font-bold text-[14px] text-slate-700 line-clamp-1">{perusahaanNama}</span>
          </div>

          <div className="bg-slate-50 rounded-xl px-3.5 py-2.5 mb-5 border border-slate-100 flex items-center gap-2 text-slate-500 font-bold text-[11px] w-fit">
            <MapPin size={14} className="text-slate-400" />
            <span className="line-clamp-1">{lokasi}</span>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <div>
              {data.tipe_pekerjaan && (
                <span className="text-slate-400 text-[11px] font-bold italic tracking-wide">
                  {data.tipe_pekerjaan}
                </span>
              )}
            </div>
            {!locked && (
              <div className="flex gap-2.5">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Bookmark size={18} className="text-slate-300 hover:text-slate-600" />
                </button>
                <button className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <ArrowRight size={18} className="text-slate-600" />
                </button>
              </div>
            )}
          </div>

        </div>
      </motion.div>
      {locked && <LockOverlay message="Verifikasi & isi kuesioner untuk akses" />}
    </div>
  );
}