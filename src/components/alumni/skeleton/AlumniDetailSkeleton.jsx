import React from 'react';

export default function AlumniDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col animate-in fade-in duration-500">
      
      {/* BACKGROUND HERO (Meniru gradien hijau toska) */}
      <div className="relative h-64 md:h-80 bg-slate-300/40 overflow-hidden animate-pulse">
        <svg className="absolute bottom-0 left-0 w-full h-16" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8f9fa" d="M0,60L120,55C240,50,480,40,720,42C960,44,1200,58,1320,65L1440,72L1440,100L0,100Z" />
        </svg>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-360 mx-auto px-4 sm:px-6 lg:px-12 relative z-20 -mt-32 pb-20">
        
        {/* Tombol Kembali Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
          <div className="h-3 w-32 bg-slate-300 rounded-full animate-pulse" />
        </div>

        {/* PROFILE HEADER CARD SKELETON */}
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-6 md:p-10 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Foto Profil */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl border-8 border-white shadow-2xl bg-slate-200 animate-pulse" />
              <div className="absolute -bottom-2 -right-2 w-20 h-6 rounded-full bg-slate-300 border-4 border-white animate-pulse" />
            </div>

            {/* Info Nama & Jurusan */}
            <div className="flex-1 space-y-4 w-full">
              <div className="h-10 bg-slate-200 rounded-full w-2/3 md:w-1/2 animate-pulse" />
              
              <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-slate-100 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN CONTENT SKELETON */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* --- SIDEBAR KIRI SKELETON --- */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Status Karier Skeleton */}
            <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2 w-20 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-4/5 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Akademik Skeleton */}
            <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-36 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-2 w-20 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Skills Skeleton */}
            <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 w-16 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            </div>

          </div>

          {/* --- KONTEN KANAN (Riwayat) SKELETON --- */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Riwayat Karier Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-6 h-6 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-5 w-40 bg-slate-200 rounded-full animate-pulse" />
              </div>
              
              {/* Timeline Items */}
              <div className="relative pl-8 border-l-2 border-slate-100 space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-10.25 top-0 w-5 h-5 rounded-full bg-slate-200 border-4 border-white animate-pulse" />
                    <div className="space-y-3">
                      <div className="h-2.5 w-24 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-5 w-64 bg-slate-300 rounded-full animate-pulse mt-1" />
                      <div className="h-3.5 w-48 bg-slate-200 rounded-full animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Note Skeleton */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex justify-center">
               <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse" />
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}