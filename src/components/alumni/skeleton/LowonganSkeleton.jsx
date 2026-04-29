import React from 'react';

// Perhatikan: Menggunakan "export function" BUKAN "export default function"
export function LowonganSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-md overflow-hidden border border-primary/5 shadow-sm animate-pulse flex flex-col h-full">
          {/* Skeleton Poster Image */}
          <div className="h-[200px] w-full bg-slate-200 relative shrink-0">
            {/* Skeleton Sesuai Skill Badge */}
            <div className="absolute top-3 left-3 h-6 w-24 bg-white/60 rounded-lg" />
          </div>

          <div className="px-5 pt-4 pb-5 space-y-4 flex flex-col flex-1">
            {/* Skeleton Title */}
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            
            {/* Skeleton Company */}
            <div className="flex items-center gap-3">
               <div className="h-9 w-9 bg-slate-100 rounded-xl shrink-0" />
               <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>

            {/* Skeleton Location */}
            <div className="h-8 bg-slate-100 rounded-xl w-3/4" />

            {/* Skeleton Skills */}
            <div className="mt-auto pt-2 space-y-2">
                <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                <div className="flex gap-2">
                    <div className="h-6 bg-slate-100 rounded-lg w-16" />
                    <div className="h-6 bg-slate-100 rounded-lg w-20" />
                </div>
            </div>

            {/* Skeleton Footer (Tipe Pekerjaan & 3 Bulatan Tombol) */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-2">
                <div className="h-3 bg-slate-200 rounded w-1/4" />
                <div className="flex gap-2">
                    {/* 3 Bulatan ke pojok kanan */}
                    <div className="h-8 w-8 bg-slate-100 rounded-full border border-slate-200" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full border border-slate-200" />
                    <div className="h-8 w-8 bg-slate-300 rounded-full" /> {/* Sedikit lebih gelap untuk tombol panah */}
                </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Sama, menggunakan "export function"
export function MyLowonganSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-primary/5 shadow-sm animate-pulse flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:w-32 h-40 sm:h-auto bg-slate-200 shrink-0" />
          <div className="flex-1 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-28" />
            </div>
            <div className="flex gap-4">
              <div className="h-3 bg-slate-100 rounded w-20" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
            <div className="h-8 bg-slate-50 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}