import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus, FileEdit, Users, Search,
  Filter, Check, X, Image as ImageIcon,
  Download, ChevronLeft, ChevronRight, Trash2, Loader2, Eye, Ban,
  Instagram, Linkedin, Facebook, Globe, Github
} from 'lucide-react';
import Swal from 'sweetalert2';
import { adminApi } from '../../api/admin';
import { STORAGE_BASE_URL } from '../../api/axios';
import { alertSuccess, alertError, alertConfirm } from '../../utilitis/alert';

const PER_PAGE = 7;

// Pagination helper: show max 7 page numbers
const getPageNumbers = (current, last) => {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
  if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
  return [1, '...', current - 1, current, current + 1, '...', last];
};

// Normalize foto URL from backend
const buildFotoUrl = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('http')) return foto;
  // Strip leading 'storage/' since STORAGE_BASE_URL already ends with '/storage'
  const path = foto.replace(/^\/?(storage\/)?/, '');
  return `${STORAGE_BASE_URL}/${path}`;
};

const ManagementStatCard = ({ title, value, trend, icon: Icon, iconBg, iconColor, loading }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between group">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-slate-800 group-hover:text-primary transition-colors">
          {loading ? <Loader2 size={24} className="animate-spin" /> : value}
        </h3>
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
            {trend}
          </span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={24} />
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // Stats
  //
  console.log(debouncedSearch)
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Alumni list
  const [alumni, setAlumni] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 7 });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState('Semua');
  const [jurusanList, setJurusanList] = useState([]);

  // Filter 2 (Tahun Lulus)
  const [isTahunFilterOpen, setIsTahunFilterOpen] = useState(false);
  const [selectedTahunLulus, setSelectedTahunLulus] = useState('Semua');
  const [tahunLulusList, setTahunLulusList] = useState([]);

  // Action loading
  const [actionLoading, setActionLoading] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  // Detail modal
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch stats
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

  // Fetch jurusan & tahun lulus for filter
  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.getJurusan();
        setJurusanList(res.data.data || []);
        
        // Generate years (current year down to 2010)
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= 2010; i--) {
          years.push(i);
        }
        setTahunLulusList(years);
      } catch { /* ignore */ }
    })();
  }, []);

  // Build filters helper
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

  // Fetch alumni when page/filters/trigger change
  useEffect(() => {
    let cancelled = false;
    const doFetch = async () => {
      setAlumniLoading(true);
      try {
        const filters = getFilters(); // Use existing helper

        const res = await adminApi.getAllAlumni({ ...filters, page: currentPage }, PER_PAGE);
        if (cancelled) return;
        console.log('Alumni API response:', res.data);
        const payload = res.data.data; // could be { data: [...], meta: {...} } or { data: [...], current_page, ... }

        if (payload?.data && Array.isArray(payload.data)) {
          setAlumni(payload.data);
          // pagination info may be in payload.meta (Laravel resource) or payload itself (raw paginator)
          const meta = payload.meta || payload;
          setPagination({
            current_page: meta.current_page || 1,
            last_page: meta.last_page || 1,
            total: meta.total || 0,
            per_page: meta.per_page || PER_PAGE,
          });
        } else if (Array.isArray(payload)) {
          setAlumni(payload);
          setPagination({
            current_page: 1,
            last_page: 1,
            total: payload.length,
            per_page: PER_PAGE,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab, debouncedSearch, selectedJurusan, selectedTahunLulus, fetchTrigger]);

  // Force re-fetch after actions
  const refreshAlumni = () => setFetchTrigger(c => c + 1);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Approve user
  const handleApprove = async (alumniId) => {
    setActionLoading(alumniId);
    try {
      await adminApi.approveUser(alumniId);
      alertSuccess('Alumni berhasil disetujui');
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menyetujui alumni');
    } finally {
      setActionLoading(null);
    }
  };

  // Reject user with reason
  const handleReject = async (alumniId) => {
    const { isConfirmed, value: alasan } = await Swal.fire({
      title: 'Tolak Alumni',
      input: 'textarea',
      inputLabel: 'Alasan Penolakan',
      inputPlaceholder: 'Tulis alasan penolakan...',
      inputAttributes: { 'aria-label': 'Alasan penolakan' },
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Tolak',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
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
    } finally {
      setActionLoading(null);
    }
  };

  // Ban user
  const handleBan = async (alumniId, name) => {
    const { isConfirmed, value: alasan } = await Swal.fire({
      title: `Blacklist Pengguna "${name}"?`,
      input: 'textarea',
      inputLabel: 'Alasan Blacklist',
      inputPlaceholder: 'Tulis alasan blacklist...',
      showCancelButton: true,
      cancelButtonText: 'Batal',
      confirmButtonText: 'Blacklist User',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
    });
    if (!isConfirmed) return;

    setActionLoading(alumniId);
    try {
      await adminApi.banUser(alumniId, { alasan });
      alertSuccess(`User "${name}" berhasil diblacklist`);
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal melakukan blacklist user');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete user
  const handleDelete = async (userId, name) => {
    const { isConfirmed } = await alertConfirm(`Hapus user "${name}"? Semua data terkait akan ikut terhapus.`);
    if (!isConfirmed) return;
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      alertSuccess('User berhasil dihapus');
      refreshAlumni();
      fetchStats();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menghapus user');
    } finally {
      setActionLoading(null);
    }
  };

  // View detail
  const handleViewDetail = async (alumniId) => {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await adminApi.getAlumniDetail(alumniId);
      setDetailAlumni(res.data.data);
    } catch {
      alertError('Gagal memuat detail alumni');
      setShowDetail(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Export CSV
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
    } catch {
      alertError('Gagal mengekspor data');
    } finally {
      setExportLoading(false);
    }
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

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  // Extract year from tahun_lulus (could be date string "2023-06-01", ISO string, or number)
  const extractYear = (val) => {
    if (!val) return null;
    if (typeof val === 'number') return String(val);
    const str = String(val);
    const match = str.match(/\d{4}/);
    return match ? match[0] : str;
  };

  const statsCards = [
    { title: "Menunggu Verifikasi", value: stats?.pending ?? '-', trend: null, icon: UserPlus, iconBg: "bg-orange-50", iconColor: "text-orange-500" },
    { title: "Alumni Aktif", value: stats?.active ?? '-', trend: null, icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { title: "Total Alumni", value: stats?.total ?? '-', trend: stats?.profile_updated ? `${stats.profile_updated} update bulan ini` : null, icon: FileEdit, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="space-y-8">

        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((s, i) => <ManagementStatCard key={i} {...s} loading={statsLoading} />)}
        </div>

        {/* ======================= TABEL ALUMNI ======================= */}
        <div className="space-y-6">

          {/* Table Controls */}
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">

            {/* Tabs */}
            <div className="flex bg-slate-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar border border-slate-100">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`cursor-pointer px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                    ${activeTab === tab.label
                      ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  {tab.label}
                  {tab.label === 'Menunggu' && stats?.pending > 0 && (
                    <span className="ml-1.5 bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">{stats.pending}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search - CSV - Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari nama, NIS, NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 hover:border-slate-200 focus:border-primary rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
              <button
                onClick={handleExport}
                disabled={exportLoading}
                className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs shadow-md shadow-primary/20 whitespace-nowrap disabled:opacity-50"
                title="Eksport Data CSV"
              >
                {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span>Eksport CSV</span>
              </button>

              {/* Filter Jurusan */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`cursor-pointer p-2.5 rounded-xl transition-all border
                    ${isFilterOpen || selectedJurusan !== 'Semua'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  <Filter size={18} />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Jurusan</span>
                      {selectedJurusan !== 'Semua' && (
                        <button onClick={() => { setSelectedJurusan('Semua'); setIsFilterOpen(false); }} className="text-[10px] text-primary font-bold hover:underline">Reset</button>
                      )}
                    </div>
                    <div className="p-1 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedJurusan('Semua'); setIsFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
                          ${selectedJurusan === 'Semua' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Semua Jurusan
                        {selectedJurusan === 'Semua' && <Check size={14} />}
                      </button>
                      {jurusanList.map((j) => (
                        <button
                          key={j.id}
                          onClick={() => { setSelectedJurusan(j.id); setIsFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
                            ${selectedJurusan === j.id ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {j.nama}
                          {selectedJurusan === j.id && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Tahun Lulus */}
              <div className="relative">
                <button
                  onClick={() => setIsTahunFilterOpen(!isTahunFilterOpen)}
                  className={`cursor-pointer p-2.5 rounded-xl transition-all border
                    ${isTahunFilterOpen || selectedTahunLulus !== 'Semua'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  title="Filter Tahun Lulus"
                >
                  <span className="text-xs font-bold mr-1">Tahun</span>
                  <Filter size={14} className="inline" />
                </button>

                {isTahunFilterOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun Lulus</span>
                      {selectedTahunLulus !== 'Semua' && (
                        <button onClick={() => { setSelectedTahunLulus('Semua'); setIsTahunFilterOpen(false); }} className="text-[10px] text-primary font-bold hover:underline">Reset</button>
                      )}
                    </div>
                    <div className="p-1 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => { setSelectedTahunLulus('Semua'); setIsTahunFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
                          ${selectedTahunLulus === 'Semua' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        Semua Tahun
                        {selectedTahunLulus === 'Semua' && <Check size={14} />}
                      </button>
                      {tahunLulusList.map((year) => (
                        <button
                          key={year}
                          onClick={() => { setSelectedTahunLulus(year); setIsTahunFilterOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-colors flex justify-between items-center
                            ${selectedTahunLulus === year ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {year}
                          {selectedTahunLulus === year && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
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
                              href={buildFotoUrl(item.foto)}
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
        </div>

        {showDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDetail(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={32} className="animate-spin text-primary" />
                </div>
              ) : detailAlumni ? (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-primary">Detail Alumni</h2>
                    <button onClick={() => setShowDetail(false)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    {detailAlumni.foto ? (
                      <img
                        src={buildFotoUrl(detailAlumni.foto)}
                        alt={detailAlumni.nama}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-slate-700 text-white items-center justify-center font-bold text-xl shadow-md"
                      style={{ display: detailAlumni.foto ? 'none' : 'flex' }}
                    >
                      {getInitials(detailAlumni.nama)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{detailAlumni.nama}</h3>
                      <p className="text-sm text-slate-500">{detailAlumni.user?.email || '-'}</p>
                      <div className="mt-1">{statusBadge(detailAlumni.status_create)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ['NIS', detailAlumni.nis],
                      ['NISN', detailAlumni.nisn],
                      ['Jenis Kelamin', detailAlumni.jenis_kelamin],
                      ['Tempat Lahir', detailAlumni.tempat_lahir],
                      ['Tanggal Lahir', detailAlumni.tanggal_lahir],
                      ['Tahun Masuk', detailAlumni.tahun_masuk],
                      ['Tahun Lulus', extractYear(detailAlumni.tahun_lulus)],
                      ['Jurusan', detailAlumni.jurusan?.nama],
                      ['Alamat', detailAlumni.alamat],
                      ['No HP', detailAlumni.no_hp],
                    ].map(([label, val], i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
                        <p className="font-medium text-slate-700">{val || '-'}</p>
                      </div>
                    ))}
                  </div>

                  {/* --- BAGIAN MEDIA SOSIAL --- */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Media Sosial & Tautan</p>
                    
                    {/* Logika: Cek apakah setidaknya ada satu sosmed yang memiliki isi (val) */}
                    {Object.values({
                      ig: detailAlumni.instagram,
                      li: detailAlumni.linkedin,
                      gh: detailAlumni.github,
                      fb: detailAlumni.facebook,
                      ws: detailAlumni.website
                    }).some(val => val) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { label: 'Instagram', val: detailAlumni.instagram, icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
                          { label: 'LinkedIn', val: detailAlumni.linkedin, icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' },
                          { label: 'GitHub', val: detailAlumni.github, icon: Github, color: 'text-slate-800', bg: 'bg-slate-100' },
                          { label: 'Facebook', val: detailAlumni.facebook, icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
                          { label: 'Website', val: detailAlumni.website, icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        ].map((soc, i) => (
                          // Tampilkan hanya jika soc.val ada isinya
                          soc.val && (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border border-slate-100 ${soc.bg}`}>
                              <soc.icon size={18} className={soc.color} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{soc.label}</p>
                                <a 
                                  href={soc.val.startsWith('http') ? soc.val : `https://${soc.val}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs font-bold text-slate-700 hover:text-primary truncate block transition-colors"
                                >
                                  {soc.val.replace(/^https?:\/\/(www\.)?/, '')}
                                </a>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      /* Tampilkan "-" jika semua field sosial media kosong */
                      <p className="text-sm text-slate-400 font-medium italic">-</p>
                    )}
                  </div>

                  {/* --- BAGIAN SKILLS (Pastikan juga menampilkan "-" jika kosong) --- */}
                  <div className="mt-5">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {detailAlumni.skills && detailAlumni.skills.length > 0 ? (
                        detailAlumni.skills.map(s => (
                          <span key={s.id} className="px-3 py-1.5 bg-white text-primary text-[11px] font-bold rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {s.nama}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 font-medium italic">-</span>
                      )}
                    </div>
                  </div>

                  {/* --- RIWAYAT KARIR --- */}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Riwayat Karir</p>
                    <div className="space-y-2">
                      {detailAlumni.riwayat_status && detailAlumni.riwayat_status.length > 0 ? (
                        detailAlumni.riwayat_status.map((r) => (
                          <div key={r.id} className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{r.status?.nama || 'Status'}</span>
                              <span className="text-slate-400 text-xs">
                                ({r.tahun_mulai}{r.tahun_selesai ? ` - ${r.tahun_selesai}` : ' - Sekarang'})
                              </span>
                            </div>
                            
                            {/* Detail Pekerjaan */}
                            {r.pekerjaan && (
                              <p className="text-slate-600 text-xs mt-1 font-medium">
                                {r.pekerjaan.posisi} di <span className="text-slate-800">{r.pekerjaan.perusahaan?.nama || '-'}</span>
                              </p>
                            )}

                            {/* Detail Kuliah */}
                            {r.universitas && (
                              <p className="text-slate-600 text-xs mt-1 font-medium">
                                {r.universitas.nama} — <span className="text-slate-800">{r.universitas.jurusan_kuliah?.nama || '-'}</span>
                              </p>
                            )}

                            {/* Detail Wirausaha */}
                            {r.wirausaha && (
                              <p className="text-slate-600 text-xs mt-1 font-medium">
                                {r.wirausaha.nama_usaha} (<span className="text-slate-800">{r.wirausaha.bidang_usaha?.nama || '-'}</span>)
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400 font-medium italic">Pencari Kerja</span>
                      )}
                    </div>
                  </div>

                  {/* --- TOMBOL AKSI --- */}
                  {detailAlumni.status_create === 'pending' && (
                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => { handleReject(detailAlumni.id); setShowDetail(false); }}
                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => { handleApprove(detailAlumni.id); setShowDetail(false); }}
                        className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
                      >
                        Setujui
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}