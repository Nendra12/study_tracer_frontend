import React from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Bookmark, ArrowRight, Clock, Sparkles, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_BASE_URL } from '../../api/axios';
import hitungMundur from '../../utilitis/hitungMundurTanggal';
import LockOverlay from './LockOverlay';
import { shareLowongan } from '../../utils/share';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

export default function LowonganCard({ data, onImageClick, onToggleSave, savingId, locked = false }) {
  const navigate = useNavigate();

  if (!data) return null;

  const deadline = data.lowongan_selesai ? hitungMundur(data.lowongan_selesai) : null;
  const fotoUrl = getImageUrl(data.foto);
  const perusahaanNama = data.perusahaan?.nama || '—';
  const skillMatchCount = data.__matchCount || data.skill_match_count || data.matched_skills_count || 0;
  const lokasi = data.perusahaan?.kota
    ? `${data.perusahaan.kota.nama}${data.perusahaan.kota.provinsi ? ', ' + data.perusahaan.kota.provinsi.nama : ''}`
    : (data.lokasi || '—');
    
  // Ekstraksi data skills
  const skills = data.skills || [];

  return (
    <div className={`relative ${locked ? 'grayscale opacity-60' : ''} h-full`}>
      <motion.div
        whileHover={locked ? {} : { y: -6 }}
        onClick={() => !locked && navigate(`/alumni/lowongan/${data.id}`)}
        className={`bg-white rounded-md overflow-hidden border border-slate-100 shadow-sm flex flex-col transition-all duration-300 group cursor-pointer h-full
          ${locked ? '' : 'hover:shadow-xl hover:border-primary/20'}`}
      >

        {/* poster image */}
        <div
          className={`relative h-[200px] shrink-0 w-full bg-slate-100 overflow-hidden rounded-t-md
            ${locked ? '' : 'cursor-pointer'}`}
          onClick={(e) => {
            if (locked || !onImageClick) return;
            e.stopPropagation();
            onImageClick(fotoUrl || '/Desain Poster Job.jpg', e);
          }}
        >
          <img
            src={fotoUrl || '/Desain Poster Job.jpg'}
            alt="Lowongan"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out ${locked ? '' : 'group-hover:scale-105'}`}
            onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Poster+Not+Found'; }}
          />

          {/* wave mask */}
          <svg
            className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[106%] h-[36px] z-10 pointer-events-none"
            viewBox="0 0 1440 100" preserveAspectRatio="none"
          >
            <path fill="#ffffff" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L0,100Z" />
          </svg>

          {/* deadline badge */}
          {deadline && deadline !== '-' && (
            <div className="absolute top-3 right-3 z-20">
              <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-md">
                <Clock size={11} strokeWidth={3} /> {deadline}
              </span>
            </div>
          )}

          {skillMatchCount > 0 && (
            <div className="absolute top-3 left-3 z-20">
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-sm">
                <Sparkles size={11} strokeWidth={3} /> Sesuai Skill
              </span>
            </div>
          )}
        </div>

        {/* content */}
        <div className="px-5 pt-1 pb-5 flex flex-col flex-1 relative z-10 bg-white">
          <h3 className="font-black text-primary text-[16px] leading-snug line-clamp-2 mb-3">
            {data.judul}
          </h3>

          {/* company */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
              <Building2 size={17} className="text-slate-400" />
            </div>
            <span className="font-bold text-[13px] text-primary/80 line-clamp-1">{perusahaanNama}</span>
          </div>

          {/* location */}
          <div className={`inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[11px] text-slate-500 font-semibold w-fit ${skills.length > 0 ? 'mb-3' : 'mb-4'}`}>
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="line-clamp-1">{lokasi}</span>
          </div>

          {/* SKILLS TAGS */}
          {skills.length > 0 && (
            <div className="mt-auto mb-4">
              {/* Tambahan Teks Pelabelan Skill */}
              <p className="text-[10px] text-slate-400 font-bold mb-2">Skill yang dibutuhkan:</p>
              
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 3).map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2.5 py-1 bg-[#f3f4f4] border border-slate-100 text-slate-600 text-[10px] font-bold rounded-lg shadow-sm line-clamp-1 max-w-[120px]"
                  >
                    {skill.nama || skill.name || skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">
                    +{skills.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* footer */}
          <div className={`pt-4 border-t border-slate-50 flex items-center justify-between ${skills.length === 0 ? 'mt-auto' : ''}`}>
            <span className="text-[11px] text-slate-400 font-bold italic">{data.tipe_pekerjaan || ''}</span>
            {!locked && (
              <div className="flex gap-2">
                {/* Tombol Share */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    shareLowongan({
                      id: data.id,
                      judul: data.judul,
                      perusahaan: data.perusahaan?.nama,
                    });
                  }}
                  aria-label="Bagikan lowongan"
                  className="group w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                  title="Bagikan Lowongan"
                >
                  <Share2 size={16} className="text-slate-600 group-hover:text-primary" />
                </button>

                {/* Tombol Simpan (Bookmark) */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleSave(data.id); }}
                  disabled={savingId === data.id}
                  className={`group w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    data.is_saved ? 'bg-primary/10 border-primary/20 hover:bg-primary/15' : ''
                  }`}
                >
                  {data.is_saved ? (
                    <Bookmark size={16} className="text-primary" fill="currentColor" />
                  ) : (
                    <Bookmark size={16} className="text-slate-600 group-hover:text-primary" />
                  )}
                </button>
                
                {/* Tombol Arah Panah (Ke Detail) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/alumni/lowongan/${data.id}`); }}
                  className="w-8 h-8 flex items-center justify-center bg-primary rounded-full hover:bg-primary/80 transition-colors cursor-pointer"
                >
                  <ArrowRight size={15} className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Komponen overlay gembok jika status lowongan terkunci */}
      {locked && <LockOverlay message="Verifikasi & isi kuesioner untuk akses" />}
    </div>
  );
}