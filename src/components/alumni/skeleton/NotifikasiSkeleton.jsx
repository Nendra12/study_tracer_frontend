import React from 'react';

export default function NotifikasiSkeleton() {
  // Membuat array berisi 5 item kosong untuk merender 5 baris skeleton
  const skeletonItems = Array.from({ length: 5 });

  return (
    <div className="space-y-3 w-full">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 md:p-5 rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse"
        >
          {/* Box Ikon Skeleton */}
          <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>

          {/* Area Konten Skeleton */}
          <div className="flex-1 min-w-0 pt-0.5 space-y-3">
            
            {/* Baris Judul & Waktu */}
            <div className="flex justify-between items-start gap-2">
              <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded-md w-16 shrink-0 mt-0.5"></div>
            </div>
            
            {/* Baris Pesan (2 baris) */}
            <div className="space-y-1.5 pr-6">
              <div className="h-3 bg-slate-200 rounded-md w-full"></div>
              <div className="h-3 bg-slate-200 rounded-md w-3/5"></div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}