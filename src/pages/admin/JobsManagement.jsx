import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  ChartNoAxesCombined,
  Check,
  Hourglass,
  CalendarClock,
  Layers,
} from "lucide-react";

import { adminApi } from "../../api/admin";
import TambahLowongan from "./TambahLowongan";
import { alertSuccess, alertError, alertConfirm } from "../../utilitis/alert";

// --- IMPORT KOMPONEN YANG SUDAH DIPISAH ---
import JobCard from "../../components/admin/JobCard";
import { JobCardSkeleton, JobSidebarSkeleton } from "../../components/admin/JobSkeleton";
import Pagination from "../../components/admin/Pagination";

const JOBS_PER_PAGE = 7;

const getDisplayStatus = (job) => {
  if (job.approval_status === "pending") return "MENUNGGU PERSETUJUAN";
  if (job.status === "closed") return "BERAKHIR";
  if (job.approval_status === "rejected") return "DITOLAK";
  if (job.status === "published" && job.approval_status === "approved") return "AKTIF";
  if (job.status === "draft") return "DRAFT";
  return job.status?.toUpperCase() || "-";
};

export default function ManajemenPekerjaan() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [lowonganStats, setLowonganStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingJob, setEditingJob] = useState(null);

  const tabFilterMap = {
    "Semua": {},
    "Menunggu": { approval_status: "pending" },
    "Aktif": { status: "published", approval_status: "approved" },
    "Berakhir": { status: "closed" },
    "Ditolak": { approval_status: "rejected" }
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const filters = { ...tabFilterMap[activeTab] };
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      
      const res = await adminApi.getLowongan(filters, 100);
      const data = res.data?.data?.data || res.data?.data || [];
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setTimeout(() => setLoading(false), 500); 
    }
  }, [activeTab, searchQuery]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getLowonganStats();
      const data = res.data?.data || res.data || {};
      setLowonganStats(data);
      setCategories(data.categories || []);
    } catch { }
  }, []);

  useEffect(() => { 
    fetchJobs(); 
    fetchStats(); 
  }, [fetchJobs, fetchStats]);

  // --- HANDLERS ---
  const handleApprove = async (id) => {
    const result = await alertConfirm("Setujui lowongan ini?");
    if (!result.isConfirmed) return;
    try { await adminApi.approveLowongan(id); alertSuccess("Lowongan disetujui"); fetchJobs(); fetchStats(); } catch (err) { alertError(err.response?.data?.message || 'Gagal menyetujui lowongan'); }
  };

  const handleReject = async (id) => {
    const result = await alertConfirm("Tolak lowongan ini?");
    if (!result.isConfirmed) return;
    try { await adminApi.rejectLowongan(id); alertSuccess("Lowongan ditolak"); fetchJobs(); fetchStats(); } catch (err) { alertError(err.response?.data?.message || 'Gagal menolak lowongan'); }
  };

  const handleDelete = async (id) => {
    const result = await alertConfirm("Yakin hapus lowongan ini?");
    if (!result.isConfirmed) return;
    try { await adminApi.deleteLowongan(id); alertSuccess("Lowongan dihapus"); fetchJobs(); fetchStats(); } catch (err) { alertError(err.response?.data?.message || 'Gagal menghapus lowongan'); }
  };

  const handleRepost = async (id) => {
    const result = await alertConfirm("Posting ulang lowongan ini?");
    if (!result.isConfirmed) return;
    try { await adminApi.repostLowongan(id); alertSuccess("Berhasil diposting ulang"); fetchJobs(); fetchStats(); } catch (err) { alertError(err.response?.data?.message || 'Gagal memposting ulang'); }
  };

  const handleEdit = (job) => { 
    setEditingJob(job); 
    setIsModalOpen(true); 
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleFormSuccess = () => {
    const isEdit = !!editingJob;
    handleModalClose();
    alertSuccess(isEdit ? "Lowongan berhasil diperbarui" : "Lowongan berhasil ditambahkan");
    fetchJobs();
    fetchStats();
  };

  // --- FILTER & PAGINATION ---
  const filteredJobs = useMemo(() => {
    if (!selectedCategory) return jobs;
    return jobs.filter(job => job.tipe_pekerjaan === selectedCategory);
  }, [jobs, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, selectedCategory]);

  const handleExportCSV = () => {
    if (filteredJobs.length === 0) return;
    const headers = ['Judul', 'Perusahaan', 'Lokasi', 'Tipe Pekerjaan', 'Status', 'Tanggal Berakhir'];
    const rows = filteredJobs.map(job => [
      job.judul || '', 
      job.perusahaan?.nama || '', 
      job.lokasi || '', 
      job.tipe_pekerjaan || '', 
      getDisplayStatus(job), 
      job.lowongan_selesai || ''
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.download = `lowongan_pekerjaan_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link); 
    link.click(); 
    document.body.removeChild(link); 
    URL.revokeObjectURL(url);
    alertSuccess("Data berhasil diekspor");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="space-y-6">

        {/* TOMBOL MOBILE */}
        <div className="grid grid-cols-2 gap-3 lg:hidden">
          {loading ? (
            <>
              <div className="h-11 bg-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-11 bg-gray-200 rounded-xl animate-pulse"></div>
            </>
          ) : (
            <>
              <button onClick={handleExportCSV} className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-primary font-bold rounded-xl active:scale-95 transition-all text-xs shadow-sm ">
                <Download size={16} /> <span>Eksport CSV</span>
              </button>
              <button onClick={() => setIsModalOpen(true)} className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all text-xs shadow-md shadow-primary/20">
                <Plus size={16} /> <span>Buat Lowongan</span>
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {loading ? (
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-hidden animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-16 h-8 bg-gray-300 rounded-md"></div>)}
                </div>
              ) : (
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto no-scrollbar">
                  {["Semua", "Menunggu", "Aktif", "Berakhir", "Ditolak"].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`cursor-pointer px-3 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab ? "bg-primary text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              <div className="relative flex-1 group w-full">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-gray-300' : 'text-gray-400 group-focus-within:text-primary'}`} size={16} />
                <input 
                  type="text" 
                  placeholder="Cari Lowongan..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  disabled={loading}
                  className={`w-full pl-10 pr-3 py-2 bg-white border rounded-xl text-sm outline-none transition-all shadow-sm ${loading ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed animate-pulse placeholder-transparent' : 'border-gray-200 focus:ring-2 focus:ring-primary/20'}`} 
                />
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                [...Array(5)].map((_, i) => <JobCardSkeleton key={i} />)
              ) : paginatedJobs.length > 0 ? (
                <>
                  {paginatedJobs.map((job) => (
                    <JobCard key={job.id} job={job} onApprove={handleApprove} onReject={handleReject} onDelete={handleDelete} onRepost={handleRepost} onEdit={handleEdit} />
                  ))}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                  <p className="font-medium">Tidak ada lowongan ditemukan</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {loading ? (
                <div className="contents">
                  <div className="h-11 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="h-11 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>
              ) : (
                <>
                  <button onClick={handleExportCSV} className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 text-primary font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xs shadow-sm group">
                    <Download size={16} className="group-hover:scale-110 transition-transform"/>
                    <span>Eksport CSV</span>
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all text-xs shadow-md shadow-primary/20 group">
                    <Plus size={16} className="group-hover:rotate-90 transition-transform"/>
                    <span>Buat Lowongan</span>
                  </button>
                </>
              )}
            </div>

            {loading && !lowonganStats ? (
              <JobSidebarSkeleton />
            ) : (
              <>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="font-black text-primary text-sm uppercase tracking-wider mb-4">Kategori</h2>
                  <div className="flex flex-wrap gap-2">
                    <span onClick={() => setSelectedCategory(null)} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${!selectedCategory ? 'bg-primary text-white border-primary shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'}`}>Semua</span>
                    {categories.map((cat) => (
                      <span key={cat.name} onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer transition-all ${selectedCategory === cat.name ? 'bg-primary text-white border-primary shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300'}`}>
                        {cat.name} <span className="text-[9px] ml-1 opacity-70">{cat.count}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><ChartNoAxesCombined size={20} className="text-white/80"/> Ringkasan</h2>
                    <div className="space-y-3">
                      {[
                        { label: "Pekerjaan Aktif", value: lowonganStats?.active ?? "-", icon: <Check size={14} /> },
                        { label: "Menunggu Tinjauan", value: lowonganStats?.pending ?? "-", color: "text-orange-300", icon: <Hourglass size={14}/> },
                        { label: "Baru Minggu Ini", value: lowonganStats?.new_this_week ?? "-", icon: <CalendarClock size={14}/> },
                        { label: "Total Lowongan", value: lowonganStats?.total ?? "-", icon: <Layers size={14}/>},
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                          <span className="text-xs font-medium text-white/70 flex items-center gap-2">{item.icon} {item.label}</span>
                          <span className={`text-sm font-black ${item.color || "text-white"}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <TambahLowongan 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        onSuccess={handleFormSuccess} 
        editJob={editingJob} 
      />
    </div>
  );
}