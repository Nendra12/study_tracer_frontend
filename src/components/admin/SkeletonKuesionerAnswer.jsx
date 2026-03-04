import React from 'react';

const SkeletonKuesionerAnswer = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse p-1">
      {/* Skeleton Header Kuesioner */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        <div className="h-2 w-full bg-slate-200"></div>
        <div className="p-7">
          <div className="h-8 bg-slate-200 rounded-md w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
          <div className="border-t border-gray-100 mt-8"></div>
        </div>
      </div>

      {/* Skeleton Grid Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((item) => (
          <div 
            key={item} 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Skeleton Header Card */}
            <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
              <div className="flex justify-between items-center mb-3">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-6 bg-white rounded-full w-20"></div>
              </div>
              <div className="h-5 bg-slate-200 rounded w-full"></div>
            </div>

            {/* Skeleton Chart Area */}
            <div className="p-10 flex flex-col items-center justify-center space-y-6">
              {/* Lingkaran Donut (Simulasi) */}
              <div className="relative flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-[16px] border-slate-100"></div>
                <div className="absolute flex flex-col items-center">
                   <div className="h-3 bg-slate-100 rounded w-10 mb-2"></div>
                   <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
              </div>
              
              {/* Legend area */}
              <div className="flex gap-4 w-full justify-center">
                <div className="h-3 bg-slate-100 rounded w-16"></div>
                <div className="h-3 bg-slate-100 rounded w-16"></div>
                <div className="h-3 bg-slate-100 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonKuesionerAnswer;