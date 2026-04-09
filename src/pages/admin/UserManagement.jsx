import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  UserPlus, FileEdit, Users, Search,
  Download, Loader2, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import { adminApi } from '../../api/admin';
import { STORAGE_BASE_URL } from '../../api/axios';
import { alertSuccess, alertError, alertConfirm } from '../../utilitis/alert';
import { downloadCsvFromPayload } from '../../utilitis/export';

import ManagementStatCard from '../../components/admin/user/ManagementStatCard';
import UserManagementTabs from '../../components/admin/user/UserManagementTabs';
import FilterJurusan from '../../components/admin/FilterJurusan';
import FilterTahunLulus from '../../components/admin/FilterTahunLulus';
import AlumniTable from '../../components/admin/user/AlumniTable';
import AlumniDetailModal from '../../components/admin/user/AlumniDetailModal';
import ProfileUpdateRequests from '../../components/admin/user/ProfileUpdateRequests';
import FeaturedAlumniList from '../../components/admin/user/FeaturedAlumniList'; 

const PER_PAGE = 7;

const UserManagementSkeleton = () => (
  <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="w-24 h-3 bg-slate-200 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-2 w-full md:w-auto overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-16 h-8 bg-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex-1 md:w-64 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
            <div className="w-28 h-10 bg-slate-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm h-96 animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [alumni, setAlumni] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 7 });
  const [currentPage, setCurrentPage] = useState(1);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState('Semua');
  const [jurusanList, setJurusanList] = useState([]);
  const [isTahunFilterOpen, setIsTahunFilterOpen] = useState(false);
  const [selectedTahunLulus, setSelectedTahunLulus] = useState('Semua');
  const [tahunLulusList, setTahunLulusList] = useState([]);

  const [actionLoading, setActionLoading] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [detailAlumni, setDetailAlumni] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const [featuredAlumni, setFeaturedAlumni] = useState([]);

  const tabs = [
    { label: 'Semua', value: null },
    { label: 'Menunggu', value: 'pending' },
    { label: 'Aktif', value: 'ok' },
    { label: 'Ditolak', value: 'rejected' },
    { label: 'Blacklist', value: 'banned' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await adminApi.getUserStats();
      setStats(res.data.data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const normalizeFeaturedPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.featured_alumni)) return payload.featured_alumni;
    return [];
  };

  const fetchFeaturedAlumni = useCallback(async () => {
    try {
      const res = await adminApi.getFeaturedAlumni();
      const list = normalizeFeaturedPayload(res.data?.data ?? res.data);
      setFeaturedAlumni(list);
    } catch {
      setFeaturedAlumni([]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getJurusan();
        setJurusanList(res.data.data || []);
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 2010; i--) years.push(i);
        setTahunLulusList(years);
      } catch { /* ignore */ }
    })();
    fetchStats();
    fetchFeaturedAlumni();
  }, [fetchStats, fetchFeaturedAlumni]);

  const getFilters = () => {
    const currentTab = tabs.find(t => t.label === activeTab);
    const filters = {};
    if (currentTab?.value) filters.status_create = currentTab.value;
    if (debouncedSearch) filters.search = debouncedSearch;
    if (selectedJurusan !== 'Semua') filters.id_jurusan = selectedJurusan;
    if (selectedTahunLulus !== 'Semua') filters.tahun_lulus = selectedTahunLulus;
    return filters;
  };

  useEffect(() => { setCurrentPage(1); }, [activeTab, debouncedSearch, selectedJurusan, selectedTahunLulus]);

  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      setAlumniLoading(true);
      try {
        const filters = getFilters();
        const res = await adminApi.getAllAlumni({ ...filters, page: currentPage }, PER_PAGE);
        if (cancelled) return;

        const payload = res.data.data;
        setAlumni(payload.data || []);
        
        const meta = payload.meta || payload;
        setPagination({
          current_page: meta.current_page || 1,
          last_page: meta.last_page || 1,
          total: meta.total || 0,
          per_page: meta.per_page || PER_PAGE,
        });
      } catch {
        if (!cancelled) setAlumni([]);
      } finally {
        if (!cancelled) setAlumniLoading(false);
      }
    };
    doFetch();
    return () => { cancelled = true; };
  }, [currentPage, activeTab, debouncedSearch, selectedJurusan, selectedTahunLulus, fetchTrigger]);

  useEffect(() => {
    if (fetchTrigger === 0) return;
    fetchStats();
  }, [fetchTrigger, fetchStats]);

  const refreshAlumni = () => setFetchTrigger(c => c + 1);

  const isSameAlumni = (item, alumniId) => {
    if (!item) return false;
    return [item.id, item.user_id, item.id_alumni].some((id) => String(id) === String(alumniId));
  };

  const patchStatsOnStatusChange = (fromStatus, toStatus) => {
    setStats(prev => {
      if (!prev) return prev;
      const next = { ...prev };

      if (fromStatus === 'pending') next.pending = Math.max(0, (Number(next.pending) || 0) - 1);
      if (fromStatus === 'ok') next.active = Math.max(0, (Number(next.active) || 0) - 1);
      if (toStatus === 'ok') next.active = (Number(next.active) || 0) + 1;

      return next;
    });
  };

  // FUNGSI UNTUK TOGGLE FEATURED ALUMNI
  const handleToggleFeatured = async (alumniId, isCurrentlyFeatured) => {
    const selectedAlumni = alumni.find(a => a.id === alumniId);
    
    try {
      if (!isCurrentlyFeatured && featuredAlumni.length >= 6) {
        alertError('Batas Maksimal', 'Maksimal hanya 6 alumni yang dapat disorot.');
        return;
      }

      await adminApi.toggleFeaturedAlumni(alumniId, !isCurrentlyFeatured);

      if (isCurrentlyFeatured) {
        setFeaturedAlumni(prev => prev.filter(a => a.id !== alumniId));
        setAlumni(prev => prev.map(item => item.id === alumniId ? { ...item, is_featured: false } : item));
        alertSuccess('Dihapus dari Sorotan', 'Alumni tidak lagi ditampilkan di Beranda.');
      } else {
        if (selectedAlumni) {
          setFeaturedAlumni(prev => {
            if (prev.some(a => a.id === alumniId)) return prev;
            return [...prev, { ...selectedAlumni, is_featured: true }];
          });
        }
        setAlumni(prev => prev.map(item => item.id === alumniId ? { ...item, is_featured: true } : item));
        alertSuccess('Ditambahkan ke Sorotan', 'Alumni kini ditampilkan di Beranda.');
      }
    } catch (err) {
      alertError('Gagal mengubah sorotan', err.response?.data?.message || 'Terjadi kesalahan saat mengubah alumni sorotan.');
      await fetchFeaturedAlumni();
    }
  };

  const handleApprove = async (alumniId) => {
    const { isConfirmed } = await alertConfirm('Apakah Anda yakin ingin menyetujui alumni ini?');
    if (!isConfirmed) return;
    setActionLoading(alumniId);
    try {
      const target = alumni.find(item => isSameAlumni(item, alumniId));
      await adminApi.approveUser(alumniId);

      patchStatsOnStatusChange(target?.status_create, 'ok');
      setAlumni(prev => {
        if (activeTab === 'Menunggu') return prev.filter(item => !isSameAlumni(item, alumniId));
        return prev.map(item => (isSameAlumni(item, alumniId) ? { ...item, status_create: 'ok' } : item));
      });

      alertSuccess('Verifikasi Berhasil', 'Akun alumni kini telah aktif dan dapat mengakses sistem.');
      refreshAlumni();
    } catch (err) {
      alertError('Gagal Verifikasi', err.response?.data?.message || 'Terjadi kesalahan saat menyetujui data.');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (alumniId) => {
    const { isConfirmed, value: alasan } = await Swal.fire({
      title: 'Tolak Verifikasi',
      text: "Berikan alasan penolakan untuk menginformasikan alumni",
      input: 'textarea',
      inputPlaceholder: 'Tulis alasan penolakan...',
      showCancelButton: true,
      confirmButtonText: 'Tolak',
      confirmButtonColor: '#ef4444',
      inputValidator: (val) => !val?.trim() && 'Alasan penolakan wajib diisi',
    });
    if (!isConfirmed) return;
    setActionLoading(alumniId);
    try {
      const target = alumni.find(item => isSameAlumni(item, alumniId));
      await adminApi.rejectUser(alumniId, { alasan });

      patchStatsOnStatusChange(target?.status_create, 'rejected');
      setAlumni(prev => {
        if (activeTab === 'Menunggu') return prev.filter(item => !isSameAlumni(item, alumniId));
        return prev.map(item => (isSameAlumni(item, alumniId) ? { ...item, status_create: 'rejected' } : item));
      });

      alertSuccess('Data Ditolak', 'Notifikasi penolakan telah dikirimkan ke alumni yang bersangkutan.');
      refreshAlumni();
    } catch (err) {
      alertError('Gagal Menolak', err.response?.data?.message || 'Gagal memproses penolakan.');
    } finally { setActionLoading(null); }
  };

  const handleBan = async (alumniId, name) => {
    const { isConfirmed, value: alasan } = await Swal.fire({
      title: `Blacklist "${name}"?`,
      input: 'textarea',
      inputLabel: 'Alasan Blacklist',
      showCancelButton: true,
      confirmButtonText: 'Blacklist',
      confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    setActionLoading(alumniId);
    try {
      const target = alumni.find(item => isSameAlumni(item, alumniId));
      await adminApi.banUser(alumniId, { alasan });

      patchStatsOnStatusChange(target?.status_create, 'banned');
      setAlumni(prev => {
        if (activeTab === 'Menunggu' || activeTab === 'Aktif') return prev.filter(item => !isSameAlumni(item, alumniId));
        return prev.map(item => (isSameAlumni(item, alumniId) ? { ...item, status_create: 'banned' } : item));
      });

      alertSuccess(`User "${name}" berhasil diblacklist`);
      refreshAlumni();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal melakukan blacklist');
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (userId, name) => {
    const { isConfirmed } = await alertConfirm(`Apakah Anda yakin ingin menghapus permanen user "${name}"?`);
    if (!isConfirmed) return;
    setActionLoading(userId);
    try {
      const target = alumni.find(item => isSameAlumni(item, userId));
      await adminApi.deleteUser(userId);

      patchStatsOnStatusChange(target?.status_create, null);
      setStats(prev => {
        if (!prev) return prev;
        return { ...prev, total: Math.max(0, (Number(prev.total) || 0) - 1) };
      });
      setAlumni(prev => prev.filter(item => !isSameAlumni(item, userId)));

      alertSuccess('Dihapus!', 'Data user berhasil dihapus dari sistem.');
      refreshAlumni();
    } catch (err) {
      alertError('Gagal!', err.response?.data?.message || 'Gagal menghapus user.');
    } finally { setActionLoading(null); }
  };

  const handleViewDetail = async (alumniId) => {
    if (!alumniId) {
      alertError('Gagal!', 'ID Alumni tidak valid/kosong.');
      return;
    }
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await adminApi.getAlumniDetail(alumniId);
      setDetailAlumni(res.data.data || res.data);
    } catch (error) {
      console.error("Error Get Detail:", error);
      const errorMsg = error.response?.data?.message || 'Tidak dapat memuat detail data alumni.';
      alertError('Gagal!', errorMsg);
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const filters = getFilters();
      const res = await adminApi.exportAlumniCsv(filters);
      await downloadCsvFromPayload({ payload: res.data, prefix: 'data_alumni' });
      alertSuccess('Ekspor Berhasil', 'Data alumni telah diunduh dalam format CSV.');
    } catch {
      alertError('Ekspor Gagal', 'Sistem gagal mengekspor data.');
    } finally { setExportLoading(false); }
  };

  const handlePhotoClick = (url) => {
    setPreviewUrl(url);
    setShowPhotoPreview(true);
  };

  const statsCards = [
    { title: "Menunggu Verifikasi", value: stats?.pending ?? '-', icon: UserPlus, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
    { title: "Alumni Aktif", value: stats?.active ?? '-', icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Total Alumni", value: stats?.total ?? '-', trend: stats?.profile_updated ? `${stats.profile_updated} update` : null, icon: FileEdit, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  ];

  if (statsLoading && alumniLoading && alumni.length === 0) return <UserManagementSkeleton />;

  return (
    <div className="space-y-6 max-w-full p-1 animate-in fade-in duration-700">
      <div className="space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((s, i) => (
            <ManagementStatCard key={i} {...s} loading={statsLoading} />
          ))}
        </div>

        {/* KOMPONEN ALUMNI PILIHAN (FEATURED) */}
        <FeaturedAlumniList 
          featuredAlumni={featuredAlumni} 
          onRemoveFeatured={(id) => handleToggleFeatured(id, true)} 
          STORAGE_BASE_URL={STORAGE_BASE_URL}
        />

        {/* User Management Table Section */}
        <div className="space-y-6">
          
          {/* TOOLBAR UTAMA */}
          <div className="bg-white p-2 md:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4 transition-all relative z-40">
            
            {/* TABS (Kiri) */}
            <div className="w-full lg:w-max overflow-x-auto no-scrollbar shrink-0">
              <UserManagementTabs
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                pendingCount={stats?.pending}
              />
            </div>

            {/* SEARCH, FILTER, & EXPORT (Kanan) */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto flex-1 lg:justify-end">
              <div className="relative group w-full sm:w-auto flex-1 min-w-37.5 max-w-full lg:max-w-70">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl text-sm outline-none transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto shrink-0 relative z-50">
                <FilterJurusan
                  isFilterOpen={isFilterOpen}
                  setIsFilterOpen={setIsFilterOpen}
                  selectedJurusan={selectedJurusan}
                  setSelectedJurusan={setSelectedJurusan}
                  jurusanList={jurusanList}
                />
                <FilterTahunLulus
                  isTahunFilterOpen={isTahunFilterOpen}
                  setIsTahunFilterOpen={setIsTahunFilterOpen}
                  selectedTahunLulus={selectedTahunLulus}
                  setSelectedTahunLulus={setSelectedTahunLulus}
                  tahunLulusList={tahunLulusList}
                />
                <button
                  onClick={handleExport}
                  disabled={exportLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 active:scale-95 transition-all text-sm shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span className="inline">Eksport CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABEL DATA ALUMNI */}
          <AlumniTable
            alumni={alumni}
            alumniLoading={alumniLoading}
            pagination={pagination}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            actionLoading={actionLoading}
            handleViewDetail={handleViewDetail}
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleBan={handleBan}
            handleDelete={handleDelete}
            handlePhotoClick={handlePhotoClick}
            STORAGE_BASE_URL={STORAGE_BASE_URL}
            
            // PASSING STATE & HANDLER KE TABLE
            featuredAlumniIds={featuredAlumni.map(a => a.id)}
            handleToggleFeatured={handleToggleFeatured}
          />
        </div>

        <ProfileUpdateRequests />

        {/* Modals & Popups */}
        <AlumniDetailModal
          showDetail={showDetail}
          setShowDetail={setShowDetail}
          detailLoading={detailLoading}
          detailAlumni={detailAlumni}
          handleApprove={handleApprove}
          handleReject={handleReject}
          STORAGE_BASE_URL={STORAGE_BASE_URL}
        />

        {showPhotoPreview && createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
            onClick={() => setShowPhotoPreview(false)}
          >
            <div className="relative max-w-lg w-full bg-white p-2 rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur shadow-md rounded-full text-slate-600 hover:text-red-500 transition-colors z-10 cursor-pointer"
                onClick={() => setShowPhotoPreview(false)}
              >
                <X size={20} />
              </button>
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  alt="Preview Alumni"
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
              </div>
              <div className="p-4 text-center">
                <p className="font-bold text-slate-800">Pratinjau Foto Profil</p>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}