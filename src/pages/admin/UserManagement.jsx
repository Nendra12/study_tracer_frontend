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

import ManagementStatCard from '../../components/admin/ManagementStatCard';
import UserManagementTabs from '../../components/admin/UserManagementTabs';
import FilterJurusan from '../../components/admin/FilterJurusan';
import FilterTahunLulus from '../../components/admin/FilterTahunLulus';
import AlumniTable from '../../components/admin/AlumniTable';
import AlumniDetailModal from '../../components/admin/AlumniDetailModal';
import ProfileUpdateRequests from '../../components/admin/ProfileUpdateRequests';

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
  }, [fetchStats]);

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

  const refreshAlumni = () => setFetchTrigger(c => c + 1);

  const handleApprove = async (alumniId) => {
    const { isConfirmed } = await alertConfirm('Apakah Anda yakin ingin menyetujui alumni ini?');
    if (!isConfirmed) return;
    setActionLoading(alumniId);
    try {
      await adminApi.approveUser(alumniId);
      alertSuccess('Verifikasi Berhasil', 'Akun alumni kini telah aktif dan dapat mengakses sistem.');
      refreshAlumni();
      fetchStats();
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
      await adminApi.rejectUser(alumniId, { alasan });
      alertSuccess('Data Ditolak', 'Notifikasi penolakan telah dikirimkan ke alumni yang bersangkutan.');
      refreshAlumni();
      fetchStats();
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
      await adminApi.banUser(alumniId, { alasan });
      alertSuccess(`User "${name}" berhasil diblacklist`);
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal melakukan blacklist');
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (userId, name) => {
    const { isConfirmed } = await alertConfirm(`Apakah Anda yakin ingin menghapus permanen user "${name}"?`);
    if (!isConfirmed) return;
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      alertSuccess('Dihapus!', 'Data user berhasil dihapus dari sistem.');
      refreshAlumni();
      fetchStats();
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
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Data_Alumni_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
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
        
        {/* 1. Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((s, i) => (
            <ManagementStatCard key={i} {...s} loading={statsLoading} />
          ))}
        </div>

        {/* 2. User Management Table Section */}
        <div className="space-y-6">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <UserManagementTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              pendingCount={stats?.pending}
            />

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="relative group flex-1 md:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-primary rounded-xl text-sm outline-none transition-all"
                />
              </div>

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
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3C5759] text-white font-bold rounded-xl hover:bg-[#2A3E3F] transition-all text-xs shadow-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {exportLoading ? <Loader2 size={16} className="animate-pulse" /> : <Download size={16} />}
                <span className="hidden sm:inline">Eksport CSV</span>
              </button>
            </div>
          </div>

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
          />
        </div>

        {/* 3. KOMPONEN UPDATE REQUEST (Dipindah ke bawah Tabel) */}
        <ProfileUpdateRequests />

        {/* Modals */}
        <AlumniDetailModal
          showDetail={showDetail}
          setShowDetail={setShowDetail}
          detailLoading={detailLoading}
          detailAlumni={detailAlumni}
          handleApprove={handleApprove}
          handleReject={handleReject}
          STORAGE_BASE_URL={STORAGE_BASE_URL}
        />

        {/* Modal Pop-up Foto Bulat */}
        {showPhotoPreview && createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300"
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