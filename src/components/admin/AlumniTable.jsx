import React from 'react';
import { Eye, Trash2, Check, X, Ban, Search } from 'lucide-react';
import Pagination from './Pagination';

const AlumniTable = ({
  alumni = [],
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
  handlePhotoClick, // Pastikan prop ini diterima
  STORAGE_BASE_URL
}) => {

  // Fungsi helper untuk status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ok': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">Aktif</span>;
      case 'pending': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 uppercase">Menunggu</span>;
      case 'rejected': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase">Ditolak</span>;
      case 'banned': return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">Blacklist</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Alumni</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jurusan</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Foto</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">AKSI</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-50">
            {alumni.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center text-slate-400 text-sm italic">
                  Tidak ada data alumni ditemukan.
                </td>
              </tr>
            ) : (
              alumni.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* KOLOM NAMA ALUMNI (Sesuai perbaikan agar nama muncul) */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">
                        {item.nama || item.nama_alumni || 'Tanpa Nama'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        NIS: {item.nis || '-'} • NISN: {item.nisn || '-'}
                      </span>
                    </div>
                  </td>
                  
                  {/* KOLOM JURUSAN */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">
                        {item.jurusan?.nama_jurusan || item.jurusan?.nama || '-'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Lulus {item.tahun_lulus || '-'}
                      </span>
                    </div>
                  </td>

                  {/* KOLOM FOTO (Bulat dan Clickable untuk Pop-up) */}
                  <td className="px-4 py-4">
                    <div className="flex justify-center">
                      {item.foto ? (
                        <button 
                          onClick={() => handlePhotoClick(`${STORAGE_BASE_URL}/${item.foto}`)}
                          className="group/thumb relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 hover:border-primary transition-all shadow-sm cursor-pointer"
                        >
                          <img 
                            src={`${STORAGE_BASE_URL}/${item.foto}`} 
                            alt="Alumni" 
                            className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + (item.nama || item.nama_alumni); }}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                            <Search size={12} className="text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                          <X size={16} />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* KOLOM STATUS */}
                  <td className="px-4 py-4 text-center">
                    {getStatusBadge(item.status_create)}
                  </td>

                  {/* KOLOM AKSI (Kembali seperti fungsionalitas sebelumnya) */}
                  <td className="px-4 py-4">
                    <div className="flex justify-center items-center gap-1">
                      {/* Tombol Lihat Detail */}
                      <button 
                        onClick={() => handleViewDetail(item.user_id || item.id_alumni || item.id)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />

                      </button>

                      {/* Aksi khusus status PENDING (Approve & Reject) */}
                      {item.status_create === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(item.id)}
                            className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                            title="Setujui"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => handleReject(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                            title="Tolak"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}

                      {/* Aksi khusus status AKTIF/OK (Blacklist) */}
                      {item.status_create === 'ok' && (
                        <button 
                          onClick={() => handleBan(item.id, item.nama || item.nama_alumni)}
                          className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all active:scale-90 cursor-pointer"
                          title="Blacklist"
                        >
                          <Ban size={18} />
                        </button>
                      )}

                      {/* Tombol Hapus Permanen */}
                      <button 
                        onClick={() => handleDelete(item.id, item.nama || item.nama_alumni)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all active:scale-90 cursor-pointer"
                        title="Hapus Permanen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-50">
        <Pagination 
          currentPage={currentPage}
          totalPages={pagination.last_page}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AlumniTable;