import React from "react";

export const JobCardSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-pulse">
    <div className="flex flex-col sm:flex-row gap-5 flex-1 w-full">
      <div className="w-full sm:w-24 h-24 rounded-xl bg-gray-200 flex-shrink-0"></div>
      <div className="space-y-3 flex-1">
        <div className="flex gap-2">
          <div className="h-5 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-5 w-32 bg-gray-100 rounded-md"></div>
        </div>
        <div className="space-y-2">
          <div className="h-6 w-3/4 bg-gray-200 rounded-md"></div>
          <div className="h-4 w-1/2 bg-gray-100 rounded-md"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-3 w-10 bg-gray-100 rounded"></div>
          <div className="h-3 w-10 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
    <div className="h-10 w-24 bg-gray-50 rounded-xl hidden md:block"></div>
  </div>
);

export const JobSidebarSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    </div>
    <div className="bg-slate-200 p-6 rounded-2xl h-52 shadow-sm">
      <div className="h-6 w-32 bg-gray-300 rounded mb-6"></div>
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex justify-between border-b border-white/20 pb-2">
            <div className="h-3 w-24 bg-gray-300 rounded"></div>
            <div className="h-3 w-8 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);