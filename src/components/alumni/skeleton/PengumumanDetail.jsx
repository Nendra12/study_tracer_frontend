import React from 'react';

export default function PengumumanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 pt-28 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Tombol Kembali Skeleton */}
        <div className="w-56 h-10 bg-slate-200/70 rounded-md animate-pulse"></div>

        {/* Card Detail Utama Skeleton */}
        <div className="bg-white rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          
          {/* Banner Image Skeleton */}
          <div className="w-full h-56 md:h-80 bg-slate-200 animate-pulse"></div>

          {/* Konten Text Skeleton */}
          <div className="p-6 md:p-10">
            {/* Header Judul */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
              {/* Box Ikon Megaphone */}
              <div className="w-[3.25rem] h-[3.25rem] rounded-2xl bg-slate-200 animate-pulse flex-shrink-0"></div>
              
              <div className="pt-1 flex-1 space-y-3 w-full">
                {/* Judul (2 Baris) */}
                <div className="h-7 md:h-9 bg-slate-200 rounded-xl w-3/4 animate-pulse"></div>
                <div className="h-7 md:h-9 bg-slate-200 rounded-xl w-1/2 animate-pulse"></div>
                {/* Tanggal */}
                <div className="h-4 bg-slate-200/70 rounded-lg w-48 mt-2 animate-pulse"></div>
              </div>
            </div>

            <hr className="border-slate-100 mb-6" />

            {/* Teks Konten Skeleton (Bentuk Paragraf) */}
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-11/12 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-4/5 animate-pulse"></div>
            </div>
            
            {/* Paragraf 2 */}
            <div className="space-y-3 mt-6">
              <div className="h-4 bg-slate-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-10/12 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded-lg w-1/2 animate-pulse"></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export const PengumumanDetailSkeleton2 = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12 pt-28 px-4 sm:px-6">
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Tombol Kembali Skeleton */}
        <div className="mb-6">
          <div className="h-10 w-64 bg-slate-200 rounded-md animate-pulse"></div>
        </div>

        {/* --- GRID LAYOUT UTAMA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* KOLOM KIRI (Konten Utama) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
              
              {/* Gambar Banner Skeleton */}
              <div className="w-full h-56 md:h-[400px] bg-slate-200 animate-pulse"></div>

              {/* Isi Konten Skeleton */}
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                  {/* Icon Megaphone Kotak Skeleton */}
                  <div className="w-[50px] h-[50px] rounded-2xl bg-slate-200 animate-pulse flex-shrink-0"></div>
                  
                  {/* Judul & Tanggal Skeleton */}
                  <div className="pt-1 w-full">
                    <div className="h-7 md:h-9 bg-slate-200 rounded-md w-3/4 mb-3 animate-pulse"></div>
                    <div className="h-7 md:h-9 bg-slate-200 rounded-md w-1/2 mb-4 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded-md w-48 animate-pulse"></div>
                  </div>
                </div>

                <hr className="border-slate-100 mb-6" />

                {/* Paragraf Teks Skeleton */}
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-[95%] animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-[90%] animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-[85%] animate-pulse"></div>
                  <br />
                  <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-[92%] animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-[60%] animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN (Sidebar Daftar Pengumuman Skeleton) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-md shadow-sm border border-slate-100 p-5 sticky top-28">
              
              {/* Header Sidebar Skeleton */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="w-5 h-5 bg-slate-200 rounded-md animate-pulse"></div>
                <div className="h-5 bg-slate-200 rounded-md w-40 animate-pulse"></div>
              </div>
              
              {/* List Item Skeleton (Diulang 4 kali agar pas dengan sidebar asli) */}
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex gap-3 p-2.5">
                    {/* Thumbnail Skeleton */}
                    <div className="w-16 h-16 shrink-0 rounded-md bg-slate-200 animate-pulse"></div>
                    
                    {/* Detail Teks Item Skeleton */}
                    <div className="flex-1 flex flex-col justify-center space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-slate-200 rounded w-24 mt-1 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};