import React from 'react';

const TambahKuesionerSkeleton = () => {
  return (
    <div className="space-y-6 max-w-full p-1 animate-pulse">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER SKELETON --- */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
          <div className="h-10 w-32 bg-slate-200 rounded-xl"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --- LEFT BOX: Konfigurasi Skeleton (Col 4) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="h-6 w-40 bg-slate-200 rounded mb-8"></div>
              
              <div className="space-y-6">
                {/* Title Input Placeholder */}
                <div className="space-y-3">
                  <div className="h-3 w-16 bg-slate-100 rounded"></div>
                  <div className="h-11 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                </div>

                {/* Dropdown Placeholder */}
                <div className="space-y-3">
                  <div className="h-3 w-24 bg-slate-100 rounded"></div>
                  <div className="h-11 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                </div>

                {/* Date Range Placeholder */}
                <div className="space-y-3">
                  <div className="h-3 w-32 bg-slate-100 rounded"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-11 bg-slate-50 border border-slate-100 rounded-xl"></div>
                    <div className="h-11 bg-slate-50 border border-slate-100 rounded-xl"></div>
                  </div>
                </div>

                {/* Textarea Placeholder */}
                <div className="space-y-3">
                  <div className="h-3 w-28 bg-slate-100 rounded"></div>
                  <div className="h-28 w-full bg-slate-50 border border-slate-100 rounded-xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT BOX: Daftar Pertanyaan Skeleton (Col 8) --- */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[600px]">
              
              {/* Toolbar Pertanyaan */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <div className="h-6 w-56 bg-slate-200 rounded"></div>
                <div className="h-9 w-40 bg-slate-100 rounded-lg"></div>
              </div>

              {/* Question Cards Silhouettes */}
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl space-y-4">
                    <div className="flex gap-4">
                      {/* Number box */}
                      <div className="shrink-0 w-8 h-8 bg-slate-200 rounded-lg"></div>
                      {/* Question input area */}
                      <div className="grow space-y-4">
                        <div className="h-20 w-full bg-white border border-slate-100 rounded-xl"></div>
                        
                        {/* Options silhouettes */}
                        <div className="space-y-3 ml-2">
                          {[1, 2, 3].map((opt) => (
                            <div key={opt} className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0"></div>
                              <div className="h-10 grow bg-white border border-slate-100 rounded-xl"></div>
                            </div>
                          ))}
                          <div className="h-4 w-24 bg-slate-200 rounded ml-7 mt-2"></div>
                        </div>
                      </div>
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

export default TambahKuesionerSkeleton;