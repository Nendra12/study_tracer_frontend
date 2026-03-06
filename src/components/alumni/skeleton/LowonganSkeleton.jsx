import React from 'react';

export default function LowonganSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-primary/5 shadow-sm animate-pulse">
          <div className="h-56 bg-slate-200" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-100 rounded w-1/3 mt-4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
