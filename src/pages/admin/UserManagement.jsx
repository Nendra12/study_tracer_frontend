import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, FileEdit, Users, Search,
  Download, Loader2
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

const PER_PAGE = 7;

const UserManagementSkeleton = () => {
  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      <div className="space-y-8">
        {/* Stats Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="space-y-2">
                <div className="w-24 h-3 bg-slate-200 rounded"></div>
                <div className="w-16 h-6 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Area Skeleton */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2 w-full md:w-auto">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-8 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex-1 md:w-64 h-10 bg-slate-200 rounded-xl"></div>
              <div className="w-28 h-10 bg-slate-200 rounded-xl"></div>
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
               <div className="w-full h-6 bg-slate-200 rounded"></div>
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 py-5">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
                    <div className="w-1/4 h-3 bg-slate-100 rounded"></div>
                  </div>
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

// --- MAIN PAGE COMPONENT ---
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Alumni State
  const [alumni, setAlumni] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 7 });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState('Semua');
  const [jurusanList, setJurusanList] = useState([]);
  const [isTahunFilterOpen, setIsTahunFilterOpen] = useState(false);
  const [selectedTahunLulus, setSelectedTahunLulus] = useState('Semua');
  const [tahunLulusList, setTahunLulusList] = useState([]);

  // Modal & Action States
  const [actionLoading, setActionLoading] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [detailAlumni, setDetailAlumni] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const tabs = [
    { label: 'Semua', value: null },
    { label: 'Menunggu', value: 'pending' },
    { label: 'Aktif', value: 'ok' },
    { label: 'Ditolak', value: 'rejected' },
    { label: 'Blacklist', value: 'banned' },
  ];

  // Debounce Search Logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Stats
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

  // Fetch Initial Data (Jurusan & Tahun)
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch, selectedJurusan, selectedTahunLulus]);

  // Fetch Alumni Data
  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      setAlumniLoading(true);
      try {
        const filters = getFilters();
        const res = await adminApi.getAllAlumni({ ...filters, page: currentPage }, PER_PAGE);
        if (cancelled) return;
        
        const payload = res.data.data;
        if (payload?.data && Array.isArray(payload.data)) {
          setAlumni(payload.data);
          const meta = payload.meta || payload;
          setPagination({
            current_page: meta.current_page || 1,
            last_page: meta.last_page || 1,
            total: meta.total || 0,
            per_page: meta.per_page || PER_PAGE,
          });
        }
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

  // --- ACTION HANDLERS ---
  const handleApprove = async (alumniId) => {
    const { isConfirmed } = await alertConfirm('Setujui alumni ini?');
    if (!isConfirmed) return;
    setActionLoading(alumniId);
    try {
      await adminApi.approveUser(alumniId);
      alertSuccess('Alumni berhasil disetujui');
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menyetujui alumni');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (alumniId) => {
    const { isConfirmed, value: alasan } = await Swal.fire({
      title: 'Tolak Alumni',
      input: 'textarea',
      inputLabel: 'Alasan Penolakan',
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
      alertSuccess('Alumni berhasil ditolak');
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menolak alumni');
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
    const { isConfirmed } = await alertConfirm(`Hapus user "${name}"?`);
    if (!isConfirmed) return;
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      alertSuccess('User berhasil dihapus');
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menghapus user');
    } finally { setActionLoading(null); }
  };

  const handleViewDetail = async (alumniId) => {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await adminApi.getAlumniDetail(alumniId);
      setDetailAlumni(res.data.data);
    } catch {
      alertError('Gagal memuat detail');
      setShowDetail(false);
    } finally { setDetailLoading(false); }
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
      a.download = `alumni_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { alertError('Gagal ekspor data'); } 
    finally { setExportLoading(false); }
  };

  const statsCards = [
    { title: "Menunggu Verifikasi", value: stats?.pending ?? '-', icon: UserPlus, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
    { title: "Alumni Aktif", value: stats?.active ?? '-', icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Total Alumni", value: stats?.total ?? '-', trend: stats?.profile_updated ? `${stats.profile_updated} update` : null, icon: FileEdit, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  ];

  // --- RENDER LOGIC ---
  if (statsLoading && alumniLoading && alumni.length === 0) {
    return <UserManagementSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      <div className="space-y-8 animate-in fade-in duration-500">

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((s, i) => (
            <ManagementStatCard key={i} {...s} loading={statsLoading} />
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
            <UserManagementTabs
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              pendingCount={stats?.pending}
            />

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:border-primary rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
              
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs shadow-md disabled:opacity-50"
              >
                {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Eksport CSV</span>
              </button>

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
            STORAGE_BASE_URL={STORAGE_BASE_URL}
          />
        </div>

        <AlumniDetailModal
          showDetail={showDetail}
          setShowDetail={setShowDetail}
          detailLoading={detailLoading}
          detailAlumni={detailAlumni}
          handleApprove={handleApprove}
          handleReject={handleReject}
          STORAGE_BASE_URL={STORAGE_BASE_URL}
        />
      </div>
    </div>
  );
}