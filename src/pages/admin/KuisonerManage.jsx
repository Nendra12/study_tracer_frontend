import React, { useEffect, useState } from "react";
import { Plus, Eye, Ghost, EyeOff, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { masterDataApi } from "../../api/masterData";
import { alertConfirm, alertSuccess, alertError } from "../../utilitis/alert";

// --- IMPORT KOMPONEN REUSABLE ---
import QuestionCard from "../../components/admin/QuestionCard";
import KuesionerSkeleton from "../../components/admin/KuesionerSkeleton";
import Pagination from "../../components/admin/Pagination";

const ITEMS_PER_PAGE = 7;

export default function KuisonerManage() {
  const [filter, setFilter] = useState("Semua");
  const [questions, setQuestions] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pertanyaanRes, statusRes] = await Promise.all([
        adminApi.getPertanyaanAll(),
        masterDataApi.getStatus().catch(() => null)
      ]);

      let pertanyaanData = pertanyaanRes?.data?.data?.data || pertanyaanRes?.data?.data || [];
      let statusData = statusRes?.data?.data || statusRes?.data || [];

      setStatusList(statusData.map(s => s.nama_status || s.nama));

      const mappedQuestions = pertanyaanData.map(q => {
        const statusName = q.kuesioner?.status?.nama_status;
        let displayStatus = "TERLIHAT";
        if (q.status_pertanyaan === 'draft') displayStatus = "DRAF";
        else if (q.status_pertanyaan === 'hidden') displayStatus = "TERSEMBUNYI";

        return {
          id: q.id,
          text: q.isi_pertanyaan,
          section: q.section,
          kuesioner: q.kuesioner,
          options: q.opsi?.length > 0 
            ? `Opsi: ${q.opsi.map(o => o.opsi).join(", ")}` 
            : "Jawaban terbuka",
          status: displayStatus,
          category: statusName ? `Kuesioner ${statusName}` : "Umum",
        };
      });

      setQuestions(mappedQuestions);
    } catch (err) {
      alertError("Gagal memuat data kuesioner");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const confirm = await alertConfirm(`Ubah status pertanyaan menjadi "${newStatus}"?`);
    if (!confirm.isConfirmed) return;
    try {
      let backendStatus = newStatus === "TERLIHAT" ? 'publish' : newStatus === "DRAF" ? 'draft' : 'hidden';
      const question = questions.find(q => q.id === id);
      const kuesionerId = question?.section?.id_kuesioner || question?.kuesioner?.id;

      setQuestions(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
      await adminApi.updatePertanyaan(kuesionerId, id, { status_pertanyaan: backendStatus });
      alertSuccess("Status diperbarui");
    } catch (error) {
      fetchData(); 
    }
  };

  const deleteQuestion = async (id) => {
    const confirm = await alertConfirm("Hapus pertanyaan ini?");
    if (!confirm.isConfirmed) return;
    try {
      const question = questions.find(q => q.id === id);
      const kuesionerId = question?.section?.id_kuesioner || question?.kuesioner?.id;
      setQuestions(prev => prev.filter(q => q.id !== id));
      await adminApi.deletePertanyaan(kuesionerId, id);
      alertSuccess("Berhasil dihapus");
    } catch (error) {
      fetchData();
    }
  };

  // --- LOGIKA FILTER ---
  const filteredQuestions = questions.filter(q => {
    if (filter === "Draf") return q.status === "DRAF";
    if (filter === "Tersembunyi") return q.status === "TERSEMBUNYI";
    if (filter === "Semua") return true;
    return q.category === filter;
  });

  // --- LOGIKA PAGINATION ---
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => { setCurrentPage(1); }, [filter]);

  // Statistik untuk label tombol
  const hiddenCount = questions.filter((q) => q.status === "TERSEMBUNYI").length;
  const draftCount = questions.filter((q) => q.status === "DRAF").length;

  if (loading) return <KuesionerSkeleton />;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-700">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
        <button onClick={() => navigate("/wb-admin/kuisoner/tambah-pertanyaan")} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20">
          <Plus size={18} /> Tambah Pertanyaan
        </button>
        <button onClick={() => navigate("/wb-admin/kuisoner/lihat-jawaban")} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
          <Eye size={18} /> Lihat Jawaban
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Pertanyaan" value={questions.length} color="text-primary" />
        <StatCard label="Aktif" value={questions.filter(q => q.status === "TERLIHAT").length} color="text-green-600" border="border-b-green-500" />
        <StatCard label="Draf" value={draftCount} color="text-orange-500" border="border-b-orange-400" />
        <StatCard label="Tersembunyi" value={hiddenCount} color="text-slate-600" border="border-b-slate-400" />
      </div>

      {/* FILTER SECTION (Kembali ke desain awal) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
        {/* KIRI: Kategori Kuesioner */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar">
          {["Semua", ...statusList.map(s => `Kuesioner ${s}`)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
                filter === cat ? "bg-primary text-white border-primary shadow-md" : "bg-white text-slate-500 border-gray-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* KANAN: Status Khusus */}
        <div className="flex gap-2 self-end lg:self-auto">
          <button
            onClick={() => setFilter("Tersembunyi")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              filter === "Tersembunyi" ? "bg-slate-600 text-white border-slate-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <EyeOff size={14} /> Tersembunyi ({hiddenCount})
          </button>
          <button
            onClick={() => setFilter("Draf")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${
              filter === "Draf" ? "bg-orange-500 text-white border-orange-500 shadow-md" : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
            }`}
          >
            <Archive size={14} /> Draf ({draftCount})
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4 mb-8">
        {paginatedQuestions.length > 0 ? (
          paginatedQuestions.map((q) => (
            <QuestionCard 
              key={q.id} 
              q={q} 
              onEdit={(id) => navigate(`/wb-admin/kuisoner/update-pertanyaan/${id}`)}
              onUpdateStatus={updateStatus}
              onDelete={deleteQuestion}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Ghost size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium">Tidak ada data.</p>
          </div>
        )}
      </div>

      {/* PAGINATION UI */}
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={(page) => setCurrentPage(page)} 
      />

    </div>
  );
}

const StatCard = ({ label, value, color, border = "" }) => (
  <div className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm ${border}`}>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);