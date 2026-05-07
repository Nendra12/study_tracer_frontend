import React from 'react';
import { Search, History, GraduationCap, Download } from 'lucide-react';

export default function KelulusanSkeleton() {
  // Dummy array untuk membuat 5 baris loading di tabel
  const skeletonRows = Array(5).fill(0);

  // Class dasar untuk elemen skeleton (abu-abu dan animasi pulse)
  const skeletonBase = "bg-slate-200 animate-pulse rounded-md";

  return (
    <div className="space-y-6 pb-12 relative">
      
      {/* 1. Header & Tabs Skeleton */}
      <div>
        <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
          {/* Tab 1 Aktif (Riwayat) */}
          <div className="flex items-center gap-2 px-6 py-3.5 border-b-2 border-primary shrink-0">
            <History size={18} className="text-primary opacity-50" />
            <div className={`h-4 w-24 ${skeletonBase}`}></div>
          </div>
          {/* Tab 2 Inaktif (Proses) */}
          <div className="flex items-center gap-2 px-6 py-3.5 border-b-2 border-transparent shrink-0">
            <GraduationCap size={18} className="text-slate-400" />
            <div className={`h-4 w-32 bg-slate-100 animate-pulse rounded-md`}></div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Card Skeleton (Meniru Tab Riwayat sesuai Gambar) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Top Pannel (Filter Bar) Skeleton */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row flex-wrap md:flex-nowrap items-stretch md:items-center gap-3 relative z-20">
          
          {/* Search Input Mock */}
          <div className="relative w-full md:flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <div className="w-full h-[42px] bg-white border border-slate-200 rounded-xl"></div>
          </div>
          
          {/* Dropdown 1 (Tahun) Mock */}
          <div className="w-full md:w-[180px] h-[42px] bg-white border border-slate-200 rounded-xl"></div>
          
          {/* Dropdown 2 (Jurusan) Mock */}
          <div className="w-full md:w-[180px] h-[42px] bg-white border border-slate-200 rounded-xl"></div>
          
          {/* Export Button Mock */}
          <div className="w-full md:w-auto h-[42px] px-5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2">
             <Download size={16} className="text-slate-300" />
             <div className={`h-4 w-20 ${skeletonBase}`}></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {/* Header tetap menggunakan teks asli agar struktur jelas, tapi sedikit redup */}
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider w-16 text-center">No</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">NISN</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jurusan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Tahun Lulus</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {skeletonRows.map((_, index) => (
                <tr key={index} className="bg-white">
                  {/* No */}
                  <td className="px-6 py-5 text-center">
                    <div className={`h-4 w-4 ${skeletonBase} mx-auto`}></div>
                  </td>
                  {/* NISN */}
                  <td className="px-6 py-5">
                    <div className={`h-4 w-24 ${skeletonBase}`}></div>
                  </td>
                  {/* Nama */}
                  <td className="px-6 py-5">
                    <div className={`h-4 w-56 ${skeletonBase}`}></div>
                  </td>
                  {/* Jurusan (Badge style) */}
                  <td className="px-6 py-5">
                    <div className={`h-6 w-20 ${skeletonBase}`}></div>
                  </td>
                  {/* Status (Badge style) */}
                  <td className="px-6 py-5 text-center">
                    <div className={`h-6 w-16 ${skeletonBase} mx-auto`}></div>
                  </td>
                  {/* Tahun Lulus */}
                  <td className="px-6 py-5 text-center">
                    <div className={`h-4 w-12 ${skeletonBase} mx-auto`}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}