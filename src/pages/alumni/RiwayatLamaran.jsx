import React, { useState, useEffect, useCallback } from "react";
import {
  ClipboardList, Clock, CheckCircle2, XCircle, Briefcase,
  Building2, MapPin, Calendar, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Trash2, FileText, Edit2, Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { alumniApi } from "../../api/alumni";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function RiwayatLamaran() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [lamaran, setLamaran] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Progress Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLamaran, setSelectedLamaran] = useState(null);
  const [form, setForm] = useState({ status: "", catatan: "" });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;

      const [statsRes, lamaranRes] = await Promise.all([
        alumniApi.getLamaranStats().catch(() => null),
        alumniApi.getRiwayatLamaran(filters, 10).catch(() => null),
      ]);

      setStats(statsRes?.data?.data || statsRes?.data || null);
      setLamaran(lamaranRes?.data?.data || lamaranRes?.data || null);
      setCurrentPage(page);
    } catch (e) {
      console.error("Failed to fetch lamaran:", e);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleOpenModal = (item) => {
    setSelectedLamaran(item);
    setForm({ status: item.status, catatan: item.catatan || "" });
    setIsModalOpen(true);
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setUpdatingId(selectedLamaran.id_lamaran || selectedLamaran.id);
    try {
      await alumniApi.updateLamaranProgress(selectedLamaran.id_lamaran || selectedLamaran.id, form);
      toast.success("Progress berhasil diupdate");
      setIsModalOpen(false);
      fetchData(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengupdate progress");
    } finally {
      setUpdatingId(null);
    }
  };

  const fetchPage = async (page) => {
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      const res = await alumniApi.getRiwayatLamaran({ ...filters, page }, 10);
      setLamaran(res?.data?.data || res?.data || null);
      setCurrentPage(page);
    } catch (e) {
      console.error("Failed to fetch page:", e);
    }
  };

  const total = stats?.total ?? 0;
  const proses = stats?.proses ?? 0;
  const diterima = stats?.diterima ?? 0;
  const ditolak = stats?.ditolak ?? 0;
  const lamaranList = lamaran?.data || (Array.isArray(lamaran) ? lamaran : []);
  const lastPage = lamaran?.last_page || 1;

  const summaryCards = [
    { label: "Total Lamaran", value: total, icon: ClipboardList, color: "bg-fourth text-primary" },
    { label: "Dalam Proses", value: proses, icon: Clock, color: "bg-amber-50 text-amber-500", badgeColor: "bg-amber-100 text-amber-700" },
    { label: "Diterima", value: diterima, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-500", badgeColor: "bg-emerald-100 text-emerald-700" },
    { label: "Ditolak", value: ditolak, icon: XCircle, color: "bg-red-50 text-red-400", badgeColor: "bg-red-100 text-red-600" },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      terkirim: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", label: "Terkirim", icon: Info },
      review: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", label: "Review HR", icon: Clock },
      interview_hr: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", label: "Interview HR", icon: Clock },
      interview_user: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Interview User", icon: Clock },
      offering: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", label: "Offering", icon: ClipboardList },
      diterima: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Diterima", icon: CheckCircle2 },
      ditolak: { bg: "bg-red-50", text: "text-red-500", border: "border-red-100", label: "Ditolak", icon: XCircle }
    };

    const b = badges[status] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", label: status, icon: Info };
    const Icon = b.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${b.bg} ${b.text} border ${b.border}`}>
        <Icon size={11} /> {b.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-fourth h-24 skeleton" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-fourth h-96 skeleton" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen selection:bg-primary/20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-fourth rounded-xl">
              <ClipboardList size={24} />
            </div>
            Riwayat Lamaran
          </h1>
          <p className="text-sm text-third font-medium mt-1 ml-13">Track semua lamaran pekerjaan Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-3"
            >
              <div className={`p-2.5 rounded-xl ${card.color} w-fit`}>
                <card.icon size={20} />
              </div>
              <div>
                <p className="text-third text-xs font-medium">{card.label}</p>
                <h3 className="text-2xl font-bold text-primary mt-0.5">{card.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-4 mb-6 flex items-center gap-3">
          <FileText size={16} className="text-third" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl border border-fourth text-sm font-medium text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
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
          <span className="text-xs text-third font-medium ml-auto">{lamaranList.length} lamaran ditampilkan</span>
        </div>

        {/* Lamaran List */}
        <div className="space-y-4">
          {lamaranList.length > 0 ? (
            lamaranList.map((item, i) => (
              <motion.div
                key={item.id_lamaran || item.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="p-3 bg-fourth rounded-xl text-primary group-hover:bg-primary/10 transition-colors shrink-0">
                      <Briefcase size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-bold text-primary text-sm sm:text-base truncate cursor-pointer hover:underline"
                        onClick={() => navigate(`/alumni/lowongan/${item.id_lowongan || item.lowongan?.id_lowongan}`)}
                      >
                        {item.lowongan?.judul_lowongan || item.judul || "Lowongan"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {(item.lowongan?.perusahaan?.nama_perusahaan || item.perusahaan) && (
                          <span className="text-[11px] text-third font-medium flex items-center gap-1">
                            <Building2 size={11} /> {item.lowongan?.perusahaan?.nama_perusahaan || item.perusahaan}
                          </span>
                        )}
                        {(item.lowongan?.perusahaan?.kota || item.lokasi) && (
                          <span className="text-[11px] text-third font-medium flex items-center gap-1">
                            <MapPin size={11} /> {item.lowongan?.perusahaan?.kota || item.lokasi}
                          </span>
                        )}
                        <span className="text-[11px] text-third font-medium flex items-center gap-1">
                          <Calendar size={11} /> {item.tanggal_apply ? new Date(item.tanggal_apply).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                        </span>
                      </div>

                      {/* Admin notes */}
                      {item.catatan_admin && (
                        <div className="mt-2 px-3 py-2 bg-fourth/50 rounded-lg text-[11px] text-primary/70 font-medium border border-fourth">
                          <strong>Catatan Admin:</strong> {item.catatan_admin}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(item.status)}
                    {item.status !== "diterima" && item.status !== "ditolak" && (
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-all cursor-pointer"
                        title="Update Progress"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Timeline Visual (Simplified for Progress) */}
                <div className="mt-4 pt-3 border-t border-fourth/50 flex flex-wrap items-center gap-2 sm:gap-6">
                  {["terkirim", "review", "interview_hr", "interview_user", "offering", "diterima"].map((step, idx, arr) => {
                    const statusOrder = ["terkirim", "review", "interview_hr", "interview_user", "offering", "diterima", "ditolak"];
                    const currentIdx = statusOrder.indexOf(item.status);
                    const stepIdx = statusOrder.indexOf(step);
                    
                    let isCompleted = currentIdx >= stepIdx && item.status !== "ditolak";
                    let isCurrent = currentIdx === stepIdx;
                    let isRejected = item.status === "ditolak" && step === "diterima"; // show red dot at the end if rejected

                    return (
                      <React.Fragment key={step}>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${isRejected ? "bg-red-500" : isCompleted ? "bg-primary" : "bg-fourth"}`} />
                          <span className={`text-[10px] font-medium ${isCurrent ? "text-primary font-bold" : "text-third"}`}>
                            {step === "interview_hr" ? "Intv. HR" : 
                             step === "interview_user" ? "Intv. User" : 
                             step.charAt(0).toUpperCase() + step.slice(1)}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div className={`h-0.5 flex-1 min-w-[10px] sm:min-w-[20px] ${currentIdx > stepIdx && item.status !== "ditolak" ? "bg-primary" : "bg-fourth"}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <AlertCircle size={40} className="text-third/30 mx-auto mb-3" />
              <h3 className="font-bold text-primary text-base mb-1">Belum Ada Lamaran</h3>
              <p className="text-xs text-third font-medium mb-4">Mulai melamar pekerjaan dari halaman lowongan</p>
              <button
                onClick={() => navigate("/alumni/lowongan")}
                className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all cursor-pointer"
              >
                Cari Lowongan
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-third font-medium">Halaman {currentPage} dari {lastPage}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2.5 rounded-xl border border-slate-100 bg-white hover:border-primary/30 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-primary" />
              </button>
              <button
                onClick={() => fetchPage(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="p-2.5 rounded-xl border border-slate-100 bg-white hover:border-primary/30 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-primary" />
              </button>
            </div>
          </div>
        )}

        {/* Update Progress Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-lg text-primary">Update Progress Lamaran</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-third hover:text-red-500 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateProgress} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-third mb-2">Status Saat Ini</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-fourth text-sm text-primary focus:outline-none focus:border-primary/50"
                    required
                  >
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
                  <label className="block text-xs font-bold text-third mb-2">Catatan Tambahan (Opsional)</label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-fourth text-sm text-primary focus:outline-none focus:border-primary/50 resize-none h-24"
                    placeholder="Contoh: Jadwal interview tanggal 20 Mei jam 10 pagi..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-fourth text-primary text-sm font-bold hover:bg-fourth/80 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updatingId}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {updatingId ? <Loader2 size={16} className="animate-spin" /> : "Simpan Progress"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
