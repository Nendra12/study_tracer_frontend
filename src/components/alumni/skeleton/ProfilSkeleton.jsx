import React from 'react';

export default function ProfilSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {/* Navbar placeholder */}
      <div className="h-16 bg-white shadow-sm animate-pulse" />

      <main className="flex-1 w-full max-w-360 mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Profile Header skeleton */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="space-y-2">
              <div className="h-9 bg-slate-200 rounded w-48 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded w-72 animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-slate-200 rounded-xl w-40 animate-pulse" />
            </div>
          </div>
          <div className="bg-amber-50/50 rounded-2xl h-16 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-4xl p-8 border border-slate-100 shadow-sm animate-pulse">
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-full bg-slate-200" />
                <div className="h-5 bg-slate-200 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-24" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-full" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-8 bg-white rounded-4xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-2 gap-2 py-3">
              <div className="h-8 bg-slate-200 rounded w-32" />
              <div className="h-8 bg-slate-100 rounded w-28" />
              <div className="h-8 bg-slate-100 rounded w-24" />
            </div>
            {/* Tab content */}
            <div className="p-8 space-y-5">
              <div className="h-5 bg-slate-200 rounded w-40" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-24" />
                    <div className="h-10 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
