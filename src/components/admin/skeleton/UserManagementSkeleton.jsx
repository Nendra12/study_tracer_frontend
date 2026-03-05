const UserManagementSkeleton = () => {
  return (
    // Menambahkan p-6 agar tidak mepet ke pinggir, sama seperti layout admin pada umumnya
    <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-pulse p-6">
      <div className="space-y-8">
        
        {/* --- STATS ROW SKELETON --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="space-y-2">
                {/* Judul Stat */}
                <div className="w-24 h-3 bg-slate-200 rounded"></div>
                {/* Angka Stat */}
                <div className="w-16 h-6 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* --- TABLE AREA SKELETON --- */}
        <div className="space-y-6">
          {/* Controls Skeleton (Tabs & Search area) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Skeleton Tabs di Kiri */}
            <div className="flex gap-2 w-full md:w-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-8 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
            
            {/* Skeleton Search & Filter di Kanan */}
            <div className="flex gap-2 w-full md:w-auto">
              {/* Input Search */}
              <div className="flex-1 md:w-64 h-10 bg-slate-200 rounded-xl"></div>
              {/* Tombol Export */}
              <div className="w-28 h-10 bg-slate-200 rounded-xl"></div>
              {/* Tombol Filter */}
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
            </div>
          </div>

          {/* Table Body Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header Tabel */}
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
               <div className="w-full h-6 bg-slate-200 rounded"></div>
            </div>
            
            {/* Baris-baris Tabel */}
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 py-5">
                  {/* Avatar Alumni */}
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0"></div>
                  
                  <div className="flex-1 space-y-2">
                    {/* Nama Alumni */}
                    <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                    {/* NIS / Info Detail */}
                    <div className="w-1/4 h-3 bg-slate-100 rounded"></div>
                  </div>

                  {/* Tombol Status/Aksi */}
                  <div className="w-20 h-8 bg-slate-100 rounded-lg hidden sm:block"></div>
                  <div className="w-24 h-8 bg-slate-100 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};