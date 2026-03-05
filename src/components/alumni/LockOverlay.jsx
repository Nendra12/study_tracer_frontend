import React from 'react';

export default function BerandaSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 -mt-16 pb-20 w-full">
      <div className="mb-12 bg-white rounded-2xl h-24 animate-pulse" />
      <div className="mb-16">
        <div className="h-8 bg-slate-200 rounded w-64 animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />)}
        </div>
      </div>
      <div className="mb-16">
        <div className="h-8 bg-slate-200 rounded w-64 animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-3xl h-80 animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}