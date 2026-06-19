import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3, Filter, Download, RefreshCw, ChevronDown,
  CheckCircle2, XCircle, HelpCircle, Users, Loader2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { adminApi } from "../../api/admin";
import api from "../../api/axios";
import { PieKesesuaian, BarKesesuaianJurusan, LineKesesuaianTahun } from "../../components/admin/ChartGrafikBidang";
import toast from "react-hot-toast";

// Skeleton Loader
function SkeletonGrafik() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-fourth h-28">
            <div className="skeleton h-4 w-20 rounded mb-3" />
            <div className="skeleton h-8 w-16 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-fourth h-96 skeleton" />
        <div className="lg:col-span-2 bg-white rounded-2xl border border-fourth h-96 skeleton" />
      </div>
      <div className="bg-white rounded-2xl border border-fourth h-96 skeleton" />
    </div>
  );
}

export default function GrafikBidang() {
  const [stats, setStats] = useState(null);
  const [byJurusan, setByJurusan] = useState([]);
  const [byTahun, setByTahun] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKesesuaian, setFilterKesesuaian] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Jurusan list for recompute
  const [jurusanList, setJurusanList] = useState([]);
  const [showRecomputeModal, setShowRecomputeModal] = useState(false);
  const [selectedJurusanId, setSelectedJurusanId] = useState("");

  const buildFilters = useCallback(() => {
    const f = {};
    if (filterStatus) f.status = filterStatus;
    if (filterKesesuaian) f.kesesuaian = filterKesesuaian;
    return f;
  }, [filterStatus, filterKesesuaian]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const f = buildFilters();
    try {
      const [statsRes, jurusanRes, tahunRes, detailRes] = await Promise.all([
        adminApi.getGrafikStats(f).catch(() => null),
        adminApi.getGrafikByJurusan(f).catch(() => null),
        adminApi.getGrafikByTahun(f).catch(() => null),
        adminApi.getGrafikDetail(f, 10).catch(() => null),
      ]);
      setStats(statsRes?.data?.data || statsRes?.data || null);
      setByJurusan(jurusanRes?.data?.data || jurusanRes?.data || []);
      setByTahun(tahunRes?.data?.data || tahunRes?.data || []);
      setDetail(detailRes?.data?.data || detailRes?.data || null);
    } catch (e) {
      console.error("Failed to fetch grafik data:", e);
    } finally {
      setLoading(false);
    }
  }, [buildFilters]);

  useEffect(() => {
    fetchAll();
    // Fetch jurusan list for recompute selector
    api.get('/master/jurusan').then(res => {
      const data = res.data?.data || res.data || [];
      setJurusanList(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, [fetchAll]);

  const fetchDetailPage = async (page) => {
    try {
      const f = buildFilters();
      const res = await adminApi.getGrafikDetail({ ...f, page }, 10);
      setDetail(res?.data?.data || res?.data || null);
      setCurrentPage(page);
    } catch (e) {
      console.error("Failed to fetch detail page:", e);
    }
  };

  const handleRecompute = async () => {
    if (!selectedJurusanId) {
      toast.error("Pilih jurusan terlebih dahulu");
      return;
    }
    setRecomputing(true);
    try {
      await adminApi.recomputeKesesuaian(selectedJurusanId);
      toast.success("Kesesuaian bidang berhasil di-recompute!");
      setShowRecomputeModal(false);
      setSelectedJurusanId("");
      fetchAll();
    } catch (e) {
      toast.error("Gagal recompute: " + (e.response?.data?.message || e.message));
    } finally {
      setRecomputing(false);
    }
  };

  const handleRecomputeAll = async () => {
    if (jurusanList.length === 0) {
      toast.error("Tidak ada data jurusan");
      return;
    }
    setRecomputing(true);
    try {
      let success = 0;
      for (const j of jurusanList) {
        try {
          await adminApi.recomputeKesesuaian(j.id || j.id_jurusan);
          success++;
        } catch { /* skip */ }
      }
      toast.success(`Recompute selesai! ${success}/${jurusanList.length} jurusan berhasil.`);
      setShowRecomputeModal(false);
      fetchAll();
    } catch (e) {
      toast.error("Gagal recompute: " + (e.response?.data?.message || e.message));
    } finally {
      setRecomputing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminApi.exportGrafikBidang(buildFilters());
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `kesesuaian_bidang_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export berhasil!");
    } catch (e) {
      toast.error("Gagal export: " + (e.response?.data?.message || e.message));
    } finally {
      setExporting(false);
    }
  };

  // Summary stats
  const sesuai = stats?.sesuai ?? stats?.total_sesuai ?? 0;
  const tidakSesuai = stats?.tidak_sesuai ?? stats?.total_tidak_sesuai ?? 0;
  const belumDinilai = stats?.belum_dinilai ?? stats?.total_belum_dinilai ?? 0;
  const totalAlumni = sesuai + tidakSesuai + belumDinilai;
  const persenSesuai = totalAlumni > 0 ? Math.round((sesuai / totalAlumni) * 100) : 0;

  const summaryCards = [
    { label: "Total Alumni", value: totalAlumni, icon: Users, color: "bg-fourth text-primary" },
    { label: "Sesuai Bidang", value: sesuai, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", badge: `${persenSesuai}%`, badgeColor: "bg-emerald-100 text-emerald-700" },
    { label: "Tidak Sesuai", value: tidakSesuai, icon: XCircle, color: "bg-red-50 text-red-500" },
    { label: "Belum Dinilai", value: belumDinilai, icon: HelpCircle, color: "bg-gray-50 text-gray-400" },
  ];

  // Detail table data
  const detailData = detail?.data || (Array.isArray(detail) ? detail : []);
  const lastPage = detail?.last_page || 1;

  if (loading) return <SkeletonGrafik />;

  return (
    <>
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3">
            <div className="p-2.5 bg-fourth rounded-xl">
              <BarChart3 size={22} />
            </div>
            Grafik Kesesuaian Bidang
          </h1>
          <p className="text-third text-xs mt-1 ml-12">Analisis apakah alumni bekerja/kuliah/berwirausaha sesuai bidang jurusan SMK</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${showFilters ? "bg-primary text-white border-primary" : "bg-white text-primary border-fourth hover:border-primary/30"}`}
          >
            <Filter size={16} /> Filter <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setShowRecomputeModal(true)}
            disabled={recomputing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-fourth bg-white text-primary text-sm font-semibold hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={recomputing ? "animate-spin" : ""} />
            {recomputing ? "Memproses..." : "Recompute"}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-fourth p-5 shadow-sm animate-in fade-in duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-primary mb-1.5 block">Status Karier</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-fourth text-sm font-medium text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="">Semua Status</option>
                <option value="Bekerja">Bekerja</option>
                <option value="Kuliah">Kuliah</option>
                <option value="Wirausaha">Wirausaha</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-primary mb-1.5 block">Kesesuaian</label>
              <select
                value={filterKesesuaian}
                onChange={(e) => { setFilterKesesuaian(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2.5 rounded-xl border border-fourth text-sm font-medium text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="">Semua</option>
                <option value="sesuai">Sesuai Bidang</option>
                <option value="tidak_sesuai">Tidak Sesuai</option>
                <option value="belum_dinilai">Belum Dinilai</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setFilterStatus(""); setFilterKesesuaian(""); setCurrentPage(1); }}
                className="px-4 py-2.5 text-sm font-semibold text-third hover:text-primary transition-colors cursor-pointer"
              >
                Reset Filter
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
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon size={20} />
              </div>
              {card.badge && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${card.badgeColor}`}>{card.badge}</span>
              )}
            </div>
            <div>
              <p className="text-third text-xs font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-primary mt-0.5">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PieKesesuaian data={{ sesuai, tidak_sesuai: tidakSesuai, belum_dinilai: belumDinilai }} />
        <div className="lg:col-span-2">
          <BarKesesuaianJurusan data={byJurusan} />
        </div>
      </div>

      {/* Line Chart */}
      <LineKesesuaianTahun data={byTahun} />

      {/* Detail Table */}
      <div className="bg-white rounded-2xl border border-fourth shadow-sm overflow-hidden">
        <div className="p-5 border-b border-fourth flex items-center justify-between">
          <h3 className="font-bold text-primary text-base">Detail Alumni</h3>
          <span className="text-xs text-third font-medium">{totalAlumni} alumni ditemukan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fourth bg-fourth/30">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Nama</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Jurusan SMK</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Posisi/Bidang</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold text-third uppercase tracking-wider">Kesesuaian</th>
              </tr>
            </thead>
            <tbody>
              {detailData.length > 0 ? detailData.map((item, i) => (
                <tr key={i} className="border-b border-fourth/50 hover:bg-fourth/20 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-primary">{item.nama || item.nama_alumni || "-"}</td>
                  <td className="px-5 py-3.5 text-third">{item.jurusan || item.nama_jurusan || "-"}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-fourth text-primary">
                      {item.status || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-third">{item.posisi || item.bidang || item.nama_jurusan_kuliah || "-"}</td>
                  <td className="px-5 py-3.5 text-center">
                    {item.is_sesuai_bidang === true || item.is_sesuai_bidang === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={12} /> Sesuai
                      </span>
                    ) : item.is_sesuai_bidang === false || item.is_sesuai_bidang === 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-500">
                        <XCircle size={12} /> Tidak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-400">
                        <HelpCircle size={12} /> Belum
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-third text-sm">Belum ada data alumni</td>
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
              <button
                onClick={() => fetchDetailPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-fourth hover:border-primary/30 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-primary" />
              </button>
              <button
                onClick={() => fetchDetailPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="p-2 rounded-lg border border-fourth hover:border-primary/30 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-primary" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Recompute Modal */}
      {showRecomputeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowRecomputeModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-fourth rounded-xl">
                <RefreshCw size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-base">Recompute Kesesuaian</h3>
                <p className="text-xs text-third">Hitung ulang kesesuaian bidang alumni</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-bold text-primary mb-1.5 block">Pilih Jurusan</label>
              <select
                value={selectedJurusanId}
                onChange={(e) => setSelectedJurusanId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-fourth text-sm font-medium text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="">-- Pilih Jurusan --</option>
                {jurusanList.map((j) => (
                  <option key={j.id || j.id_jurusan} value={j.id || j.id_jurusan}>
                    {j.nama || j.nama_jurusan}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRecomputeModal(false)}
                className="flex-1 px-4 py-2.5 border border-fourth text-sm font-semibold text-third rounded-xl hover:bg-fourth/50 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleRecomputeAll}
                disabled={recomputing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-primary text-primary text-sm font-bold rounded-xl hover:bg-fourth transition-all cursor-pointer disabled:opacity-50"
              >
                {recomputing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Semua Jurusan
              </button>
              <button
                onClick={handleRecompute}
                disabled={recomputing || !selectedJurusanId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
              >
                {recomputing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Recompute
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
