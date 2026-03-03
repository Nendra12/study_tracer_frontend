import React from 'react';

const JawabanDetailSkeleton = () => {
  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen animate-pulse pb-20">
      
      {/* --- HEADER NAVIGASI SKELETON --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-10 w-20 bg-slate-200 rounded-xl flex-1 sm:flex-none"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-xl flex-1 sm:flex-none"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- KOLOM KIRI: Profile Alumni Skeleton --- */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            {/* Header Dekoratif */}
            <div className="h-24 bg-slate-200 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="w-20 h-20 rounded-full border-[3px] border-white bg-slate-100 shadow-sm"></div>
              </div>
            </div>

            {/* Konten Profil */}
            <div className="pt-12 pb-6 px-6 flex flex-col items-center">
              <div className="h-6 w-40 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 w-24 bg-slate-100 rounded mb-4"></div>
              
              <div className="h-6 w-20 bg-slate-100 rounded-full mb-6"></div>

              <div className="w-full space-y-4 border-t border-slate-100 pt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-slate-100 rounded"></div>
                    <div className="h-4 flex-1 bg-slate-50 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistik Progress Skeleton */}
            <div className="px-6 pb-6 border-t border-slate-100 pt-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex justify-between mb-3">
                  <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  <div className="h-4 w-8 bg-slate-200 rounded"></div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-3"></div>
                <div className="flex justify-between">
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: Detail Jawaban Skeleton --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-7 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                <div className="flex gap-4 pt-2">
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  <div className="h-3 w-28 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
            </div>
          </div>

          {/* Questions List Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((q) => (
              <div key={q} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex gap-4 mb-5">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-slate-100"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-full bg-slate-100 rounded"></div>
                    <div className="h-5 w-2/3 bg-slate-100 rounded"></div>
                  </div>
                </div>
                
                {/* Opsi Jawaban / Essay Siluet */}
                <div className="pl-11 space-y-3">
                  {q % 2 === 0 ? (
                    // Essay Look
                    <div className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                  ) : (
                    // Multiple Choice Look
                    [1, 2, 3].map((o) => (
                      <div key={o} className="h-11 w-full bg-white border border-slate-100 rounded-xl flex items-center px-4">
                         <div className="w-4 h-4 rounded-full bg-slate-100 mr-3"></div>
                         <div className="h-3 w-32 bg-slate-50 rounded"></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default JawabanDetailSkeleton;