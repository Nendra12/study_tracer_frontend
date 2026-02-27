import React from 'react';

const KuesionerSkeleton = () => {
  return (
    <div className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen animate-pulse">
      {/* Header Buttons Skeleton */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <div className="w-full sm:w-48 h-12 bg-slate-200 rounded-xl"></div>
        <div className="w-full sm:w-40 h-12 bg-white border border-slate-200 rounded-xl"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-24">
            <div className="w-20 h-3 bg-slate-200 rounded mb-3"></div>
            <div className="w-12 h-8 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Categories Filter Skeleton */}
      <div className="flex gap-2 mb-6 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-24 h-10 bg-white border border-slate-200 rounded-lg flex-shrink-0"></div>
        ))}
      </div>

      {/* Question Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm h-32 flex gap-4">
            <div className="w-1 h-full bg-slate-200 rounded hidden sm:block"></div>
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <div className="w-24 h-5 bg-slate-200 rounded"></div>
                <div className="w-16 h-5 bg-slate-100 rounded"></div>
              </div>
              <div className="w-3/4 h-6 bg-slate-200 rounded"></div>
              <div className="w-1/2 h-4 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KuesionerSkeleton;