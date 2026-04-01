import React from 'react';
import { motion } from 'framer-motion';
import LockOverlay from './LockOverlay';
import telkomLogo from '../../assets/telkom.png';
import ugmLogo from '../../assets/ugm.png';
import itbLogo from '../../assets/itb.png';

// --- DATA DUMMY ---
const dummyUniversitas = [
  { id: 1, name: "Universitas Indonesia", location: "Depok", alumniCount: 120, color: "#EAB308" },
  { id: 2, name: "Institut Teknologi Bandung", location: "Bandung", alumniCount: 95, color: "#0EA5E9" },
  { id: 3, name: "Universitas Brawijaya", location: "Malang", alumniCount: 84, color: "#6366F1" },
  { id: 4, name: "Universitas Diponegoro", location: "Semarang", alumniCount: 62, color: "#F43F5E" },
  { id: 5, name: "Universitas Airlangga", location: "Surabaya", alumniCount: 45, color: "#10B981" },
];

const runningLogos = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Telkom Indonesia", domain: "telkom.co.id", customLogo: telkomLogo },
  { name: "Universitas Indonesia", domain: "ui.ac.id" },
  { name: "Institut Teknologi Bandung", domain: "itb.ac.id", customLogo: itbLogo },
  { name: "Universitas Gadjah Mada", domain: "ugm.ac.id", customLogo: ugmLogo },
  { name: "Universitas Brawijaya", domain: "ub.ac.id" },
  { name: "Institut Teknologi Sepuluh Nopember", domain: "its.ac.id" },
];

export default function TopPerusahaan({
  data,
  dataUniversitas,
  locked
}) {
  const univList = dataUniversitas?.length > 0 ? dataUniversitas : dummyUniversitas;
  const topCompanies = data?.length > 0 ? data.slice(0, 5) : [];
  const topUnivs = univList.slice(0, 5);

  const maxCompAlumni = Math.max(...(topCompanies.map(c => c.alumniCount) || [1]));
  const maxUnivAlumni = Math.max(...(topUnivs.map(u => u.alumniCount) || [1]));

  return (
    <section className="py-12 bg-[#FAFAFB] min-h-screen font-sans">
      {/* Inject Custom CSS untuk Animasi Marquee */}
      <style>
        {`
          @keyframes scroll-left {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll-left 40s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      {/* ================= SECTION 1: MARQUEE LOGO BERJALAN ================= */}
      <div className={`w-full overflow-hidden py-4 ${locked ? 'grayscale opacity-60' : ''}`}>
        <p className="text-2xl font-black text-primary tracking-tight text-center mb-6">
          Mitra Industri Teknologi & Perguruan Tinggi Terkemuka
        </p>
        <div className="relative w-full overflow-hidden py-4">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-[#FAFAFB] via-[#FAFAFB]/50 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-[#FAFAFB] via-[#FAFAFB]/50 to-transparent pointer-events-none"></div>

          {/* Scrolling content - dibuat 2 set identik untuk seamless loop */}
          <div className="flex">
            <div className="flex gap-12 items-center animate-scroll">
              {[...runningLogos, ...runningLogos].map((item, idx) => (
                <div
                  key={`set1-${idx}`}
                  className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center hover:scale-110 transition-transform duration-300"
                  title={item.name}
                >
                  <img
                    src={item.customLogo || `https://s2.googleusercontent.com/s2/favicons?domain=${item.domain}&sz=256`}
                    alt={`${item.name} logo`}
                    className="w-full h-full object-contain drop-shadow-md filter hover:drop-shadow-lg"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=3c5759&color=fff&rounded=true&bold=true&size=128`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">

          {/* STATS: COMPANIES */}
          <div className={`space-y-8 ${locked ? 'blur-sm select-none' : ''}`}>
            <div className="space-y-1">
              <span className="text-primary font-bold text-4xl">01</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top 5 Perusahaan</h3>
              <p className="text-slate-500 text-sm">Top Perusahaan yang banyak menyerap alumni.</p>
            </div>

            <div className="space-y-10">
              {topCompanies.map((comp, idx) => (
                <div key={idx} className="group relative">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col pb-1">
                      {/* Rank dihapus */}
                      <span className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors leading-none">
                        {comp.name}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-2xl font-black text-slate-900 leading-none">{comp.alumniCount}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase leading-none">Alumni</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(comp.alumniCount / maxCompAlumni) * 100}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STATS: UNIVERSITIES */}
          <div className={`space-y-8 ${locked ? 'blur-sm select-none' : ''}`}>
            <div className="space-y-1">
              <span className="text-amber-500 font-bold text-4xl">02</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Top 5 Universitas</h3>
              <p className="text-slate-500 text-sm">Universitas yang digemari para alumni.</p>
            </div>

            <div className="space-y-10">
              {topUnivs.map((univ, idx) => (
                <div key={idx} className="group relative">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col pb-1">
                      <span className="text-lg font-bold text-slate-800 group-hover:text-amber-500 transition-colors leading-none">
                        {univ.name}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-2xl font-black text-slate-900 leading-none">{univ.alumniCount}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase leading-none">Alumni</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(univ.alumniCount / maxUnivAlumni) * 100}%` }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full bg-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OVERLAY */}
          {locked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white text-center max-w-sm mx-4">
                <p className="text-slate-900 font-black text-xl mb-2">Content Locked</p>
                <p className="text-slate-500 text-sm mb-6">Verify your account and complete the survey to unlock full insights.</p>
                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95">
                  Unlock Statistics
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}