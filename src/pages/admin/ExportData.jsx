import React, { useState } from "react";
import {
  Download, Users, ClipboardList, BarChart3, Briefcase,
  FileArchive, Loader2, CheckCircle2, FileSpreadsheet
} from "lucide-react";
import { adminApi } from "../../api/admin";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default function ExportData() {
  const [exportingId, setExportingId] = useState(null);
  const [completedIds, setCompletedIds] = useState([]);

  const handleExport = async (id, apiCall, filename) => {
    setExportingId(id);
    try {
      const res = await apiCall();
      downloadBlob(new Blob([res.data]), filename);
      setCompletedIds((prev) => [...prev, id]);
      toast.success(`${filename} berhasil di-download!`);
      // Clear completed after 3s
      setTimeout(() => {
        setCompletedIds((prev) => prev.filter((x) => x !== id));
      }, 3000);
    } catch (err) {
      toast.error("Gagal export: " + (err.response?.data?.message || err.message));
    } finally {
      setExportingId(null);
    }
  };

  const dateStr = new Date().toISOString().slice(0, 10);

  const exportItems = [
    {
      id: "alumni",
      title: "Data Alumni Lengkap",
      description: "Export semua data alumni termasuk profil, jurusan, status karier, dan informasi pekerjaan/kuliah/usaha.",
      icon: Users,
      color: "from-primary to-primary/80",
      iconBg: "bg-primary/10 text-primary",
      format: "CSV",
      action: () => handleExport("alumni", () => adminApi.exportAlumniComplete(), `alumni_lengkap_${dateStr}.csv`),
    },
    {
      id: "lamaran",
      title: "Data Lamaran",
      description: "Export semua riwayat lamaran pekerjaan alumni termasuk status, tanggal apply, dan catatan admin.",
      icon: ClipboardList,
      color: "from-amber-500 to-amber-600",
      iconBg: "bg-amber-50 text-amber-500",
      format: "CSV",
      action: () => handleExport("lamaran", () => adminApi.exportLamaranData(), `lamaran_${dateStr}.csv`),
    },
    {
      id: "kesesuaian",
      title: "Kesesuaian Bidang",
      description: "Export data analisis kesesuaian bidang alumni — apakah karier mereka sesuai dengan jurusan SMK.",
      icon: BarChart3,
      color: "from-emerald-500 to-emerald-600",
      iconBg: "bg-emerald-50 text-emerald-500",
      format: "CSV",
      action: () => handleExport("kesesuaian", () => adminApi.exportKesesuaianBidang(), `kesesuaian_bidang_${dateStr}.csv`),
    },
    {
      id: "lowongan",
      title: "Data Lowongan",
      description: "Export semua data lowongan pekerjaan termasuk statistik jumlah pelamar dan status lowongan.",
      icon: Briefcase,
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-50 text-blue-500",
      format: "CSV",
      action: () => handleExport("lowongan", () => adminApi.exportLowonganData(), `lowongan_${dateStr}.csv`),
    },
    {
      id: "all",
      title: "Export Semua Data",
      description: "Download semua data dalam satu file ZIP berisi multiple file CSV (alumni, lamaran, kesesuaian, lowongan).",
      icon: FileArchive,
      color: "from-violet-500 to-violet-600",
      iconBg: "bg-violet-50 text-violet-500",
      format: "ZIP",
      action: () => handleExport("all", () => adminApi.exportAllData(), `study_tracer_export_${dateStr}.zip`),
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden p-1 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-3">
          <div className="p-2.5 bg-fourth rounded-xl">
            <Download size={22} />
          </div>
          Export Data
        </h1>
        <p className="text-third text-xs mt-1 ml-12">Download data alumni, lamaran, dan statistik dalam format CSV/ZIP</p>
      </div>

      {/* Info Banner */}
      <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 shrink-0">
            <FileSpreadsheet size={24} className="text-amber-300" />
          </div>
          <div>
            <h2 className="font-bold text-lg mb-1">Pusat Ekspor Data</h2>
            <p className="text-white/70 text-sm font-medium leading-relaxed">
              Pilih jenis data yang ingin Anda export. Semua file menggunakan format CSV (bisa dibuka di Excel).
              Untuk mengunduh semua data sekaligus, gunakan opsi <strong className="text-white">Export Semua Data</strong> dalam format ZIP.
            </p>
          </div>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {exportItems.map((item, i) => {
          const isExporting = exportingId === item.id;
          const isCompleted = completedIds.includes(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-lg group ${item.id === "all" ? "md:col-span-2 xl:col-span-1 border-violet-100" : "border-fourth"}`}
            >
              <div className="p-6 flex flex-col h-full">
                {/* Icon & Format Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${item.iconBg} transition-transform group-hover:scale-110`}>
                    <item.icon size={24} />
                  </div>
                  <span className="px-3 py-1 bg-fourth text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {item.format}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-bold text-primary text-base mb-2">{item.title}</h3>
                <p className="text-third text-xs font-medium leading-relaxed flex-1 mb-5">{item.description}</p>

                {/* Action Button */}
                <button
                  onClick={item.action}
                  disabled={isExporting}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                    isCompleted
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : isExporting
                      ? "bg-fourth text-primary border border-fourth"
                      : "bg-primary text-white hover:opacity-90 active:scale-[0.98] shadow-md shadow-primary/10"
                  }`}
                >
                  {isCompleted ? (
                    <><CheckCircle2 size={18} /> Download Selesai</>
                  ) : isExporting ? (
                    <><Loader2 size={18} className="animate-spin" /> Mengunduh...</>
                  ) : (
                    <><Download size={18} /> Download {item.format}</>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
