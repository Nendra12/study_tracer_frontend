import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Bookmark, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT useNavigate
import { STORAGE_BASE_URL } from '../../api/axios';
import hitungMundur from '../../utilitis/hitungMundurTanggal';
import LockOverlay from './LockOverlay';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function JobPosterCard({ data, onImageClick, locked }) {
  const navigate = useNavigate(); // 2. INISIALISASI NAVIGATE

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
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''} h-full`}>
      <motion.div 
        whileHover={locked ? {} : { y: -8 }} 
        // 3. TAMBAHKAN ONCLICK PADA KARTU
        onClick={() => {
          if (!locked && data.id) navigate(`/lowongan/${data.id}`);
        }}
        className={`bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full transition-all duration-300 group ${locked ? '' : 'cursor-pointer hover:shadow-xl'}`}
      >
        {/* Kontainer Gambar */}
        <div 
          className={`h-56 overflow-hidden relative ${locked ? '' : 'cursor-pointer'}`}
          onClick={(e) => {
            if (locked || !onImageClick) return;
            e.stopPropagation(); // Mencegah pindah halaman saat gambar diklik
            onImageClick(fotoUrl || "/Desain Poster Job.jpg");
          }}
        >
          <img 
            src={fotoUrl || "/Desain Poster Job.jpg"} 
            alt="Lowongan" 
            className={`w-full h-full object-cover ${locked ? '' : 'transition-transform duration-500 group-hover:scale-105'}`}
            onError={(e) => { e.target.src = "https://placehold.co/600x400?text=Poster+Not+Found"; }} 
          />
          
          {/* EFEK GELOMBANG MENGGUNAKAN SVG */}
          <svg className="absolute -bottom-[1px] left-0 w-full h-8 z-20" viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="#ffffff" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-10" />
        </div>

        <div className="p-5 pt-4 flex-1 flex flex-col relative z-20">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-black text-[#3C5759] text-lg leading-tight flex-1 line-clamp-2">{data.judul}</h3>
            {deadline && deadline !== '-' && (
              <span className="text-red-500 text-[10px] font-black uppercase bg-red-50 px-2 py-1 rounded-md ml-2 shrink-0">
                {deadline}
              </span>
            )}
          </div>
          
          {waktuBerakhir && (
            <div className="mb-3">
              <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium">
                Berakhir: {waktuBerakhir}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#3C5759]">
              <Building2 size={16} />
            </div>
            <span className="font-bold text-sm text-slate-700 line-clamp-1">{perusahaanNama}</span>
          </div>

          <div className="bg-slate-50 rounded-xl px-3 py-2 self-start mb-4 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
              <MapPin size={14} className="text-[#3C5759]" />
              <span className="line-clamp-1">{lokasi}</span>
            </div>
          </div>

          {data.deskripsi && (
            <div className="text-slate-500 text-[12px] leading-relaxed mb-6 line-clamp-3" dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
          )}

          <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
            <div className="flex flex-col">
              {data.tipe_pekerjaan && (
                <span className="text-slate-400 text-[10px] font-medium italic">{data.tipe_pekerjaan}</span>
              )}
            </div>
            {!locked && (
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <Bookmark size={18} className="text-slate-300 hover:text-[#3C5759]" />
                </button>
                <button className="p-2 bg-[#3C5759]/5 hover:bg-[#3C5759]/10 rounded-full transition-colors cursor-pointer">
                  <ArrowRight size={18} className="text-[#3C5759]" />
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