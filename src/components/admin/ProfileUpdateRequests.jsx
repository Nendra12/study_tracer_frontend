import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ArrowRight, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '../../api/admin';

export default function ProfileUpdateRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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
            <h2 className="text-xl font-black text-[#3C5759] tracking-tight">Permintaan Pembaruan Status Karier</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#3C5759]" />
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-[#3C5759] tracking-tight">Permintaan Pembaruan Status Karier</h2>
            <span className="px-3 py-1 bg-[#3C5759]/10 text-[#3C5759] text-xs font-black rounded-full">0 Menunggu</span>
          </div>
          <button onClick={fetchPendingUpdates} className="text-sm font-bold text-[#3C5759] hover:underline cursor-pointer flex items-center gap-1">
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
    <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Title */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-[#3C5759] tracking-tight">Permintaan Pembaruan Status Karier</h2>
          <span className="px-3 py-1 bg-[#3C5759]/10 text-[#3C5759] text-xs font-black rounded-full">
            {requests.length} Menunggu
          </span>
        </div>
        <button onClick={fetchPendingUpdates} className="text-sm font-bold text-[#3C5759] hover:underline cursor-pointer flex items-center gap-1">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div 
            key={req.id} 
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
          >
            {/* Garis Aksen di Atas Card */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3C5759]/40 to-[#3C5759] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            {/* Profil & Waktu */}
            <div className="flex justify-between items-start mb-6 mt-2">
              <div className="flex items-center gap-3">
                {req.image ? (
                  <img src={req.image} alt={req.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-50" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#3C5759]/10 text-[#3C5759] flex items-center justify-center font-black text-lg border-2 border-slate-50">
                    {req.initials || (req.name || 'A').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-800 text-[15px] leading-tight mb-0.5">{req.name}</h3>
                  <p className="text-[11px] text-slate-400 font-bold">Angkatan {req.angkatan} • {req.userId}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded-full">
                <Clock size={12} /> {req.time}
              </div>
            </div>

            {/* Label Bidang */}
            <div className="mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-amber-400 rounded-full"></span>
              <p className="font-bold text-[#3C5759] text-sm">{req.field}</p>
            </div>

            {/* Perubahan (Old -> New) */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-4 flex-1 border border-slate-100">
              {(req.changes || []).map((change, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{change.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-xs text-slate-500 line-through decoration-red-400/50 font-semibold px-3 py-2 bg-white rounded-xl border border-slate-200/60 truncate">
                      {change.old}
                    </span>
                    <ArrowRight size={14} className="text-slate-300 shrink-0" strokeWidth={3} />
                    <span className="flex-1 text-xs text-emerald-700 font-bold px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200/60 truncate">
                      {change.new}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-3 mt-auto">
              <button 
                onClick={() => handleReject(req.id)} 
                disabled={actionLoading === req.id}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer text-xs disabled:opacity-50"
              >
                {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak
              </button>
              <button 
                onClick={() => handleApprove(req.id)} 
                disabled={actionLoading === req.id}
                className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-white bg-[#3C5759] shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] transition-colors cursor-pointer text-xs disabled:opacity-50"
              >
                {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Terima
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}