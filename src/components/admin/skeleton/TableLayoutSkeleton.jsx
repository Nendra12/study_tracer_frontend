import React from 'react';

const TableLayoutSkeleton = ({ tableCount = 2 }) => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri - Looping Tabel Skeleton */}
        <div className="lg:col-span-8 space-y-6 order-last lg:order-first">
          {Array.from({ length: tableCount }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="w-40 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="w-28 h-8 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="p-4">
                <div className="w-full h-10 bg-gray-200 rounded-xl"></div>
              </div>
              <div className="p-4 space-y-4">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Kolom Kanan - Skeleton Panel Ekspor */}
        <div className="lg:col-span-4 space-y-4 order-first lg:order-last">
          <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-6 sticky top-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-32 h-5 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
                <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="w-28 h-3 bg-gray-200 rounded"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="w-full h-10 bg-gray-200 rounded-lg mt-4"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TableLayoutSkeleton;