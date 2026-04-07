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