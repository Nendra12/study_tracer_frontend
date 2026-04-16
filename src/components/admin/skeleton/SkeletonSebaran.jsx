import React from 'react';

export default function SkeletonSebaran() {
  // Lebar acak palsu untuk skeleton bar chart agar terlihat natural
  const chartWidths = ['w-[100%]', 'w-[80%]', 'w-[65%]', 'w-[45%]', 'w-[30%]'];

  return (
    <div className="space-y-6 animate-pulse">
      
      {/* 1. HEADER BAR SKELETON (Search & Filter) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="w-full flex-1 h-[44px] bg-slate-200 rounded-xl"></div>
        <div className="w-full md:w-[130px] h-[44px] bg-slate-200 rounded-xl shrink-0"></div>
      </div>

      {/* 2. STAT CARDS SKELETON (4 Kotak) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-[90px] flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-2.5 w-16 bg-slate-200 rounded-md"></div>
              <div className="h-5 w-10 bg-slate-200 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MAP SKELETON (Peta Besar) */}
      <div className="w-full h-[400px] md:h-[500px] bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="w-full h-full bg-slate-200 rounded-xl"></div>
      </div>

      {/* 4. TOP 5 SECTION SKELETON (2 Panel Bawah) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((panel) => (
          <div key={panel} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {/* Title Top 5 */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0"></div>
              <div className="h-4 w-40 bg-slate-200 rounded-md"></div>
            </div>
            
            {/* 5 Baris Progress Bar */}
            <div className="space-y-7">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-48 bg-slate-200 rounded-md"></div>
                    <div className="h-4 w-6 bg-slate-200 rounded-md"></div>
                  </div>
                  {/* Base Bar (Abu terang) */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    {/* Fill Bar (Abu lebih gelap) */}
                    <div className={`h-full bg-slate-200 rounded-full ${chartWidths[index]}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}