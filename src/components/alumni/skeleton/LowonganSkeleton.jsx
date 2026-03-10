import React from 'react';

// Perhatikan: Menggunakan "export function" BUKAN "export default function"
export function LowonganSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-[1.6rem] overflow-hidden border border-primary/5 shadow-sm animate-pulse">
          <div className="h-50 bg-slate-200" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="flex gap-3">
               <div className="h-8 w-8 bg-slate-200 rounded-xl" />
               <div className="h-4 bg-slate-200 rounded w-1/2 mt-2" />
            </div>
            <div className="h-8 bg-slate-100 rounded-xl w-1/3 mt-4" />
            <div className="pt-4 border-t border-slate-50 flex justify-between">
                <div className="h-3 bg-slate-100 rounded w-1/4" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-slate-200 rounded-full" />
                    <div className="h-8 w-8 bg-slate-200 rounded-full" />
                </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Sama, menggunakan "export function"
export function MyLowonganSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-primary/5 shadow-sm animate-pulse flex flex-col sm:flex-row overflow-hidden">
          <div className="sm:w-32 h-40 sm:h-auto bg-slate-200 shrink-0" />
          <div className="flex-1 p-5 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-28" />
            </div>
            <div className="flex gap-4">
              <div className="h-3 bg-slate-100 rounded w-20" />
              <div className="h-3 bg-slate-100 rounded w-24" />
            </div>
            <div className="h-8 bg-slate-50 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}