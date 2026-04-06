import React from 'react';

const KuesionerSkeleton = () => {
  return (
    <div className="py-10 animate-pulse">
      <div className="max-w-3xl mx-auto w-full px-4 space-y-6">
        
        {/* --- SKELETON HEADER CARD --- */}
        <div className="bg-white rounded-xl mt-25 border border-gray-200 overflow-hidden mb-6 shadow-sm">
          <div className="h-2 w-full bg-slate-200"></div>
          <div className="p-7">
            {/* Judul & Deskripsi */}
            <div className="h-8 w-2/3 bg-slate-200 rounded-lg mb-4"></div>
            <div className="space-y-2 mb-6">
              <div className="h-4 w-full bg-slate-200 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-200 rounded"></div>
            </div>
            
            <div className="border-t border-gray-100 my-5"></div>
            
            {/* Box Waktu */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 h-16 flex flex-col justify-center">
                <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
              </div>
              <div className="bg-red-50/50 rounded-lg px-4 py-3 border border-red-50 h-16 flex flex-col justify-center">
                <div className="h-3 w-24 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SKELETON QUESTION LIST --- */}
        {/* Membuat 3 dummy pertanyaan */}
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            {/* Judul Pertanyaan */}
            <div className="flex gap-4 mb-6">
              <div className="flex-none">
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
              </div>
              <div className="flex-1 self-center space-y-2">
                <div className="h-5 w-full bg-slate-200 rounded"></div>
                <div className="h-5 w-2/3 bg-slate-200 rounded"></div>
              </div>
            </div>

            {/* Pilihan Ganda (4 Opsi) */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((opt) => (
                <div key={opt} className="flex items-center p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded ml-4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* --- SKELETON TOMBOL SIMPAN --- */}
        <div className="flex justify-end pt-4">
          <div className="w-48 h-12 bg-slate-200 rounded-xl"></div>
        </div>

      </div>
    </div>
  );
};

export default KuesionerSkeleton;