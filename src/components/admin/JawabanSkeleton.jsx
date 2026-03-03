import React from 'react';

const JawabanSkeleton = () => {
  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-pulse">
      
      {/* --- Header Section Skeleton --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-24 bg-slate-200 rounded-xl flex-1 sm:flex-none"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-xl flex-1 sm:flex-none"></div>
        </div>
      </div>

      {/* --- Stats Cards Skeleton --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-28 flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-100 rounded"></div>
              <div className="h-7 w-16 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Filters Section Skeleton --- */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 h-12 bg-white border border-slate-200 rounded-xl"></div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-56 h-12 bg-white border border-slate-200 rounded-xl"></div>
          <div className="w-full sm:w-56 h-12 bg-white border border-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* --- Table Section Skeleton --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-5 pl-8"><div className="h-3 w-20 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-5"><div className="h-3 w-16 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-5 text-center"><div className="h-3 w-12 mx-auto bg-slate-200 rounded"></div></th>
                <th className="px-6 py-5"><div className="h-3 w-24 bg-slate-200 rounded"></div></th>
                <th className="px-6 py-5 text-center"><div className="h-3 w-16 mx-auto bg-slate-200 rounded"></div></th>
                <th className="px-6 py-5 pr-8 text-right"><div className="h-3 w-12 ml-auto bg-slate-200 rounded"></div></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row} className="border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 rounded"></div>
                        <div className="h-3 w-20 bg-slate-50 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-slate-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-12 bg-slate-100 rounded mx-auto"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-slate-100 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-20 bg-slate-100 rounded-full mx-auto"></div>
                  </td>
                  <td className="px-6 py-4 pr-8 text-right">
                    <div className="h-8 w-8 bg-slate-100 rounded-lg ml-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Skeleton --- */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
          <div className="flex gap-2">
            {[1, 2, 3].map((p) => (
              <div key={p} className="w-9 h-9 bg-white border border-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JawabanSkeleton;