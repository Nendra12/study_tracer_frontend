import React from "react";

export const PengumumanCardSkeleton = () => (
  <div className="bg-white rounded-md border border-gray-100 shadow-sm flex flex-col overflow-hidden h-[360px] animate-pulse">
    {/* Area Gambar Banner */}
    <div className="w-full h-32 sm:h-40 bg-gray-200 flex-shrink-0"></div>

    {/* Area Teks Konten */}
    <div className="p-5 flex flex-col gap-4 flex-1">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0"></div>
        <div className="space-y-2 flex-1 mt-1">
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <div className="h-3 bg-gray-100 rounded-md w-full"></div>
        <div className="h-3 bg-gray-100 rounded-md w-4/5"></div>
        <div className="h-3 bg-gray-100 rounded-md w-11/12"></div>
      </div>

      {/* Area Aksi Footer */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="h-4 w-16 bg-gray-200 rounded-md"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
);

export const PengumumanSidebarSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Tombol Buat Desktop */}
    <div className="hidden lg:block h-12 w-full bg-gray-200 rounded-xl"></div>

    {/* Widget Ringkasan (Menggantikan Kotak Hijau Gelap) */}
    <div className="bg-slate-200 p-6 rounded-2xl h-56 shadow-sm">
      <div className="h-5 w-48 bg-gray-300 rounded-md mb-8"></div>
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between border-b border-gray-300/40 pb-3">
            <div className="h-3 w-32 bg-gray-300 rounded-md"></div>
            <div className="h-3 w-6 bg-gray-300 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);