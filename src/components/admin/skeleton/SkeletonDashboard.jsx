import React from 'react';

// Komponen dasar untuk efek kedip (pulse) abu-abu lembut
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#E2E8F0]/80 ${className}`} />
);

export default function SkeletonDashboard() {
  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1">
      
      {/* 1. STATS GRID SKELETON (4 Kotak Teratas) - SESUAI GAMBAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-start">
              {/* Icon Kotak (Kiri) */}
              <Skeleton className="w-[52px] h-[52px] rounded-2xl" />
              {/* Badge Oval (Kanan) */}
              <Skeleton className="w-16 h-6 rounded-full" />
            </div>
            <div className="space-y-3 mt-1">
              {/* Baris Text 1 (Lebih panjang & tipis) */}
              <Skeleton className="w-32 h-3 rounded-full" />
              {/* Baris Text 2 (Lebih pendek & tebal) */}
              <Skeleton className="w-16 h-7 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. SECTION PENDAFTARAN ALUMNI SKELETON */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm">
        <Skeleton className="w-64 h-6 rounded-md mb-6" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="flex justify-center items-center">
            {/* Lingkaran Progress (Donut Chart) */}
            <Skeleton className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] rounded-full" />
          </div>
          <div className="xl:col-span-2 space-y-4">
            {/* List Menunggu (2 Kotak) */}
            <Skeleton className="w-full h-[90px] rounded-2xl" />
            <Skeleton className="w-full h-[90px] rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 3. SECTION PROFIL & STATISTIK SKELETON */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 shadow-sm">
        
        {/* Header Profil & Statistik */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
          <Skeleton className="w-60 h-7 rounded-md" />
          <Skeleton className="w-32 h-8 rounded-xl" />
        </div>

        {/* Charts Grid (Pie & Bar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 items-stretch">
          <div className="w-full flex flex-col h-full text-center items-center">
            <Skeleton className="w-32 h-5 rounded-md mb-4" />
            {/* Pie Chart Skeleton */}
            <Skeleton className="w-[250px] h-[250px] rounded-full mt-4" />
          </div>

          <div className="w-full lg:col-span-2 flex flex-col h-full lg:text-left">
            <Skeleton className="w-64 h-5 rounded-md mb-4 mx-auto lg:mx-0" />
            {/* Bar Chart Skeleton */}
            <Skeleton className="w-full h-[280px] rounded-xl" />
          </div>
        </div>

        {/* Footer Stats Grid (Top 5 & Distribusi) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-5">
          
          {/* Kiri: 5 Perusahaan Teratas */}
          <div className="space-y-4">
            <Skeleton className="w-64 h-6 rounded-md" />
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              {[1, 2, 3, 4, 5].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="w-40 h-4 rounded-md" />
                      <Skeleton className="w-24 h-2 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: Distribusi Geografis Pekerja */}
          <div className="space-y-4">
            <Skeleton className="w-64 h-6 rounded-md" />
            <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm flex flex-col gap-6">
              {/* Acak lebar bar agar terlihat natural */}
              {['w-full', 'w-[80%]', 'w-[50%]', 'w-[30%]', 'w-[15%]'].map((width, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="w-28 h-3 rounded-md" />
                    <Skeleton className="w-8 h-3 rounded-md" />
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <Skeleton className={`h-full ${width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}