import React from 'react';
import {
  Check, X, Eye, Ban, Trash2, Loader2,
  Image as ImageIcon, ChevronLeft, ChevronRight
} from 'lucide-react';

// Pagination helper: show max 7 page numbers
const getPageNumbers = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
  if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
  return [1, '...', current - 1, current, current + 1, '...', last];
};

// Normalize foto URL from backend
const buildFotoUrl = (foto, STORAGE_BASE_URL) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  const path = foto.replace(/^\/?(storage\/)?/, '');
  return `${STORAGE_BASE_URL}/${path}`;
};

// Extract year from tahun_lulus
const extractYear = (val) => {
  if (!val) return null;
  if (typeof val === 'number') return String(val);
  const str = String(val);
  const match = str.match(/\d{4}/);
  return match ? match[0] : str;
};

// Status badge
const statusBadge = (status) => {
  const map = {
    pending: { bg: 'bg-orange-50 text-orange-600 border-orange-100', label: 'Menunggu' },
    ok: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', label: 'Aktif' },
    rejected: { bg: 'bg-red-50 text-red-500 border-red-100', label: 'Ditolak' },
    banned: { bg: 'bg-slate-50 text-slate-500 border-slate-100', label: 'Blacklist' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.bg}`}>
      {s.label}
    </span>
  );
};

const AlumniTable = ({
  alumni,
  alumniLoading,
  pagination,
  currentPage,
  setCurrentPage,
  actionLoading,
  handleViewDetail,
  handleApprove,
  handleReject,
  handleBan,
  handleDelete,
  STORAGE_BASE_URL,
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Alumni</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jurusan</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Foto</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {alumniLoading ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <Loader2 size={28} className="animate-spin text-primary mx-auto" />
                <p className="text-sm text-slate-400 mt-2">Memuat data...</p>
              </td>
            </tr>
          ) : alumni.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <p className="text-sm text-slate-400">Tidak ada data alumni ditemukan.</p>
              </td>
            </tr>
          ) : (
            alumni.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">{item.nama}</p>
                      <p className="text-[11px] text-slate-400">NIS: {item.nis || '-'} &bull; NISN: {item.nisn || '-'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-600">{item.jurusan?.nama || '-'}</span>
                    {item.tahun_lulus && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 w-fit px-1.5 py-0.5 rounded mt-1">
                        Lulus {extractYear(item.tahun_lulus)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {item.foto ? (
                    <a
                      href={buildFotoUrl(item.foto, STORAGE_BASE_URL)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-slate-500 hover:text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
                    >
                      <ImageIcon size={14} /> Lihat
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {statusBadge(item.status_create)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      title="Lihat Detail"
                      onClick={() => handleViewDetail(item.id)}
                      className="cursor-pointer p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Eye size={18} />
                    </button>
                    {item.status_create === 'pending' && (
                      <>
                        <button
                          title="Tolak"
                          disabled={actionLoading === item.id}
                          onClick={() => handleReject(item.id)}
                          className="cursor-pointer p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <X size={18} />
                        </button>
                        <button
                          title="Setujui"
                          disabled={actionLoading === item.id}
                          onClick={() => handleApprove(item.id)}
                          className="cursor-pointer p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Check size={18} />
                        </button>
                      </>
                    )}
                    {item.status_create !== 'pending' && item.user && (
                      <>
                        {item.status_create === 'ok' && (
                          <button
                            title="Ban User"
                            disabled={actionLoading === item.id}
                            onClick={() => handleBan(item.id, item.nama)}
                            className="cursor-pointer p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        <button
                          title="Hapus User"
                          disabled={actionLoading === item.user?.id}
                          onClick={() => handleDelete(item.user?.id, item.nama)}
                          className="cursor-pointer p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <span className="text-xs text-slate-500 font-medium">
        Hal. {pagination.current_page} dari {pagination.last_page} &bull; Total: {pagination.total}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
        >
          <ChevronLeft size={16}/>
        </button>
        {getPageNumbers(currentPage, pagination.last_page).map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-slate-400 text-xs select-none">...</span>
          ) : (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all
                ${currentPage === page
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
            >
              {page}
            </button>
          )
        )}
        <button
          disabled={currentPage >= pagination.last_page}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-50"
        >
          <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  </div>
);

export default AlumniTable;
