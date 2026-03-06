import React from 'react';

export default function LowonganDetailSkeleton() {
  return (
    <div className="flex-1 w-full max-w-300 mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 animate-in fade-in duration-500">
      
      {/* Tombol Kembali Skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-4 h-4 bg-slate-200/70 rounded animate-pulse" />
        <div className="h-4 w-24 bg-slate-200/70 rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- KONTEN KIRI --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Kartu Header Utama Skeleton */}
          <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden relative">
            {/* Banner Area */}
            <div className="w-full h-70 bg-slate-200/50 animate-pulse" />

            {/* Info Pekerjaan Utama */}
            <div className="p-6 md:p-8 relative bg-white -mt-10 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                <div className="space-y-4 flex-1">
                  {/* Info Perusahaan */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200/70 rounded-xl animate-pulse shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-slate-200/70 rounded-full w-48 animate-pulse" />
                      <div className="h-2.5 bg-slate-100 rounded-full w-32 animate-pulse" />
                    </div>
                  </div>

                  {/* Judul Lowongan */}
                  <div className="space-y-2 pt-2">
                    <div className="h-8 bg-slate-200/70 rounded-full w-3/4 animate-pulse" />
                    <div className="h-8 bg-slate-200/70 rounded-full w-1/2 animate-pulse" />
                  </div>

                  {/* Tag Tipe & Expired */}
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-7 w-32 bg-red-50 rounded-lg animate-pulse" />
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-3 md:flex-col lg:flex-row shrink-0 mt-2 md:mt-0">
                  <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                  <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Kartu Deskripsi Skeleton */}
          <div className="bg-white rounded-4xl p-6 md:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-6 bg-slate-200/70 rounded-full w-48 animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded-full w-11/12 animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded-full w-4/5 animate-pulse" />
              <br />
              <div className="h-3.5 bg-slate-100 rounded-full w-full animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded-full w-9/12 animate-pulse" />
            </div>
          </div>

        </div>

        {/* --- KONTEN KANAN (Sidebar) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="lg:sticky lg:top-28 space-y-6">

            {/* Card Ringkasan Info Skeleton */}
            <div className="bg-white rounded-4xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="h-4 bg-slate-200/70 rounded-full w-32 animate-pulse mb-2 border-b border-slate-100 pb-4" />

              <div className="space-y-6 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-slate-100 rounded-full animate-pulse shrink-0" />
                    <div className="space-y-2 w-full pt-1">
                      <div className="h-2.5 bg-slate-100 rounded-full w-20 animate-pulse" />
                      <div className="h-3.5 bg-slate-200/60 rounded-full w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Skeleton */}
              <div className="pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-4 bg-slate-200/70 rounded-sm animate-pulse" />
                  <div className="h-3 bg-slate-100 rounded-full w-24 animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-7 w-16 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-7 w-14 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* TIPS MELAMAR Skeleton */}
            <div className="bg-primary/10 rounded-4xl p-7 border border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/20 rounded-xl animate-pulse" />
                <div className="h-6 bg-primary/20 rounded-full w-32 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="flex gap-2.5">
                  <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse mt-1" />
                  <div className="h-3 bg-primary/20 rounded-full w-full animate-pulse mt-1" />
                </div>
                <div className="flex gap-2.5">
                  <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse mt-1" />
                  <div className="h-3 bg-primary/20 rounded-full w-5/6 animate-pulse mt-1" />
                </div>
                <div className="flex gap-2.5">
                  <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse mt-1" />
                  <div className="h-3 bg-primary/20 rounded-full w-4/6 animate-pulse mt-1" />
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}