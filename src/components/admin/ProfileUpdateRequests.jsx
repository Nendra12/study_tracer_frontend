import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Check, X, Loader2, RefreshCw, Eye, FileEdit } from 'lucide-react';
import { adminApi } from '../../api/admin';
import CareerUpdateDetailModal from './CareerUpdateDetailModal'; // IMPORT KOMPONEN MODAL BARU

export default function ProfileUpdateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // State untuk mengontrol Modal Detail
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchPendingUpdates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPendingCareerUpdates();
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load pending career updates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUpdates();
  }, [fetchPendingUpdates]);

  async function handleApprove(id) {
    try {
      setActionLoading(id);
      await adminApi.approveCareerUpdate(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedDetail?.id === id) setSelectedDetail(null); // Tutup modal otomatis jika disetujui dari modal
    } catch (err) {
      console.error('Failed to approve career update:', err);
      alert('Gagal menyetujui: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    try {
      setActionLoading(id);
      await adminApi.rejectCareerUpdate(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedDetail?.id === id) setSelectedDetail(null); // Tutup modal otomatis jika ditolak dari modal
    } catch (err) {
      console.error('Failed to reject career update:', err);
      alert('Gagal menolak: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-[#425A5C] tracking-tight">Permintaan Pembaruan Status Karier</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#425A5C]" />
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-[#425A5C] tracking-tight">Permintaan Pembaruan Status Karier</h2>
            <span className="px-3 py-1 bg-[#425A5C]/10 text-[#425A5C] text-xs font-black rounded-full">0 Menunggu</span>
          </div>
          <button onClick={fetchPendingUpdates} className="text-sm font-bold text-[#425A5C] hover:underline cursor-pointer flex items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-400">Tidak ada permintaan pembaruan status karier saat ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-[#425A5C] tracking-tight">Permintaan Pembaruan Status Karier</h2>
          <span className="px-3 py-1 bg-[#425A5C]/10 text-[#425A5C] text-xs font-black rounded-full">
            {requests.length} Menunggu
          </span>
        </div>
        <button onClick={fetchPendingUpdates} className="text-sm font-bold text-[#425A5C] hover:underline cursor-pointer flex items-center gap-1">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div 
            key={req.id} 
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(60,87,89,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
          >
            {/* Garis Aksen di Atas Card */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#425A5C]/40 to-[#425A5C] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Profil & Waktu */}
            <div className="flex justify-between items-start mb-6 mt-2">
              <div className="flex items-center gap-3">
                {req.image ? (
                  <img src={req.image} alt={req.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-50" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#425A5C]/10 text-[#425A5C] flex items-center justify-center font-black text-lg border-2 border-slate-50">
                    {req.initials || (req.name || 'A').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-800 text-[15px] leading-tight mb-0.5">{req.name}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">Angkatan {req.angkatan} • {req.userId}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 shrink-0">
                <Clock size={12} /> {req.time}
              </div>
            </div>

            {/* Sekilas Perubahan (Glance View) */}
            <div className="mb-6 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <FileEdit size={12} /> Sekilas Perubahan:
              </p>
              <div className="flex flex-wrap gap-2">
                {(req.changes || []).map((change, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-[#f3f4f4] text-[#526061] border border-slate-100 rounded-lg text-[11px] font-bold">
                    {change.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-50">
              <button 
                onClick={() => setSelectedDetail(req)} 
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-[#425A5C] bg-[#425A5C]/5 hover:bg-[#425A5C]/10 transition-colors cursor-pointer text-xs"
              >
                <Eye size={14} strokeWidth={2.5} /> Lihat Detail Pembaruan
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleReject(req.id)} 
                  disabled={actionLoading === req.id}
                  className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer text-xs disabled:opacity-50"
                >
                  {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak
                </button>
                <button 
                  onClick={() => handleApprove(req.id)} 
                  disabled={actionLoading === req.id}
                  className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-white bg-[#425A5C] shadow-md shadow-[#425A5C]/20 hover:bg-[#2e4042] transition-colors cursor-pointer text-xs disabled:opacity-50"
                >
                  {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Terima
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* Panggil Komponen Modal yang baru dipisah */}
      <CareerUpdateDetailModal 
        isOpen={!!selectedDetail}
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        actionLoading={actionLoading}
      />

    </div>
  );
}