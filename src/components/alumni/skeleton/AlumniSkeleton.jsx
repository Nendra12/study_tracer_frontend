import React from 'react';

export default function AlumniSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-primary/5 shadow-md animate-pulse">
          <div className="h-56 bg-slate-200" />
          <div className="p-6 pt-4 space-y-4">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 bg-slate-200 rounded w-32" />
              <div className="h-3 bg-slate-100 rounded w-20" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
