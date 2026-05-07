import React from 'react';

export default function PostinganSkeleton() {
  // Kita buat 3 dummy skeleton agar terlihat penuh seperti feed
  const skeletonItems = [1, 2, 3];

  return (
    <div className="w-full flex flex-col gap-6 animate-pulse">
      {skeletonItems.map((item) => (
        <article key={item} className="w-full rounded-md border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 w-full">
            
            {/* Header Skeleton: Avatar, Nama, Jurusan & Waktu */}
            <header className="flex items-start justify-between gap-4 w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Placeholder */}
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex flex-col gap-2">
                  {/* Nama Placeholder */}
                  <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
                  {/* Jurusan Placeholder */}
                  <div className="h-3 w-16 bg-slate-200 rounded-md"></div>
                </div>
              </div>
              
              {/* Waktu & Menu Placeholder */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-3 w-14 bg-slate-200 rounded-md"></div>
                <div className="h-6 w-6 bg-slate-200 rounded-md"></div>
              </div>
            </header>

            {/* Body Text Skeleton */}
            <div className="mt-5 w-full flex flex-col gap-2.5">
              <div className="h-3.5 w-full bg-slate-200 rounded-md"></div>
              <div className="h-3.5 w-5/6 bg-slate-200 rounded-md"></div>
              {/* Buat variasi panjang teks untuk setiap kotak */}
              {item !== 2 && <div className="h-3.5 w-2/3 bg-slate-200 rounded-md"></div>}
            </div>

            {/* Variasi: Tambahkan skeleton gambar khusus untuk item ke-2 */}
            {item === 2 && (
              <div className="mt-4 w-full h-64 bg-slate-200 rounded-md"></div>
            )}

            {/* Footer Actions Skeleton: Tombol Suka & Komentar */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex gap-3 w-full">
              <div className="h-8 w-20 bg-slate-200 rounded-md"></div>
              <div className="h-8 w-28 bg-slate-200 rounded-md"></div>
            </div>

          </div>
        </article>
      ))}
    </div>
  );
}