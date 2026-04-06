import React from 'react';

export default function BerandaSkeleton({ canAccsess }) {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-500">

      {/* 1. Quick Summary Cards Skeleton (4 Kotak Kecil di Atas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-4 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-slate-200/60 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 bg-slate-200/60 rounded-full w-20 animate-pulse" />
              <div className="h-4 bg-slate-300/60 rounded-full w-28 animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 2. Notifikasi Skeleton (Hanya muncul jika belum akses penuh) */}
      {!canAccsess && (
        <div className="bg-white rounded-md p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 animate-pulse"></div>
          <div className="w-14 h-14 bg-slate-200/60 rounded-2xl animate-pulse shrink-0" />
          <div className="space-y-3 flex-1 w-full">
            <div className="h-5 bg-slate-200/80 rounded-full w-64 animate-pulse" />
            <div className="h-3 bg-slate-200/60 rounded-full w-full max-w-2xl animate-pulse" />
            <div className="h-3 bg-slate-200/60 rounded-full w-3/4 max-w-xl animate-pulse" />
          </div>
          <div className="w-full md:w-32 h-12 bg-slate-200/50 rounded-xl animate-pulse shrink-0" />
        </div>
      )}

      {/* 3. Jejaring Alumni Terbaru Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200/70 rounded-lg w-56 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-full w-64 animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-md border border-slate-100 shadow-sm flex flex-col h-45">
              <div className="flex gap-4 mb-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-200/60 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col justify-start pt-1 space-y-2.5">
                  <div className="h-3.5 bg-slate-200/70 rounded-full w-full animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-1/2 animate-pulse mb-1.5" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-5/6 animate-pulse mt-2" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="h-6 w-24 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Grid 3 Kolom: Pengumuman Sekolah & Statistik Lulusan Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Bagian Kiri: Pengumuman Sekolah (2 Kolom) */}
        <div className="bg-white rounded-md lg:col-span-2 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div className="flex justify-between items-end mb-6">
            <div className="space-y-2">
              <div className="h-8 bg-slate-200/80 rounded-lg w-64 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full w-48 animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse hidden sm:block" />
          </div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="p-5 rounded-md border border-slate-100 flex flex-col sm:flex-row items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-200/60 animate-pulse shrink-0 hidden sm:block" />
                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-slate-200/80 rounded-full w-3/4 animate-pulse" />
                    <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse shrink-0 hidden sm:block" />
                  </div>
                  <div className="h-3 bg-slate-200/60 rounded-full w-full animate-pulse mt-2" />
                  <div className="h-3 bg-slate-200/60 rounded-full w-5/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bagian Kanan: Statistik Lulusan (1 Kolom) */}
        <div className="bg-slate-200/50 rounded-md p-6 sm:p-8 flex flex-col justify-center animate-pulse">
          <div className="h-6 bg-slate-300/60 rounded-lg w-40 mb-2" />
          <div className="h-3 bg-slate-300/40 rounded-full w-48 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 bg-slate-300/60 rounded-full w-24" />
                  <div className="h-3 bg-slate-300/60 rounded-full w-8" />
                </div>
                <div className="h-2.5 w-full bg-slate-300/30 rounded-full" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Lowongan Pekerjaan Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200/70 rounded-lg w-48 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-full w-64 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-slate-100 rounded-full animate-pulse hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-md overflow-hidden border border-slate-100 shadow-sm flex flex-col h-115">
              <div className="h-48 sm:h-56 bg-slate-200/50 animate-pulse w-full shrink-0" />
              <div className="p-5 pt-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-slate-200/70 rounded-full w-3/5 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded-md w-1/4 animate-pulse ml-2 shrink-0" />
                </div>
                <div className="mb-4">
                  <div className="h-2.5 bg-slate-100 rounded-full w-2/5 animate-pulse" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                  <div className="h-3.5 bg-slate-200/60 rounded-full w-3/4 animate-pulse" />
                </div>
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 self-start mb-4 border border-slate-100 w-3/4">
                  <div className="h-2.5 bg-slate-200/50 rounded-full w-5/6 animate-pulse" />
                </div>
                <div className="space-y-2 mb-6 mt-1">
                  <div className="h-2 bg-slate-100 rounded-full w-full animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-5/6 animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-4/6 animate-pulse" />
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="h-2.5 w-16 bg-slate-200/50 rounded-full animate-pulse" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Top Perusahaan Skeleton */}
      <div className="bg-white rounded-md border border-slate-100 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200/70 rounded-lg w-64 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-full w-48 animate-pulse" />
          </div>
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse hidden md:block" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-md bg-slate-50/50 border border-slate-100 gap-4">
              <div className="flex items-center gap-4 sm:gap-5 w-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-200/60 animate-pulse shrink-0" />
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-slate-200/60 rounded-full w-40 animate-pulse" />
                  <div className="h-2.5 bg-slate-100 rounded-full w-24 animate-pulse" />
                </div>
              </div>
              <div className="w-24 h-8 sm:h-10 bg-slate-100 rounded-xl animate-pulse shrink-0 self-end sm:self-auto" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}