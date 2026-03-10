import React from 'react';
import { Building2, GraduationCap, MapPin } from 'lucide-react';
import { motion } from 'framer-motion'; // Ditambahkan untuk animasi statistik
import LockOverlay from './LockOverlay';
import telkomLogo from '../../assets/telkom.png';

// --- DATA DUMMY UNIVERSITAS ---
const dummyUniversitas = [
  { id: 1, name: "Universitas Indonesia", location: "Depok", alumniCount: 120 },
  { id: 2, name: "Institut Teknologi Bandung", location: "Bandung", alumniCount: 95 },
  { id: 3, name: "Universitas Brawijaya", location: "Malang", alumniCount: 84 },
  { id: 4, name: "Universitas Diponegoro", location: "Semarang", alumniCount: 62 },
  { id: 5, name: "Universitas Airlangga", location: "Surabaya", alumniCount: 45 },
];

// --- DATA LOGO BERJALAN ---
const runningLogos = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Telkom Indonesia", domain: "telkom.co.id", customLogo: telkomLogo },
  { name: "Universitas Indonesia", domain: "ui.ac.id" },
  { name: "Institut Teknologi Bandung", domain: "itb.ac.id" },
  { name: "Universitas Gadjah Mada", domain: "ugm.ac.id" },
  { name: "Universitas Brawijaya", domain: "ub.ac.id" },
  { name: "Institut Teknologi Sepuluh Nopember", domain: "its.ac.id" },
];

export default function TopPerusahaan({ 
  data, 
  dataUniversitas, 
  locked, 
  totalPerusahaan = 45, 
  totalAlumni = 320 
}) {

  const univList = dataUniversitas?.length > 0 ? dataUniversitas : dummyUniversitas;
  const topCompanies = data?.length > 0 ? data.slice(0, 5) : [];
  const topUnivs = univList.slice(0, 5);

  // Mencari nilai tertinggi untuk menghitung persentase bar statistik
  const maxCompAlumni = topCompanies.length > 0 ? Math.max(...topCompanies.map(c => c.alumniCount || 0)) : 1;
  const maxUnivAlumni = topUnivs.length > 0 ? Math.max(...topUnivs.map(u => u.alumniCount || 0)) : 1;

  return (
    <section className="mb-12 relative space-y-6">
      
      {/* Inject Custom CSS untuk Animasi Marquee */}
      <style>
        {`
          @keyframes scroll-x {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: scroll-x 35s linear infinite;
          }
        `}
      </style>

      {/* ================= SECTION 1: MARQUEE LOGO BERJALAN ================= */}
      <div className={`w-full overflow-hidden py-4 ${locked ? 'grayscale opacity-60' : ''}`}>
        <p className="text-2xl font-black text-[#3c5759] tracking-tight text-center mb-6">
          Mitra Industri Teknologi & Perguruan Tinggi Terkemuka
        </p>
        <div className="flex overflow-hidden relative w-full py-4">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#f8f9fa] to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#f8f9fa] to-transparent pointer-events-none"></div>
          
          {/* gap-6 diubah jadi gap-10 agar jarak antar logo pas setelah kotak putih dihapus */}
          <div className="animate-marquee gap-10 pl-10 items-center">
            {[...runningLogos, ...runningLogos].map((item, idx) => (
              <div 
                key={idx} 
                // bg-white, border, shadow, dan p-3 dihapus
                // w dan h disesuaikan agar ukurannya tetap proporsional
                className="w-14 h-14 md:w-16 md:h-16 shrink-0 flex items-center justify-center hover:-translate-y-1 hover:scale-105 transition-all duration-300"
                title={item.name}
              >
                <img 
                  src={item.customLogo || `https://s2.googleusercontent.com/s2/favicons?domain=${item.domain}&sz=256`}
                  alt={`${item.name} logo`}
                  className="w-full h-full object-contain drop-shadow-sm" // Tambahan drop-shadow tipis agar logo lebih menonjol
                  onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${item.name}&background=transparent&color=64748b&rounded=true&bold=true`; }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: STATISTIK GRID ================= */}
      <div className={`grid grid-cols-1 xl:grid-cols-2 gap-6 relative transition-all duration-500 ${locked ? 'grayscale opacity-60' : ''}`}>
        
        {/* --- KOLOM KIRI: STATISTIK TOP PERUSAHAAN --- */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#3c5759] tracking-tight">Statistik Perusahaan</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Serapan Alumni Terbanyak</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 bg-[#3c5759]/10 rounded-2xl items-center justify-center text-[#3c5759] shrink-0">
              <Building2 size={24} strokeWidth={2.5} />
            </div>
          </div>

          {/* Bar List */}
          <div className="flex flex-col gap-5 flex-1">
            {topCompanies.length > 0 ? (
              topCompanies.map((comp, idx) => (
                <div key={comp.id || idx} className="group flex flex-col gap-2 relative">
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-3 min-w-0 pr-4">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#3c5759] border border-slate-100 shrink-0">
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800 truncate">{comp.name}</h3>
                        <p className="text-slate-400 text-[10px] font-semibold mt-0.5 flex items-center gap-1 truncate">
                          <MapPin size={10} /> <span className="truncate">{comp.location}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pb-1">
                      <span className="text-lg font-black text-[#3c5759] leading-none">{comp.alumniCount}</span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">Alumni</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(comp.alumniCount / maxCompAlumni) * 100}%` }}
                      viewport={{ once: true, amount: 0.8 }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.1 }}
                      className="h-full bg-gradient-to-r from-[#526061] to-[#3c5759] rounded-full relative"
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </motion.div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 px-4 rounded-2xl border-2 border-dashed border-slate-100">
                <Building2 size={32} className="text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-sm">Belum ada data statistik</p>
              </div>
            )}
          </div>
        </div>

        {/* --- KOLOM KANAN: STATISTIK TOP UNIVERSITAS --- */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#3c5759] tracking-tight">Statistik Universitas</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Pilihan Studi Lanjutan</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center text-amber-500 shrink-0">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
          </div>

          {/* Bar List */}
          <div className="flex flex-col gap-5 flex-1">
            {topUnivs.map((univ, idx) => (
              <div key={univ.id || idx} className="group flex flex-col gap-2 relative">
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-amber-500 border border-slate-100 shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{univ.name}</h3>
                      <p className="text-slate-400 text-[10px] font-semibold mt-0.5 flex items-center gap-1 truncate">
                        <MapPin size={10} /> <span className="truncate">{univ.location}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pb-1">
                    <span className="text-lg font-black text-[#3c5759] leading-none">{univ.alumniCount}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Alumni</span>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(univ.alumniCount / maxUnivAlumni) * 100}%` }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked State Overlay */}
        {locked && (
          <LockOverlay 
            message="Verifikasi akun & isi kuesioner untuk membuka statistik ini" 
            roundedClass="rounded-[2rem]"
            iconSize={32}
            textClass="text-sm"
          />
        )}

      </div>
    </section>
  );
}