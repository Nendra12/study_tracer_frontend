import React from 'react';

export default function ProfilSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Profile Header skeleton */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="h-9 bg-slate-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-72 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-slate-200 rounded-xl w-40 animate-pulse" />
            </div>
          </div>
          <div className="bg-amber-50/50 rounded-2xl h-16 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar skeleton (Kolom Kiri) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Kartu 1: Info Profil Utama */}
            <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-full bg-slate-200" />
                <div className="h-5 bg-slate-200 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-24" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>

            {/* Kartu 2: Tautan Sosial (TAMBAHAN BARU SESUAI GAMBAR) */}
            <div className="bg-white rounded-4xl p-6 border border-slate-100 shadow-sm animate-pulse">
              <div className="flex justify-between items-center mb-6">
                <div className="h-5 bg-slate-200 rounded w-32" /> {/* Judul */}
                <div className="h-5 bg-slate-100 rounded w-12" /> {/* Tombol Edit */}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" /> {/* Ikon Sosial */}
                <div className="h-4 bg-slate-100 rounded w-40" /> {/* Teks Link */}
              </div>
            </div>
          </div>

          {/* Main content skeleton (Kolom Kanan) */}
          <div className="lg:col-span-8 bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
            
            {/* Tabs Sesuai Desain Asli (Ikon + Teks) */}
            <div className="flex border-b border-slate-100 px-2 sm:px-6 pt-5 overflow-x-auto no-scrollbar w-full">
              {/* Tab 1 (Aktif) */}
              <div className="flex items-center justify-center gap-2 pb-3 border-b-2 border-slate-300 flex-1 min-w-[140px]">
                <div className="w-4 h-4 bg-slate-200 rounded-sm shrink-0" />
                <div className="h-4 bg-slate-200 rounded w-24" />
              </div>
              {/* Tab 2 (Tidak aktif) */}
              <div className="flex items-center justify-center gap-2 pb-3 flex-1 min-w-[140px] opacity-70">
                <div className="w-4 h-4 bg-slate-100 rounded-sm shrink-0" />
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
              {/* Tab 3 (Tidak aktif) */}
              <div className="flex items-center justify-center gap-2 pb-3 flex-1 min-w-[140px] opacity-70">
                <div className="w-4 h-4 bg-slate-100 rounded-sm shrink-0" />
                <div className="h-4 bg-slate-100 rounded w-24" />
              </div>
              {/* Tab 4 (Tidak aktif) */}
              <div className="flex items-center justify-center gap-2 pb-3 flex-1 min-w-[140px] opacity-70">
                <div className="w-4 h-4 bg-slate-100 rounded-sm shrink-0" />
                <div className="h-4 bg-slate-100 rounded w-16" />
              </div>
              {/* Tab 5 (Tidak aktif) */}
              <div className="flex items-center justify-center gap-2 pb-3 flex-1 min-w-[140px] opacity-70">
                <div className="w-4 h-4 bg-slate-100 rounded-sm shrink-0" />
                <div className="h-4 bg-slate-100 rounded w-20" />
              </div>
            </div>

            {/* Tab content */}
            <div className="p-8 space-y-5">
              <div className="flex justify-between items-start mb-6">
                 <div className="space-y-2">
                    <div className="h-6 bg-slate-200 rounded w-40" />
                    <div className="h-4 bg-slate-100 rounded w-64" />
                 </div>
                 <div className="h-10 bg-slate-100 rounded-xl w-28" /> {/* Tombol Edit Data */}
              </div>

              <div className="space-y-6 pt-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-24" /> {/* Label input */}
                    <div className="h-12 bg-slate-50 rounded-xl w-full border border-slate-100" /> {/* Kolom input */}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}