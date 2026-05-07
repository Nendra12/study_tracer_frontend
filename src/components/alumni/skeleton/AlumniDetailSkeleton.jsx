import React from 'react';
import { School, BriefcaseBusiness, Star, Clock, Briefcase } from 'lucide-react';

export default function AlumniDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col animate-in fade-in duration-500">
      
      {/* ===== GRADIENT HEADER MOCK ===== */}
      <div className="h-42 md:h-52 w-full bg-slate-200 animate-pulse relative"></div>

      <main className="flex-1 transition-all duration-500 pb-20 relative max-w-7xl mx-auto px-6 lg:px-8 w-full">

        {/* ===== PROFILE HEADER ===== */}
        <div className="relative -mt-16 lg:-mt-20 flex flex-col lg:flex-row gap-6 lg:gap-8 items-start mb-10">

          {/* Photo & Mobile Info Wrapper */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-8 items-center lg:items-start w-full lg:w-auto">
            
            {/* Photo Skeleton */}
            <div className="shrink-0 relative z-10">
              <div className="w-50 h-50 lg:w-66 lg:h-66 lg:rounded-[60px] rounded-[30px] border-[4px] lg:border-[6px] border-white bg-slate-200 animate-pulse shadow-md"></div>
            </div>

            {/* Mobile Info Skeleton - Hidden on lg+ */}
            <div className="flex-1 min-w-0 lg:hidden flex flex-col items-center w-full pb-2 px-4 space-y-3">
              <div className="h-7 w-48 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-64 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="flex gap-2 justify-center mt-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-200 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Info & Shared Bottom Sections */}
          <div className="flex-1 w-full lg:self-end lg:mt-24 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">

            <div className="flex-1 min-w-0 w-full">
              {/* Desktop Info - Hidden on mobile/tablet */}
              <div className="hidden lg:block space-y-3">
                <div className="h-8 w-64 bg-slate-200 rounded-full animate-pulse mb-4"></div>
                <div className="h-5 w-80 bg-slate-200 rounded-full animate-pulse"></div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex gap-3 w-full lg:w-auto mt-6">
                <div className="h-11 lg:h-10 w-full lg:w-32 bg-slate-200 rounded-xl lg:rounded-md animate-pulse"></div>
                <div className="h-11 lg:h-10 w-full lg:w-32 bg-slate-200 rounded-xl lg:rounded-md animate-pulse"></div>
              </div>
            </div>

            <div className="flex flex-col print:hidden items-start lg:items-end gap-4 shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
              {/* Social Icons Desktop Skeleton */}
              <div className="hidden lg:flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-7 h-7 rounded-full bg-slate-200 animate-pulse"></div>
                ))}
              </div>

              {/* Stats Skeleton */}
              <div className="grid grid-cols-3 lg:flex gap-4 lg:gap-8 text-center mt-2 w-full lg:w-auto bg-slate-50 lg:bg-transparent rounded-2xl lg:rounded-none p-4 lg:p-0 border lg:border-none border-slate-100">
                {[1, 2, 3].map((i, idx) => (
                  <div key={i} className={`flex flex-col items-center ${idx !== 0 ? 'border-l border-slate-200 lg:border-none pl-4 lg:pl-0' : ''}`}>
                    <div className="h-3 w-16 bg-slate-200 rounded-full animate-pulse mb-2"></div>
                    <div className="h-8 w-20 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ===== SKILLS SKELETON ===== */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Star size={24} className="text-slate-300" />
            <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 w-24 bg-slate-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* ===== INFO AKADEMIK & STATUS KARIER - 2 COLUMNS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-16">

          {/* Informasi Akademik Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <School size={24} className="text-slate-300" />
              <div className="h-6 w-48 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
            <div className="border-t border-slate-200 flex flex-col">
              {[1, 2].map(i => (
                <div key={i} className="py-6 border-b border-slate-200">
                  <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse mb-4"></div>
                  <div className="h-6 w-48 bg-slate-200 rounded-full animate-pulse mb-4"></div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full animate-pulse mt-2"></div>
                </div>
              ))}
              <div className="py-6 border-b border-slate-200 grid grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i}>
                    <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse mb-3"></div>
                    <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Karier Skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BriefcaseBusiness size={24} className="text-slate-300" />
              <div className="h-6 w-40 bg-slate-200 rounded-full animate-pulse"></div>
            </div>
            <div className="border-t border-slate-200 flex flex-col">
              {[1, 2].map(i => (
                <div key={i} className="py-6 border-b border-slate-200">
                  <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse mb-4"></div>
                  <div className="flex items-center gap-3 mb-4">
                    {i === 1 && <div className="w-3 h-3 rounded-full bg-slate-200 animate-pulse"></div>}
                    <div className="h-6 w-48 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full animate-pulse mt-2"></div>
                </div>
              ))}
              <div className="py-6 border-b border-slate-200 grid grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i}>
                    <div className="h-3 w-24 bg-slate-200 rounded-full animate-pulse mb-3"></div>
                    <div className="h-6 w-32 bg-slate-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ===== RIWAYAT KARIER SKELETON ===== */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={24} className="text-slate-300" />
            <div className="h-6 w-44 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            {[1, 2, 3].map((i, idx, arr) => {
              const isLast = idx === arr.length - 1;
              return (
                <div key={i} className="flex gap-4 md:gap-6">
                  {/* Timeline Column */}
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full bg-slate-200 ring-[4px] ring-white z-10 shadow-sm shrink-0 mt-6 md:mt-8 animate-pulse" />
                    {!isLast && <div className="w-[3px] bg-slate-100 flex-1 my-1 rounded-full animate-pulse" />}
                  </div>

                  {/* Content Column */}
                  <div className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
                    <div className="bg-slate-50/70 rounded-2xl p-6 md:p-8 border border-slate-100">
                      <div className="h-6 w-48 bg-slate-200 rounded-full animate-pulse mb-4"></div>
                      <div className="h-4 w-64 bg-slate-200 rounded-full animate-pulse mb-6"></div>
                      
                      <div className="space-y-3">
                        <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse"></div>
                        <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== PORTOFOLIO SKELETON ===== */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase size={24} className="text-slate-300" />
            <div className="h-6 w-56 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white flex flex-col">
                <div className="h-48 rounded-xl bg-slate-200 animate-pulse mb-4"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse"></div>
                  <div className="h-3 w-5/6 bg-slate-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}