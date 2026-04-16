import React from 'react';

// Komponen dasar untuk efek pulse abu-abu lembut
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-[#E2E8F0]/80 ${className}`} />
);

export default function SkeletonPengaturan() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full relative">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden relative z-10">
        <div className="p-6 md:p-8 space-y-12">
          
          {/* SKELETON 1: Manajemen Meta Data (SEO) */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <Skeleton className="w-48 h-6 rounded-md" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Kiri: Title & Deskripsi */}
              <div className="space-y-6">
                <div>
                  <Skeleton className="w-24 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-11 rounded-xl" />
                  <Skeleton className="w-56 h-3 rounded-md mt-2" />
                </div>
                <div>
                  <Skeleton className="w-32 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-24 rounded-xl" />
                </div>
              </div>
              
              {/* Kanan: Favicon */}
              <div>
                <Skeleton className="w-36 h-4 rounded-md mb-3" />
                <div className="flex flex-wrap items-center gap-6">
                  <Skeleton className="w-24 h-24 rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="w-28 h-9 rounded-lg" />
                    <Skeleton className="w-40 h-3 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SKELETON 2: Identitas Sekolah & Media Login */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <Skeleton className="w-64 h-6 rounded-md" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            
            <div>
              <Skeleton className="w-48 h-4 rounded-md mb-2" />
              <Skeleton className="w-full h-11 rounded-xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              <div>
                <Skeleton className="w-32 h-4 rounded-md mb-3" />
                <div className="flex items-center gap-6">
                  <Skeleton className="w-24 h-24 rounded-2xl" />
                  <Skeleton className="w-28 h-9 rounded-lg" />
                </div>
              </div>
              <div>
                <Skeleton className="w-56 h-4 rounded-md mb-3" />
                <div className="flex items-center gap-6">
                  <Skeleton className="w-40 h-24 rounded-2xl" />
                  <Skeleton className="w-32 h-9 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* SKELETON 3: Konten Landing Page */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <Skeleton className="w-48 h-6 rounded-md" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div>
                  <Skeleton className="w-48 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-11 rounded-xl" />
                </div>
                <div>
                  <Skeleton className="w-48 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-24 rounded-xl" />
                </div>
              </div>
              
              <div>
                <Skeleton className="w-56 h-4 rounded-md mb-3" />
                <div className="flex items-center gap-6">
                  <Skeleton className="w-40 h-24 rounded-2xl" />
                  <Skeleton className="w-32 h-9 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* SKELETON 4: Palet Warna Aplikasi */}
          <div className="space-y-6">
            <div className="flex items-center pb-4 border-b border-gray-100">
              <Skeleton className="w-48 h-6 rounded-md" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <div className="space-y-2">
                      <Skeleton className="w-24 h-4 rounded-md" />
                      <Skeleton className="w-32 h-3 rounded-md" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-xl" />
                  </div>
                  <Skeleton className="w-full h-11 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* SKELETON 5: Konten Footer & Teks Modal */}
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <Skeleton className="w-56 h-6 rounded-md" />
              <Skeleton className="w-32 h-8 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div>
                  <Skeleton className="w-32 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-24 rounded-xl" />
                </div>
                <div>
                  <Skeleton className="w-40 h-4 rounded-md mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-11 rounded-xl" />
                    <Skeleton className="w-full h-11 rounded-xl" />
                    <Skeleton className="w-full h-11 rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Skeleton className="w-48 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-24 rounded-xl" />
                </div>
                <div>
                  <Skeleton className="w-48 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-24 rounded-xl" />
                </div>
                <div>
                  <Skeleton className="w-56 h-4 rounded-md mb-2" />
                  <Skeleton className="w-full h-24 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SKELETON FOOTER ACTIONS */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="w-full sm:w-48 h-10 rounded-xl" />
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Skeleton className="w-full sm:w-32 h-10 rounded-xl" />
            <Skeleton className="w-full sm:w-40 h-10 rounded-xl" />
          </div>
        </div>

      </div>
    </div>
  );
}