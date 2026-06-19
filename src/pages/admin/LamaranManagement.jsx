import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Briefcase,
  Building2, Users, Calendar, Loader2, Download, Filter,
  ChevronDown, ChevronLeft, ChevronRight, MessageSquare,
  User, Search
} from "lucide-react";
import { adminApi } from "../../api/admin";
import toast from "react-hot-toast";

// Skeleton
function SkeletonLamaran() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-fourth h-24 skeleton" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-fourth h-96 skeleton" />
    </div>
  );
}

export default function LamaranManagement() {
  const [stats, setStats] = useState(null);
  const [lamaran, setLamaran] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const buildFilters = useCallback(() => {
    const f = {};
    if (filterStatus) f.status = filterStatus;
    if (searchQuery) f.search = searchQuery;
    return f;
  }, [filterStatus, searchQuery]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, lamaranRes] = await Promise.all([
        adminApi.getLamaranStats().catch(() => null),
        adminApi.getAllLamaran(buildFilters(), 15).catch(() => null),
      ]);
      setStats(statsRes?.data?.data || statsRes?.data || null);
      setLamaran(lamaranRes?.data?.data || lamaranRes?.data || null);
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchPage = async (page) => {
    try {
      const res = await adminApi.getAllLamaran({ ...buildFilters(), page }, 15);
      setLamaran(res?.data?.data || res?.data || null);
      setCurrentPage(page);
    } catch (e) {
      console.error("Failed to fetch page:", e);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportLamaran(buildFilters());
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `lamaran_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export berhasil!");
    } catch (e) {
      toast.error("Gagal export");
    } finally {
      setExporting(false);
    }
  };

  const total = stats?.total ?? 0;
  const prosesCount = stats?.proses ?? 0;
  const diterimaCount = stats?.diterima ?? 0;
  const ditolakCount = stats?.ditolak ?? 0;
  const lamaranList = lamaran?.data || (Array.isArray(lamaran) ? lamaran : []);
  const lastPage = lamaran?.last_page || 1;

  const summaryCards = [
    { label: "Total Lamaran", value: total, icon: ClipboardList, color: "bg-fourth text-primary" },
    { label: "Dalam Proses", value: prosesCount, icon: Clock, color: "bg-amber-50 text-amber-500", badgeColor: "bg-amber-100 text-amber-700" },
    { label: "Diterima", value: diterimaCount, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-500" },
    { label: "Ditolak", value: ditolakCount, icon: XCircle, color: "bg-red-50 text-red-400" },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      terkirim: { bg: "bg-blue-50", text: "text-blue-600", label: "Terkirim" },
      review: { bg: "bg-purple-50", text: "text-purple-600", label: "Review HR" },
      interview_hr: { bg: "bg-indigo-50", text: "text-indigo-600", label: "Interview HR" },
      interview_user: { bg: "bg-amber-50", text: "text-amber-600", label: "Interview User" },
      offering: { bg: "bg-orange-50", text: "text-orange-600", label: "Offering" },
      diterima: { bg: "bg-emerald-50", text: "text-emerald-600", label: "Diterima" },
      ditolak: { bg: "bg-red-50", text: "text-red-500", label: "Ditolak" }
    };

    const b = badges[status] || { bg: "bg-slate-50", text: "text-slate-600", label: status };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${b.bg} ${b.text}`}>
        {b.label}
      </span>
    );
  };

  if (loading) return <SkeletonLamaran />;

  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3">
            <div className="p-2.5 bg-fourth rounded-xl"><ClipboardList size={22} /></div>
            Manajemen Lamaran
          </h1>
          <p className="text-third text-xs mt-1 ml-12">Kelola semua lamaran pekerjaan alumni</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${showFilters ? "bg-primary text-white border-primary" : "bg-white text-primary border-fourth hover:border-primary/30"}`}
          >
            <Filter size={16} /> Filter <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-fourth p-5 shadow-sm animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-primary mb-1.5 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-fourth text-sm font-medium text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="terkirim">Terkirim</option>
                <option value="review">Review HR</option>
                <option value="interview_hr">Interview HR</option>
                <option value="interview_user">Interview User</option>
                <option value="offering">Offering</option>
                <option value="diterima">Diterima</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-primary mb-1.5 block">Cari Alumni/Lowongan</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-third" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Cari nama alumni atau lowongan..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-fourth text-sm font-medium text-primary focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFilterStatus(""); setSearchQuery(""); setCurrentPage(1); }}
                className="px-4 py-2.5 text-sm font-semibold text-third hover:text-primary transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-fourth shadow-sm flex flex-col gap-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${card.color}`}><card.icon size={20} /></div>
              {card.badge && <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${card.badgeColor}`}>{card.badge}</span>}
            </div>
            <div>
              <p className="text-third text-xs font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-primary mt-0.5">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Lamaran Table */}
      <div className="bg-white rounded-2xl border border-fourth shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fourth bg-fourth/30">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Alumni</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Lowongan</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Tanggal Apply</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Catatan Alumni</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {lamaranList.length > 0 ? lamaranList.map((item, i) => (
                <tr key={item.id_lamaran || item.id || i} className="border-b border-fourth/50 hover:bg-fourth/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-fourth rounded-lg">
                        <User size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary text-sm">{item.alumni?.nama_alumni || "-"}</p>
                        <p className="text-[10px] text-third">{item.alumni?.jurusan || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-primary text-sm truncate max-w-48">{item.lowongan?.judul_lowongan || "-"}</p>
                    <p className="text-[10px] text-third flex items-center gap-1">
                      <Building2 size={10} /> {item.lowongan?.perusahaan || ""}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-third text-xs">
                    {item.tanggal_apply ? new Date(item.tanggal_apply).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-third text-xs">
                    {item.catatan ? (
                      <p className="truncate max-w-48" title={item.catatan}>{item.catatan}</p>
                    ) : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-center">{getStatusBadge(item.status)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-third text-sm">Belum ada data lamaran</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="p-4 border-t border-fourth flex items-center justify-between">
            <p className="text-xs text-third font-medium">Halaman {currentPage} dari {lastPage}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchPage(currentPage - 1)} disabled={currentPage <= 1} className="p-2 rounded-lg border border-fourth hover:border-primary/30 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
                <ChevronLeft size={16} className="text-primary" />
              </button>
              <button onClick={() => fetchPage(currentPage + 1)} disabled={currentPage >= lastPage} className="p-2 rounded-lg border border-fourth hover:border-primary/30 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed">
                <ChevronRight size={16} className="text-primary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
