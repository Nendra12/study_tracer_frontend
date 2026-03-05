import React from 'react';
import { Building2 } from 'lucide-react';
import LockOverlay from './LockOverlay';

export default function TopPerusahaan({ data, locked }) {
  return (
    <section className="mb-10 relative">
      <div className={`bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm overflow-hidden transition-all duration-500 ${locked ? 'grayscale opacity-60' : ''}`}>
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-black text-[#3C5759] tracking-tight">
              Top 5 Perusahaan
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Mitra Perekrut Alumni Terbanyak
            </p>
          </div>
          <div className="hidden md:flex w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center text-[#3C5759]/30 border border-slate-100">
            <Building2 size={24} />
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          {data?.length > 0 ? (
            data.slice(0, 5).map((comp, idx) => (
              <div 
                key={comp.id || idx} 
                className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  {/* Icon Perusahaan */}
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#3C5759] border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                    <Building2 size={26} strokeWidth={2.5} />
                  </div>

                  {/* Info Perusahaan */}
                  <div>
                    <h3 className="text-base font-black text-slate-800 group-hover:text-[#3C5759] transition-colors leading-none">
                      {comp.name}
                    </h3>
                    <p className="text-slate-400 text-[11px] font-bold mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      {comp.location}
                    </p>
                  </div>
                </div>

                {/* Alumni Counter - Satu Baris */}
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm transition-all duration-300 group-hover:bg-[#3C5759] group-hover:border-[#3C5759]">
                   <span className="text-sm font-black text-[#3C5759] group-hover:text-white whitespace-nowrap transition-colors">
                     {comp.alumniCount} Alumni
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Building2 size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold text-sm italic">Belum ada data perusahaan tersedia</p>
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