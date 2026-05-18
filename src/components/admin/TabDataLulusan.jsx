import React from 'react';
import { Search, Download, Loader2, Pencil, Trash2 } from 'lucide-react';
import SmoothDropdown from './SmoothDropdown';

export default function TabDataLulusan({
  filterBottom,
  setFilterBottom,
  tahunOptions,
  jurusanOptions,
  handleExportExcel,
  loadingRiwayat,
  lulusan,
  onEdit,
  onDelete
}) {
  const searchInputClass = "w-full pl-10 pr-4 h-[42px] bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const dropdownWrapperClass = "w-full md:w-auto [&>div]:!w-full md:[&>div]:!w-auto md:[&>div]:!min-w-[180px] [&_button]:!h-[42px] [&_button]:!min-h-[42px] [&_button]:!py-0 [&_button]:!border-slate-200 [&_button]:!bg-white [&_button]:!rounded-xl [&_button_span]:!font-medium [&_button_span]:!text-slate-700 [&_button_span]:!whitespace-nowrap [&_ul]:!min-w-[180px] [&_li]:!whitespace-nowrap";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row flex-wrap md:flex-nowrap items-stretch md:items-center gap-3 rounded-t-2xl relative z-20">
        <div className="relative w-full md:flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari Nama atau NISN..." 
            value={filterBottom.search}
            onChange={(e) => setFilterBottom({...filterBottom, search: e.target.value})}
            className={searchInputClass}
          />
        </div>
        <div className={`relative z-[60] ${dropdownWrapperClass}`}>
           <SmoothDropdown
            options={tahunOptions}
            value={filterBottom.tahun}
            onSelect={(val) => setFilterBottom({...filterBottom, tahun: val})}
          />
        </div>
        <div className={`relative z-[50] ${dropdownWrapperClass}`}>
          <SmoothDropdown
            options={jurusanOptions}
            value={filterBottom.jurusan}
            onSelect={(val) => setFilterBottom({...filterBottom, jurusan: val})}
          />
        </div>
        <button
          onClick={handleExportExcel}
          className="w-full md:w-auto whitespace-nowrap h-[42px] px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto relative z-10">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">No</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">NISN</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jurusan</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Tahun Lulus</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingRiwayat ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-sm text-slate-400">
                  <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" /> Memuat data...
                </td>
              </tr>
            ) : lulusan.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-12 text-sm text-slate-400">Tidak ada data kelulusan yang ditemukan.</td>
              </tr>
            ) : (
              lulusan.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium text-center">{index + 1}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-bold">{item.nisn}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.nama}</td>
                  <td className="px-6 py-4 text-xs font-bold">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {(item.status_kelulusan || 'lulus') === 'lulus' ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-bold">Lulus</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs font-bold">Tidak Lulus</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                    {item.tahun_lulus || item.tahunLulus || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        title="Ubah Status Kelulusan"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id_kelulusan || item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Data"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}