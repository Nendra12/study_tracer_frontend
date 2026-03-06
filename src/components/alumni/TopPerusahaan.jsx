import React from 'react';
import { Building2, Users } from 'lucide-react';
import LockOverlay from './LockOverlay';

export default function TopPerusahaan({ 
  data, 
  locked, 
  totalPerusahaan = 45, 
  totalAlumni = 320 
}) {
  return (
    <section className="mb-10 relative">
      <div className={`bg-white rounded-[2rem] border border-slate-100 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-500 ${locked ? 'grayscale opacity-60' : ''}`}>
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col sm:flex-row justify-between gap-5 mb-8 md:mb-10">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">
                Top 5 Perusahaan
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                Mitra Perekrut Alumni Terbanyak
              </p>
            </div>

            {/* BADGE STATISTIK (Total Perusahaan & Alumni) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-3.5 py-2 rounded-xl">
                <Building2 size={14} strokeWidth={2.5} className="text-primary" />
                <span className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Total Perusahaan: <span className="text-primary font-black ml-1">{totalPerusahaan}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-3.5 py-2 rounded-xl">
                <Users size={14} strokeWidth={2.5} className="text-primary" />
                <span className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Alumni Terserap: <span className="text-primary font-black ml-1">{totalAlumni}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex w-14 h-14 bg-primary/5 rounded-2xl items-center justify-center text-primary border border-primary/10 shrink-0">
            <Building2 size={26} strokeWidth={2.5} />
          </div>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="flex flex-col gap-3">
          {data?.length > 0 ? (
            data.slice(0, 5).map((comp, idx) => (
              <div 
                key={comp.id || idx} 
                className="group relative flex items-center justify-between p-4 md:p-5 rounded-2xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Aksen Garis Kiri (Muncul saat Hover) */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-center gap-4 md:gap-5 min-w-0 pr-4">
                  {/* Icon Perusahaan */}
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-slate-100 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <Building2 size={24} strokeWidth={2.5} className="md:w-[26px] md:h-[26px]" />
                  </div>

                  {/* Info Perusahaan */}
                  <div className="min-w-0">
                    <h3 className="text-sm md:text-base font-black text-slate-800 group-hover:text-primary transition-colors truncate">
                      {comp.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] md:text-[11px] font-bold mt-1.5 flex items-center gap-1.5 truncate">
                      <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                      <span className="truncate">{comp.location}</span>
                    </p>
                  </div>
                </div>

                {/* Alumni Counter */}
                <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 group-hover:bg-primary group-hover:border-primary shrink-0">
                   <span className="text-xs md:text-sm font-black text-primary group-hover:text-white whitespace-nowrap transition-colors flex items-center gap-1.5">
                     {comp.alumniCount} <span className="hidden sm:inline">Alumni</span>
                     <span className="sm:hidden"><Users size={12} /></span>
                   </span>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50/50 rounded-[1.5rem] border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-4">
                <Building2 size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-bold text-sm">Belum ada data perusahaan</p>
              <p className="text-slate-400 font-medium text-xs mt-1 text-center">Data mitra perusahaan akan otomatis muncul di sini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Locked State Overlay */}
      {locked && (
        <LockOverlay 
          message="Verifikasi akun & isi kuesioner untuk membuka fitur ini" 
          roundedClass="rounded-[2rem]"
          iconSize={32}
          textClass="text-sm"
        />
      )}
    </section>
  );
}