import React from 'react';
import { Building2, School } from 'lucide-react';

export default function TopSebaran({ stats }) {
  if (!stats) return null;

  // Mencari nilai tertinggi agar panjang garis (progress bar) bisa proporsional (max 100%)
  const maxPerusahaan = Math.max(...(stats.top_perusahaan?.map(i => i.alumni_count) || [1]));
  const maxUniversitas = Math.max(...(stats.top_universitas?.map(i => i.alumni_count) || [1]));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* KARTU TOP 5 PERUSAHAAN */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-primary mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Building2 size={18} /></div>
          Top 5 Perusahaan
        </h3>
        
        <div className="space-y-5">
          {stats.top_perusahaan?.map((item, idx) => {
            // Kalkulasi persentase panjang garis (minimal 2% agar garis tetap terlihat meski nilainya 0)
            const percentage = Math.max((item.alumni_count / maxPerusahaan) * 100, 2);
            
            return (
              <div key={`${item.nama}-${idx}`} className="group">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-bold text-slate-700 truncate pr-4 group-hover:text-blue-600 transition-colors">
                    {item.nama}
                  </span>
                  <div className="text-right flex flex-col items-end leading-none">
                    <span className="text-lg font-black text-slate-800">{item.alumni_count}</span>
                    <span className="text-[8px] font-black text-slate-400 tracking-widest mt-0.5">ALUMNI</span>
                  </div>
                </div>
                
                {/* Progress Bar (Garis Bawah) */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {(!stats.top_perusahaan || stats.top_perusahaan.length === 0) && (
            <p className="text-sm text-center text-gray-400 italic py-4">Belum ada data perusahaan</p>
          )}
        </div>
      </div>

      {/* KARTU TOP 5 UNIVERSITAS */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-primary mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500"><School size={18} /></div>
          Top 5 Universitas
        </h3>
        
        <div className="space-y-5">
          {stats.top_universitas?.map((item, idx) => {
            // Kalkulasi persentase panjang garis
            const percentage = Math.max((item.alumni_count / maxUniversitas) * 100, 2);
            
            return (
              <div key={`${item.nama}-${idx}`} className="group">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm font-bold text-slate-700 truncate pr-4 group-hover:text-emerald-600 transition-colors">
                    {item.nama}
                  </span>
                  <div className="text-right flex flex-col items-end leading-none">
                    <span className="text-lg font-black text-slate-800">{item.alumni_count}</span>
                    <span className="text-[8px] font-black text-slate-400 tracking-widest mt-0.5">ALUMNI</span>
                  </div>
                </div>
                
                {/* Progress Bar (Garis Bawah) */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {(!stats.top_universitas || stats.top_universitas.length === 0) && (
            <p className="text-sm text-center text-gray-400 italic py-4">Belum ada data universitas</p>
          )}
        </div>
      </div>
      
    </div>
  );
}