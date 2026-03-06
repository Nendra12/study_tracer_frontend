import React from 'react';

export default function BerandaSkeleton() {
  return (
    <div className="max-w-360 mx-auto px-6 lg:px-12 -mt-16 pb-20 w-full animate-in fade-in duration-500">
      
      {/* 1. Notifikasi Skeleton */}
      <div className="mb-12 flex flex-col gap-4">
        <div className="bg-white rounded-3xl p-5 md:p-6 flex items-center gap-5 border border-slate-100 shadow-sm">
          <div className="w-14 h-14 bg-slate-200/60 rounded-2xl animate-pulse shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-slate-200/60 rounded-full w-48 animate-pulse" />
            <div className="h-2.5 bg-slate-100 rounded-full w-full max-w-2xl animate-pulse" />
            <div className="h-2.5 bg-slate-100 rounded-full w-3/4 max-w-xl animate-pulse" />
          </div>
          <div className="w-32 h-10 bg-slate-200/50 rounded-xl animate-pulse shrink-0 hidden md:block" />
        </div>
      </div>

      {/* 2. Jejaring Alumni Terbaru Skeleton */}
      <div className="mb-16">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200/70 rounded-lg w-64 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-full w-48 animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse" />
        </div>
        
        {/* Grid 4 Kolom: Desain Card Kiri-Kanan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-45">
              <div className="flex gap-4 mb-5">
                <div className="w-22 h-22 rounded-2xl bg-slate-200/60 animate-pulse shrink-0" />
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

      {/* 3. Lowongan Pekerjaan Skeleton (Bentuk Menyerupai Kartu Asli) */}
      <div className="mb-16">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200/70 rounded-lg w-56 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-full w-64 animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-slate-100 rounded-full animate-pulse" />
        </div>
        
        {/* Grid 4 Kolom: Desain Sesuai Gambar Poster Job */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-115">
              
              {/* Gambar Banner Atas */}
              <div className="h-56 bg-slate-200/50 animate-pulse w-full" />

              {/* Konten Bawah */}
              <div className="p-5 pt-4 flex flex-col flex-1">
                
                {/* Judul & Badge Tanggal Merah */}
                <div className="flex justify-between items-start mb-2">
                  <div className="h-5 bg-slate-200/70 rounded-full w-3/5 animate-pulse" />
                  <div className="h-4 bg-red-50 rounded-md w-1/4 animate-pulse ml-2 shrink-0" />
                </div>

                {/* Sub-judul "Berakhir: ..." */}
                <div className="mb-4">
                  <div className="h-2.5 bg-slate-100 rounded-full w-2/5 animate-pulse" />
                </div>

                {/* Info Perusahaan */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                  <div className="h-3.5 bg-slate-200/60 rounded-full w-3/4 animate-pulse" />
                </div>

                {/* Info Lokasi (Dalam Box Abu-abu) */}
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 self-start mb-4 border border-slate-100 w-3/4">
                  <div className="h-2.5 bg-slate-200/50 rounded-full w-5/6 animate-pulse" />
                </div>

                {/* Deskripsi (3 baris) */}
                <div className="space-y-2 mb-6 mt-1">
                  <div className="h-2 bg-slate-100 rounded-full w-full animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-5/6 animate-pulse" />
                  <div className="h-2 bg-slate-100 rounded-full w-4/6 animate-pulse" />
                </div>

                {/* Footer (Tipe & Ikon Action) */}
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

      {/* 4. Top Perusahaan Skeleton */}
      <div className="mb-10">
        <div className="bg-white rounded-4xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-2">
              <div className="h-8 bg-slate-200/70 rounded-lg w-64 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full w-48 animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse hidden md:block" />
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="flex items-center gap-5 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200/60 animate-pulse shrink-0" />
                  <div className="space-y-2.5 w-full">
                    <div className="h-4 bg-slate-200/60 rounded-full w-40 animate-pulse" />
                    <div className="h-2.5 bg-slate-100 rounded-full w-24 animate-pulse" />
                  </div>
                </div>
                <div className="w-24 h-10 bg-slate-100 rounded-xl animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}