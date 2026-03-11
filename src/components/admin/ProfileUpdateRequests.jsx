import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Check, X, Loader2, RefreshCw, Eye, FileEdit, User, Award, Layout, FileText, Globe } from 'lucide-react';
import { adminApi } from '../../api/admin';
import CareerUpdateDetailModal from './CareerUpdateDetailModal';
import ProfileUpdateDetailModal from './ProfileUpdateDetailModal';

// Label & Icon per section (matches backend section names)
const SECTION_META = {
  personal_info: { label: 'Detail Pribadi', icon: User },
  skills: { label: 'Keahlian', icon: Award },
  social_media: { label: 'Media Sosial', icon: Globe },
  portofolio: { label: 'Portofolio', icon: Layout },
  deskripsi_karier: { label: 'Deskripsi Karier', icon: FileText },
};

export default function ProfileUpdateRequests() {
  // Career updates (existing flow)
  const [careerRequests, setCareerRequests] = useState([]);
  const [careerLoading, setCareerLoading] = useState(true);

  // Profile updates (new flow — all sections)
  const [profileRequests, setProfileRequests] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(null);
  
  // Modal states
  const [selectedCareerDetail, setSelectedCareerDetail] = useState(null);
  const [selectedProfileDetail, setSelectedProfileDetail] = useState(null);

  // ── Fetch Career Updates (existing) ──
  const fetchCareerUpdates = useCallback(async () => {
    try {
      setCareerLoading(true);
      const res = await adminApi.getPendingCareerUpdates();
      setCareerRequests(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load pending career updates:', err);
    } finally {
      setCareerLoading(false);
    }
  }, []);

  // ── Fetch Profile Updates (new) ──
  const fetchProfileUpdates = useCallback(async () => {
    try {
      setProfileLoading(true);
      const res = await adminApi.getPendingProfileUpdates();
      setProfileRequests(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load pending profile updates:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCareerUpdates();
    fetchProfileUpdates();
  }, [fetchCareerUpdates, fetchProfileUpdates]);

  function refreshAll() {
    fetchCareerUpdates();
    fetchProfileUpdates();
  }

  // ── Career Approve / Reject ──
  async function handleCareerApprove(id) {
    try {
      setActionLoading(id);
      await adminApi.approveCareerUpdate(id);
      setCareerRequests(prev => prev.filter(r => r.id !== id));
      if (selectedCareerDetail?.id === id) setSelectedCareerDetail(null);
    } catch (err) {
      console.error('Failed to approve career update:', err);
      alert('Gagal menyetujui: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCareerReject(id) {
    try {
      setActionLoading(id);
      await adminApi.rejectCareerUpdate(id);
      setCareerRequests(prev => prev.filter(r => r.id !== id));
      if (selectedCareerDetail?.id === id) setSelectedCareerDetail(null);
    } catch (err) {
      console.error('Failed to reject career update:', err);
      alert('Gagal menolak: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  // ── Profile Approve / Reject ──
  async function handleProfileApprove(id) {
    try {
      setActionLoading(`profile-${id}`);
      await adminApi.approveProfileUpdate(id);
      setProfileRequests(prev => prev.filter(r => r.id !== id));
      if (selectedProfileDetail?.id === id) setSelectedProfileDetail(null);
    } catch (err) {
      console.error('Failed to approve profile update:', err);
      alert('Gagal menyetujui: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleProfileReject(id) {
    try {
      setActionLoading(`profile-${id}`);
      await adminApi.rejectProfileUpdate(id);
      setProfileRequests(prev => prev.filter(r => r.id !== id));
      if (selectedProfileDetail?.id === id) setSelectedProfileDetail(null);
    } catch (err) {
      console.error('Failed to reject profile update:', err);
      alert('Gagal menolak: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  const isLoading = careerLoading || profileLoading;
  const totalPending = careerRequests.length + profileRequests.length;

  if (isLoading) {
    return (
      <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-black text-[#425A5C] tracking-tight">Permintaan Pembaruan Profil</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#425A5C]" />
        </div>
      </div>
    );
  }

  if (totalPending === 0) {
    return (
      <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-[#425A5C] tracking-tight">Permintaan Pembaruan Profil</h2>
            <span className="px-3 py-1 bg-[#425A5C]/10 text-[#425A5C] text-xs font-black rounded-full">0 Menunggu</span>
          </div>
          <button onClick={refreshAll} className="text-sm font-bold text-[#425A5C] hover:underline cursor-pointer flex items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
          <p className="text-sm font-medium text-slate-400">Tidak ada permintaan pembaruan profil saat ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-black text-[#425A5C] tracking-tight">Permintaan Pembaruan Profil</h2>
          <span className="px-3 py-1 bg-[#425A5C]/10 text-[#425A5C] text-xs font-black rounded-full">
            {totalPending} Menunggu
          </span>
        </div>
        <button onClick={refreshAll} className="text-sm font-bold text-[#425A5C] hover:underline cursor-pointer flex items-center gap-1">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Career Update Cards ── */}
      {careerRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-[#425A5C]/60 uppercase tracking-widest mb-4">Status Karier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {careerRequests.map((req) => (
              <div 
                key={`career-${req.id}`}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(60,87,89,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#425A5C]/40 to-[#425A5C] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
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

                <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => setSelectedCareerDetail(req)} 
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-[#425A5C] bg-[#425A5C]/5 hover:bg-[#425A5C]/10 transition-colors cursor-pointer text-xs"
                  >
                    <Eye size={14} strokeWidth={2.5} /> Lihat Detail
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleCareerReject(req.id)} 
                      disabled={actionLoading === req.id}
                      className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer text-xs disabled:opacity-50"
                    >
                      {actionLoading === req.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak
                    </button>
                    <button 
                      onClick={() => handleCareerApprove(req.id)} 
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
        </div>
      )}

      {/* ── Profile Section Update Cards ── */}
      {profileRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-[#425A5C]/60 uppercase tracking-widest mb-4">Pembaruan Profil Lainnya</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profileRequests.map((req) => {
              const meta = SECTION_META[req.section] || { label: req.section, icon: FileEdit, color: 'slate' };
              const SectionIcon = meta.icon;
              const loadingKey = `profile-${req.id}`;

              return (
                <div 
                  key={`profile-${req.id}`}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(60,87,89,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#425A5C]/40 to-[#425A5C] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Alumni info */}
                  <div className="flex justify-between items-start mb-6 mt-2">
                    <div className="flex items-center gap-3">
                      {req.alumni?.foto ? (
                        <img src={req.alumni.foto} alt={req.alumni.nama} className="w-12 h-12 rounded-full object-cover border-2 border-slate-50" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#425A5C]/10 text-[#425A5C] flex items-center justify-center font-black text-lg border-2 border-slate-50">
                          {(req.alumni?.nama || 'A').substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-slate-800 text-[15px] leading-tight mb-0.5">{req.alumni?.nama || 'Alumni'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold">
                          {req.alumni?.angkatan ? `Angkatan ${req.alumni.angkatan}` : ''} {req.alumni?.nis ? `• ${req.alumni.nis}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 shrink-0">
                      <Clock size={12} /> {req.created_at ? new Date(req.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                  </div>

                  {/* Section badge + action type */}
                  <div className="mb-6 flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#425A5C]/5 border border-[#425A5C]/10 rounded-lg text-[11px] font-bold text-[#425A5C]">
                        <SectionIcon size={12} /> {meta.label}
                      </span>
                      <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
                        req.action === 'create' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        req.action === 'delete' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        {req.action === 'create' ? 'Tambah Baru' : req.action === 'delete' ? 'Hapus' : 'Perubahan'}
                      </span>
                    </div>

                    {/* Quick glance of changes */}
                    {req.new_data && typeof req.new_data === 'object' && (
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(req.new_data).slice(0, 4).map((key) => (
                          <span key={key} className="px-3 py-1.5 bg-[#f3f4f4] text-[#526061] border border-slate-100 rounded-lg text-[11px] font-bold">
                            {key.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {Object.keys(req.new_data).length > 4 && (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[11px] font-bold">
                            +{Object.keys(req.new_data).length - 4} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => setSelectedProfileDetail(req)} 
                      className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-bold text-[#425A5C] bg-[#425A5C]/5 hover:bg-[#425A5C]/10 transition-colors cursor-pointer text-xs"
                    >
                      <Eye size={14} strokeWidth={2.5} /> Lihat Detail
                    </button>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleProfileReject(req.id)} 
                        disabled={actionLoading === loadingKey}
                        className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer text-xs disabled:opacity-50"
                      >
                        {actionLoading === loadingKey ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak
                      </button>
                      <button 
                        onClick={() => handleProfileApprove(req.id)} 
                        disabled={actionLoading === loadingKey}
                        className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-xl font-bold text-white bg-[#425A5C] shadow-md shadow-[#425A5C]/20 hover:bg-[#2e4042] transition-colors cursor-pointer text-xs disabled:opacity-50"
                      >
                        {actionLoading === loadingKey ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Terima
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Career Detail Modal (existing) */}
      <CareerUpdateDetailModal 
        isOpen={!!selectedCareerDetail}
        detail={selectedCareerDetail}
        onClose={() => setSelectedCareerDetail(null)}
        onApprove={handleCareerApprove}
        onReject={handleCareerReject}
        actionLoading={actionLoading}
      />

      {/* Profile Update Detail Modal (new) */}
      <ProfileUpdateDetailModal
        isOpen={!!selectedProfileDetail}
        detail={selectedProfileDetail}
        onClose={() => setSelectedProfileDetail(null)}
        onApprove={handleProfileApprove}
        onReject={handleProfileReject}
        actionLoading={actionLoading}
      />
    </div>
  );
}