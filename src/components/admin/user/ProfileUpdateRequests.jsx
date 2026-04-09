import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Check, X, Loader2, RefreshCw, Eye, FileEdit, User, Award, Layout, FileText, Globe, ChevronDown } from 'lucide-react';
import { adminApi } from '../../../api/admin';
import { alertSuccess, alertError, alertConfirm } from '../../../utilitis/alert';
import CareerUpdateDetailModal from '../CareerUpdateDetailModal';
import ProfileUpdateDetailModal from '../ProfileUpdateDetailModal';

// Label & Icon per section (matches backend section names)
const SECTION_META = {
  personal_info: { label: 'Detail Pribadi', icon: User },
  skills: { label: 'Keahlian', icon: Award },
  social_media: { label: 'Media Sosial', icon: Globe },
  portofolio: { label: 'Portofolio', icon: Layout },
  deskripsi_karier: { label: 'Deskripsi Karier', icon: FileText },
};

function toSkillName(value, skillMap) {
  if (value === null || value === undefined || value === '' || value === '-') return value;

  // Keep non-collection values intact when they are clearly plain text.
  const resolveOne = (item) => {
    if (item === null || item === undefined || item === '') return item;

    if (typeof item === 'object') {
      if (item.name_skills) return item.name_skills;
      if (item.nama) return item.nama;
      if (item.name) return item.name;
      const idCandidate = item.id ?? item.id_skills;
      if (idCandidate !== undefined && idCandidate !== null) {
        return skillMap.get(String(idCandidate)) || String(idCandidate);
      }
      return item;
    }

    const raw = String(item).trim();
    if (!raw) return raw;
    return skillMap.get(raw) || item;
  };

  if (Array.isArray(value)) {
    return value.map(resolveOne);
  }

  if (typeof value === 'string' && value.includes(',')) {
    return value.split(',').map((part) => resolveOne(part.trim()));
  }

  return resolveOne(value);
}

function normalizeSkillChanges(request, skillMap) {
  if (request?.section !== 'skills') return request;

  const normalizedChanges = (request.changes || []).map((change) => ({
    ...change,
    label: 'Skills',
    old: toSkillName(change.old, skillMap),
    new: toSkillName(change.new, skillMap),
  }));

  return {
    ...request,
    changes: normalizedChanges,
  };
}

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
  const [expandedUserKey, setExpandedUserKey] = useState(null);

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
      const [pendingRes, skillsRes] = await Promise.all([
        adminApi.getPendingProfileUpdates(),
        adminApi.getSkills(),
      ]);

      const pendingRequests = pendingRes.data?.data || [];
      const skills = skillsRes.data?.data || [];

      const skillMap = new Map(
        skills.map((skill) => [
          String(skill.id ?? skill.id_skills),
          skill.nama ?? skill.name_skills ?? skill.name ?? String(skill.id ?? skill.id_skills),
        ])
      );

      setProfileRequests(pendingRequests.map((req) => normalizeSkillChanges(req, skillMap)));
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

  async function handleCareerApprove(id) {
    try {
      setActionLoading(id);
      const res = await adminApi.approveCareerUpdate(id);
      setCareerRequests(prev => prev.filter(r => r.id !== id));
      if (selectedCareerDetail?.id === id) setSelectedCareerDetail(null);
      alertSuccess(res.data?.message || 'Update status karier berhasil disetujui.');
    } catch (err) {
      console.error('Failed to approve career update:', err);
      alertError('Gagal menyetujui: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCareerReject(id) {
    try {
      setActionLoading(id);
      const res = await adminApi.rejectCareerUpdate(id);
      setCareerRequests(prev => prev.filter(r => r.id !== id));
      if (selectedCareerDetail?.id === id) setSelectedCareerDetail(null);
      alertSuccess(res.data?.message || 'Update status karier berhasil ditolak.');
    } catch (err) {
      console.error('Failed to reject career update:', err);
      alertError('Gagal menolak: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleProfileApprove(id) {
    try {
      setActionLoading(`profile-${id}`);
      const res = await adminApi.approveProfileUpdate(id);
      setProfileRequests(prev => prev.filter(r => r.id !== id));
      if (selectedProfileDetail?.id === id) setSelectedProfileDetail(null);
      alertSuccess(res.data?.message || 'Pembaruan profil berhasil disetujui.');
    } catch (err) {
      console.error('Failed to approve profile update:', err);
      alertError('Gagal menyetujui: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleProfileReject(id) {
    try {
      setActionLoading(`profile-${id}`);
      const res = await adminApi.rejectProfileUpdate(id);
      setProfileRequests(prev => prev.filter(r => r.id !== id));
      if (selectedProfileDetail?.id === id) setSelectedProfileDetail(null);
      alertSuccess(res.data?.message || 'Pembaruan profil berhasil ditolak.');
    } catch (err) {
      console.error('Failed to reject profile update:', err);
      alertError('Gagal menolak: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBulkActionByUser(group, actionType) {
    try {
      const bulkKey = `bulk-${actionType}-${group.userKey}`;
      setActionLoading(bulkKey);

      const results = await Promise.allSettled(
        group.requests.map((req) => {
          if (req.requestType === 'career') {
            return actionType === 'approve'
              ? adminApi.approveCareerUpdate(req.id)
              : adminApi.rejectCareerUpdate(req.id);
          }

          return actionType === 'approve'
            ? adminApi.approveProfileUpdate(req.id)
            : adminApi.rejectProfileUpdate(req.id);
        })
      );

      const succeededCareerIds = new Set();
      const succeededProfileIds = new Set();
      let successCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const req = group.requests[index];
          successCount += 1;
          if (req.requestType === 'career') {
            succeededCareerIds.add(req.id);
          } else {
            succeededProfileIds.add(req.id);
          }
        }
      });

      if (succeededCareerIds.size > 0) {
        setCareerRequests((prev) => prev.filter((request) => !succeededCareerIds.has(request.id)));
      }

      if (succeededProfileIds.size > 0) {
        setProfileRequests((prev) => prev.filter((request) => !succeededProfileIds.has(request.id)));
      }

      if (selectedCareerDetail && succeededCareerIds.has(selectedCareerDetail.id)) {
        setSelectedCareerDetail(null);
      }

      if (selectedProfileDetail && succeededProfileIds.has(selectedProfileDetail.id)) {
        setSelectedProfileDetail(null);
      }

      const failedCount = group.requests.length - successCount;

      if (successCount > 0 && failedCount === 0) {
        alertSuccess(
          actionType === 'approve'
            ? `Berhasil menyetujui semua request (${successCount}) untuk ${group.name}.`
            : `Berhasil menolak semua request (${successCount}) untuk ${group.name}.`
        );
      } else if (successCount > 0) {
        alertSuccess(
          actionType === 'approve'
            ? `Berhasil menyetujui ${successCount} request, ${failedCount} gagal diproses.`
            : `Berhasil menolak ${successCount} request, ${failedCount} gagal diproses.`
        );
      } else {
        alertError(
          actionType === 'approve'
            ? 'Semua request gagal disetujui. Silakan coba lagi.'
            : 'Semua request gagal ditolak. Silakan coba lagi.'
        );
      }
    } catch (err) {
      console.error(`Failed to ${actionType} all requests by user:`, err);
      alertError('Gagal memproses aksi massal: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmBulkActionByUser(group, actionType) {
    const actionLabel = actionType === 'approve' ? 'menyetujui' : 'menolak';
    const result = await alertConfirm(
      `Yakin ingin ${actionLabel} semua ${group.requestCount} request milik ${group.name}?`
    );

    if (result.isConfirmed) {
      await handleBulkActionByUser(group, actionType);
    }
  }

  const isLoading = careerLoading || profileLoading;
  const totalPending = careerRequests.length + profileRequests.length;

  const groupedRequests = useMemo(() => {
    const groups = new Map();

    const addRequest = (request, type) => {
      const userKey = String(
        request.userId ||
        request.user_id ||
        request.id_user ||
        request.nama ||
        request.name ||
        `${type}-${request.id}`
      );

      if (!groups.has(userKey)) {
        groups.set(userKey, {
          userKey,
          userId: request.userId || request.user_id || request.id_user || '-',
          name: request.name || request.nama || 'Alumni',
          initials: request.initials,
          image: request.image,
          angkatan: request.angkatan,
          requests: [],
        });
      }

      const userGroup = groups.get(userKey);

      if (!userGroup.image && request.image) userGroup.image = request.image;
      if ((!userGroup.name || userGroup.name === 'Alumni') && (request.name || request.nama)) {
        userGroup.name = request.name || request.nama;
      }
      if (!userGroup.userId && (request.userId || request.user_id || request.id_user)) {
        userGroup.userId = request.userId || request.user_id || request.id_user;
      }
      if (!userGroup.angkatan && request.angkatan) userGroup.angkatan = request.angkatan;

      userGroup.requests.push({
        ...request,
        requestType: type,
      });
    };

    careerRequests.forEach((request) => addRequest(request, 'career'));
    profileRequests.forEach((request) => addRequest(request, 'profile'));

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        requestCount: group.requests.length,
        careerCount: group.requests.filter((request) => request.requestType === 'career').length,
        profileCount: group.requests.filter((request) => request.requestType === 'profile').length,
      }))
      .sort((a, b) => b.requestCount - a.requestCount);
  }, [careerRequests, profileRequests]);

  const toggleUserRequests = (userKey) => {
    setExpandedUserKey((prev) => (prev === userKey ? null : userKey));
  };

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

  // console.log(selectedProfileDetail)

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

      {groupedRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-[#425A5C]/60 uppercase tracking-widest mb-4">Daftar User Dengan Request</h3>
          <div className="space-y-4">
            {groupedRequests.map((group) => {
              const isExpanded = expandedUserKey === group.userKey;

              return (
                <div
                  key={group.userKey}
                  className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleUserRequests(group.userKey)}
                    className="w-full p-6 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {group.image ? (
                          <img src={group.image} alt={group.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-50 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#425A5C]/10 text-[#425A5C] flex items-center justify-center font-black text-lg border-2 border-slate-50 shrink-0">
                            {group.initials || (group.name || 'A').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-black text-slate-800 text-[15px] leading-tight mb-0.5 truncate">{group.name}</h3>
                          <p className="text-[11px] text-slate-400 font-bold truncate">
                            Angkatan {group.angkatan || '-'} • {group.userId || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#425A5C]/10 text-[#425A5C]">
                          {group.requestCount} Request
                        </span>
                        {group.careerCount > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">
                            {group.careerCount} Karier
                          </span>
                        )}
                        {group.profileCount > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100">
                            {group.profileCount} Profil
                          </span>
                        )}
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                        />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            onClick={() => confirmBulkActionByUser(group, 'reject')}
                            disabled={actionLoading === `bulk-reject-${group.userKey}` || actionLoading === `bulk-approve-${group.userKey}`}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer text-xs disabled:opacity-50"
                          >
                            {actionLoading === `bulk-reject-${group.userKey}` ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak Semua
                          </button>
                          <button
                            onClick={() => confirmBulkActionByUser(group, 'approve')}
                            disabled={actionLoading === `bulk-reject-${group.userKey}` || actionLoading === `bulk-approve-${group.userKey}`}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-white bg-[#425A5C] shadow-md shadow-[#425A5C]/20 hover:bg-[#2e4042] transition-colors cursor-pointer text-xs disabled:opacity-50"
                          >
                            {actionLoading === `bulk-approve-${group.userKey}` ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Terima Semua
                          </button>
                        </div>

                        {group.requests.map((req) => {
                          const isCareer = req.requestType === 'career';
                          const meta = isCareer
                            ? { label: 'Status Karier', icon: FileEdit }
                            : SECTION_META[req.section] || { label: req.field || req.section || 'Pembaruan Profil', icon: FileEdit };
                          const SectionIcon = meta.icon;
                          const loadingKey = isCareer ? req.id : `profile-${req.id}`;

                          return (
                            <div key={`${req.requestType}-${req.id}`} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/40">
                              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-[#425A5C]">
                                    <SectionIcon size={12} /> {meta.label}
                                  </span>
                                  {isCareer ? (
                                    <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                      Karier
                                    </span>
                                  ) : (
                                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${req.action === 'create' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                      req.action === 'delete' ? 'bg-red-50 text-red-600 border border-red-100' :
                                        'bg-blue-50 text-blue-600 border border-blue-100'
                                      }`}>
                                      {req.action === 'create' ? 'Tambah Baru' : req.action === 'delete' ? 'Hapus' : 'Perubahan'}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                                    <Clock size={12} /> {req.time || '-'}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => (isCareer ? setSelectedCareerDetail(req) : setSelectedProfileDetail(req))}
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-[#425A5C] bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                                  >
                                    <Eye size={14} strokeWidth={2.5} /> Lihat Detail
                                  </button>
                                  <button
                                    onClick={() => (isCareer ? handleCareerReject(req.id) : handleProfileReject(req.id))}
                                    disabled={actionLoading === loadingKey}
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer text-xs disabled:opacity-50"
                                  >
                                    {actionLoading === loadingKey ? <Loader2 size={14} className="animate-spin" /> : <X size={14} strokeWidth={3} />} Tolak
                                  </button>
                                  <button
                                    onClick={() => (isCareer ? handleCareerApprove(req.id) : handleProfileApprove(req.id))}
                                    disabled={actionLoading === loadingKey}
                                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-white bg-[#425A5C] shadow-md shadow-[#425A5C]/20 hover:bg-[#2e4042] transition-colors cursor-pointer text-xs disabled:opacity-50"
                                  >
                                    {actionLoading === loadingKey ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />} Terima
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {(req.changes || [])
                                  .filter((change) => change.new !== '-')
                                  .map((change, idx) => (
                                    <span
                                      key={`${change.label}-${idx}`}
                                      className="px-3 py-1.5 bg-white text-[#526061] border border-slate-200 rounded-lg text-[11px] font-bold"
                                    >
                                      {change.label}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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