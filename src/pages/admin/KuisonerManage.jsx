import React, { useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  GripVertical,
  EyeOff,
  Archive,
  ListChecks,
  Ghost,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/admin";
import { masterDataApi } from "../../api/masterData";

export default function KuisonerManage() {
  const [filter, setFilter] = useState("Semua");
  const [questions, setQuestions] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch data dari API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pertanyaan dan status master data
      const [pertanyaanRes, statusRes] = await Promise.all([
        adminApi.getPertanyaanAll(),
        masterDataApi.getStatus().catch(() => null) // Jika gagal, return null
      ]);

      // Handle berbagai struktur response API untuk pertanyaan
      let pertanyaanData = [];


      // Cek apakah data dalam bentuk pagination
      if (pertanyaanRes?.data?.data?.data) {
        // Format paginated: { data: { data: [...items], meta: {...} } }
        pertanyaanData = pertanyaanRes.data.data.data;
      } else if (pertanyaanRes?.data?.data && Array.isArray(pertanyaanRes.data.data)) {
        // Format: { data: { data: [...items] } }
        pertanyaanData = pertanyaanRes.data.data;
      } else if (Array.isArray(pertanyaanRes?.data)) {
        // Format: { data: [...items] }
        pertanyaanData = pertanyaanRes.data;
      }

      // Handle status response
      let statusData = [];
      if (statusRes?.data?.data && Array.isArray(statusRes.data.data)) {
        statusData = statusRes.data.data;
      } else if (Array.isArray(statusRes?.data)) {
        statusData = statusRes.data;
      } else {
        // Fallback ke default status karir
        statusData = [
          { id_status: 1, nama_status: "Bekerja" },
          { id_status: 2, nama_status: "Kuliah" },
          { id_status: 3, nama_status: "Wirausaha" },
          { id_status: 4, nama_status: "Pencari Kerja" },
        ];
      }

      // Set status list dari master data
      const statusNames = statusData.map(s => s.nama_status || s.nama);
      setStatusList(statusNames);

      // Map data pertanyaan dari API dengan info kuesioner
      const mappedQuestions = pertanyaanData.map(q => {
        const statusName = q.kuesioner?.status?.nama_status;

        return {
          id: q.id,
          id_sectionques: q.id_sectionques,
          text: q.isi_pertanyaan,
          section: q.section,
          kuesioner: q.kuesioner,
          options: q.opsi?.length > 0
            ? `Opsi: ${q.opsi.map(o => o.opsi).join(", ")}`
            : "Jawaban terbuka",
          status: "TERLIHAT",
          category: statusName ? `Kuesioner ${statusName}` : "Umum",
          statusName: statusName || null, // Untuk debugging
          created_at: q.created_at,
        };
      });

      // console.log("Mapped questions with categories:", mappedQuestions.map(q => ({
      //   text: q.text.substring(0, 30),
      //   category: q.category,
      //   statusName: q.statusName
      // })));

      setQuestions(mappedQuestions);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Aksi
  const updateStatus = async (id, newStatus) => {
    try {
      // Update local state optimistically
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );

      // TODO: Implementasi API update status ketika endpoint tersedia
      console.log(`Update status pertanyaan ${id} ke ${newStatus}`);

    } catch (error) {
      console.error("Gagal update status:", error);
      // Revert jika gagal
      fetchData();
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pertanyaan ini?")) {
      return;
    }

    try {
      // Cari pertanyaan untuk mendapatkan kuesionerId
      const question = questions.find(q => q.id === id);
      if (!question?.section) {
        throw new Error("Data pertanyaan tidak lengkap");
      }

      // Optimistic update
      setQuestions((prev) => prev.filter((q) => q.id !== id));

      // console.log("Delete pertanyaan:", id);

    } catch (error) {
      console.error("Gagal menghapus pertanyaan:", error);
      alert("Gagal menghapus pertanyaan. Silakan coba lagi.");
      // Revert jika gagal
      fetchData();
    }
  };

  // Statistik
  const hiddenCount = questions.filter((q) => q.status === "TERSEMBUNYI").length;
  const draftCount = questions.filter((q) => q.status === "DRAF").length;
  const activeCount = questions.filter((q) => q.status === "TERLIHAT").length;

  // Generate categories dari status list
  const categories = [
    "Semua",
    ...statusList.map(status => `Kuesioner ${status}`)
  ];

  // LOGIKA FILTER
  const filteredQuestions = questions.filter((q) => {
    if (filter === "Draf") return q.status === "DRAF";
    if (filter === "Tersembunyi") return q.status === "TERSEMBUNYI";
    if (filter === "Semua") return true;
    return q.category === filter;
  });

  // Loading State
  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-700 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={48} />
          <p className="text-slate-600 font-medium">Memuat data pertanyaan...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-700">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-slate-700">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/wb-admin/kuisoner/tambah-pertanyaan")}
          className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
        >
          <Plus size={18} /> Tambah Pertanyaan
        </button>
        <button onClick={() => navigate("/wb-admin/kuisoner/lihat-jawaban")} className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <Eye size={18} /> Lihat Jawaban
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Pertanyaan</p>
          {/* UPDATE: Menggunakan text-primary */}
          <p className="text-3xl font-black text-primary">{questions.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-green-500">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-wider mb-1">Aktif</p>
          <p className="text-3xl font-black text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-orange-400">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1">Draf</p>
          <p className="text-3xl font-black text-orange-500">{draftCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm border-b-4 border-b-slate-400">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Disembunyikan</p>
          <p className="text-3xl font-black text-slate-600">{hiddenCount}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 w-full lg:w-auto no-scrollbar mask-gradient">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${filter === cat
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-slate-500 border-gray-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* KANAN: Tombol Filter Status (Tersembunyi & Draf) */}
        <div className="flex gap-2 self-end lg:self-auto w-full sm:w-auto overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          <button
            onClick={() => setFilter("Tersembunyi")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${filter === "Tersembunyi"
              ? "bg-slate-600 text-white border-slate-600 shadow-md"
              : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
              }`}
          >
            <EyeOff size={14} /> Tersembunyi ({hiddenCount})
          </button>

          <button
            onClick={() => setFilter("Draf")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border whitespace-nowrap ${filter === "Draf"
              ? "bg-orange-500 text-white border-orange-500 shadow-md"
              : "bg-white text-orange-600 border-orange-200 hover:bg-orange-50"
              }`}
          >
            <Archive size={14} /> Draf ({draftCount})
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className={`group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-4 relative overflow-hidden ${q.status === "TERLIHAT" ? "border-l-4 border-l-primary" : q.status === "DRAF" ? "border-l-4 border-l-orange-400" : "border-l-4 border-l-slate-300 bg-slate-50/50"
                }`}
            >
              <div className="hidden sm:block pt-1 cursor-grab text-slate-300 hover:text-slate-500">
                <GripVertical size={20} />
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {q.category && q.category !== "Umum" && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                      <ListChecks size={12} />
                      {q.category}
                    </span>
                  )}
                  {q.section && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded tracking-wider">
                      {q.section.judul}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${q.status === "TERLIHAT" ? "bg-green-100 text-green-700" : q.status === "DRAF" ? "bg-orange-100 text-orange-700" : "bg-slate-200 text-slate-600"
                    }`}>
                    {q.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">{q.text}</h4>
                <p className="text-xs text-slate-500 font-medium bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100">{q.options}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit">
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => updateStatus(q.id, q.status === "TERSEMBUNYI" ? "TERLIHAT" : "TERSEMBUNYI")}
                  className={`p-2 rounded-lg transition-all ${q.status === "TERSEMBUNYI" ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"}`}
                  title={q.status === "TERSEMBUNYI" ? "Tampilkan" : "Sembunyikan"}
                >
                  {q.status === "TERSEMBUNYI" ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Hapus"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
            <Ghost size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-medium text-sm">Tidak ada pertanyaan dalam kategori ini.</p>
          </div>
        )}

        <button
          onClick={() => navigate("/wb-admin/kuisoner/tambah-pertanyaan")}
          className="cursor-pointer w-full py-8 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-primary hover:text-primary hover:bg-white transition-all group"
        >
          <div className="p-3 bg-slate-100 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold">Tambah Pertanyaan Lain</span>
        </button>
      </div>
    </div>
  );
}
