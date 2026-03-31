import React from 'react';

export default function PengumumanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-10 pt-6 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Tombol Kembali Skeleton */}
        <div className="w-56 h-10 bg-gray-200 rounded-xl animate-pulse"></div>

        {/* Card Detail Utama Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Banner Image Skeleton */}
          <div className="w-full h-64 md:h-80 bg-gray-200 animate-pulse"></div>

          {/* Konten Text Skeleton */}
          <div className="p-6 md:p-10">
            {/* Header Judul */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 mb-8">
              {/* Box Ikon Megaphone */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0"></div>
              
              <div className="pt-1 flex-1 space-y-3 w-full">
                {/* Judul (2 Baris) */}
                <div className="h-8 md:h-10 bg-gray-200 rounded-xl w-3/4 animate-pulse"></div>
                <div className="h-8 md:h-10 bg-gray-200 rounded-xl w-1/2 animate-pulse"></div>
                {/* Tanggal & Badge ID */}
                <div className="flex gap-3 mt-4">
                  <div className="h-5 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                  <div className="h-5 bg-gray-100 rounded-lg w-32 animate-pulse hidden sm:block"></div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100 mb-8" />

            {/* Teks Konten Skeleton (Bentuk Paragraf) */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-11/12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-4/5 animate-pulse"></div>
            </div>
            
            {/* Paragraf 2 */}
            <div className="space-y-4 mt-8">
              <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-10/12 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}