import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Megaphone,
  Calendar,
  Pencil,
  Trash2,
  Clock,
  Pin,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { alertSuccess, alertConfirm } from "../../utilitis/alert";
import Pagination from "../../components/admin/Pagination";

// --- DATA DUMMY PENGUMUMAN ---
const DUMMY_PENGUMUMAN = [
  {
    id: 1,
    judul: "Pembaruan Sistem Tracer Study 2024",
    konten: "Diberitahukan kepada seluruh alumni bahwa sistem Tracer Study akan mengalami pemeliharaan rutin pada tanggal 15 Agustus 2024. Selama proses ini, portal tidak dapat diakses selama 2 jam.",
    tanggal_dibuat: "2024-08-10",
    status: "aktif",
    is_pinned: true,
    target: "Semua Pengguna"
  },
  {
    id: 2,
    judul: "Undangan Job Fair Kampus 2024",
    konten: "Kampus akan mengadakan Job Fair tahunan yang dihadiri oleh lebih dari 50 perusahaan nasional dan multinasional. Acara akan diselenggarakan di Gedung Serbaguna Utama.",
    tanggal_dibuat: "2024-08-05",
    status: "aktif",
    is_pinned: false,
    target: "Alumni"
  },
  {
    id: 3,
    judul: "Kuesioner Wajib untuk Lulusan 2023",
    konten: "Bagi alumni lulusan tahun 2023, mohon segera mengisi kuesioner pelacakan karir yang telah dikirimkan ke dashboard masing-masing. Batas pengisian adalah akhir bulan ini.",
    tanggal_dibuat: "2024-08-01",
    status: "draft",
    is_pinned: false,
    target: "Lulusan 2023"
  },
  {
    id: 4,
    judul: "Batas Waktu Pengisian Data Karir",
    konten: "Mengingatkan kembali bahwa batas akhir pengisian data riwayat karir untuk pelaporan PDDIKTI akan ditutup dalam 3 hari. Mohon kerja samanya.",
    tanggal_dibuat: "2024-07-28",
    status: "berakhir",
    is_pinned: false,
    target: "Semua Pengguna"
  },
  {
    id: 5,
    judul: "Peluncuran Fitur Baru: CV Builder",
    konten: "Kini portal alumni dilengkapi dengan fitur pembuat CV otomatis berdasarkan data profil yang telah Anda isi. Silakan coba menu 'CV Builder' di dashboard Anda.",
    tanggal_dibuat: "2024-07-20",
    status: "aktif",
    is_pinned: false,
    target: "Semua Pengguna"
  },
  {
    id: 6,
    judul: "Pengumuman Libur Nasional",
    konten: "Layanan administrasi legalisir ijazah akan tutup sementara selama libur nasional dan cuti bersama minggu depan.",
    tanggal_dibuat: "2024-07-15",
    status: "berakhir",
    is_pinned: false,
    target: "Semua Pengguna"
  }
];

const ITEMS_PER_PAGE = 4;

export default function Pengumuman() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pengumumanData, setPengumumanData] = useState(DUMMY_PENGUMUMAN);
  
  // State untuk Modal Tambah/Edit (Bisa disambung ke komponen form nanti)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- HANDLERS (Simulasi dengan Data Dummy) ---
  const handleDelete = async (id, judul) => {
    const result = await alertConfirm(`Yakin ingin menghapus pengumuman "${judul}"?`);
    if (!result.isConfirmed) return;
    
    // Hapus dari state dummy
    setPengumumanData(prev => prev.filter(item => item.id !== id));
    alertSuccess("Pengumuman berhasil dihapus");
  };

  const handleTogglePin = (id) => {
    setPengumumanData(prev => prev.map(item => 
      item.id === id ? { ...item, is_pinned: !item.is_pinned } : item
    ));
  };

  // --- FILTER & PAGINATION ---
  const filteredData = useMemo(() => {
    return pengumumanData.filter(item => {
      const matchSearch = item.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.konten.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchTab = activeTab === "Semua" ? true : item.status.toLowerCase() === activeTab.toLowerCase();
      
      return matchSearch && matchTab;
    }).sort((a, b) => {
      // Pinned items selalu di atas
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.tanggal_dibuat) - new Date(a.tanggal_dibuat);
    });
  }, [pengumumanData, searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page saat filter berubah
  React.useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // --- STATS DUMMY ---
  const stats = {
    total: pengumumanData.length,
    aktif: pengumumanData.filter(i => i.status === 'aktif').length,
    draft: pengumumanData.filter(i => i.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="space-y-6">

        {/* TOMBOL MOBILE */}
        <div className="grid grid-cols-1 gap-3 lg:hidden">
          <button onClick={() => setIsModalOpen(true)} className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all text-xs shadow-md shadow-primary/20">
            <Plus size={16} /> <span>Buat Pengumuman</span>
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          
          {/* KOLOM KIRI: DAFTAR PENGUMUMAN */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Header: Tab Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto no-scrollbar">
                {["Semua", "Aktif", "Draft", "Berakhir"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer px-4 py-2 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab ? "bg-primary text-white shadow-md scale-105" : "text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors text-gray-400 group-focus-within:text-primary" size={16} />
                <input
                  type="text"
                  placeholder="Cari pengumuman..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none transition-all shadow-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* List Data Pengumuman */}
            <div className="space-y-3">
              {paginatedData.length > 0 ? (
                <>
                  {paginatedData.map((item) => (
                    <div key={item.id} className={`bg-white p-5 rounded-2xl border ${item.is_pinned ? 'border-primary/40 bg-blue-50/20' : 'border-gray-100'} shadow-sm flex flex-col gap-4 group transition-all hover:shadow-md`}>
                      
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl text-white flex-shrink-0 ${item.status === 'aktif' ? 'bg-primary' : item.status === 'draft' ? 'bg-gray-400' : 'bg-red-400'}`}>
                            <Megaphone size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {item.is_pinned && <Pin size={12} className="text-primary fill-primary" />}
                              <h3 className="font-bold text-primary text-base line-clamp-1">{item.judul}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {item.tanggal_dibuat}</span>
                              <span className="flex items-center gap-1">• Target: {item.target}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                          item.status === 'aktif' ? 'bg-green-100 text-green-700' : 
                          item.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Card Content Excerpt */}
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {item.konten}
                      </p>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button 
                          onClick={() => handleTogglePin(item.id)}
                          className={`text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${item.is_pinned ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                        >
                          <Pin size={14} /> {item.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button className="cursor-pointer p-2 text-gray-400 hover:text-[#3C5759] hover:bg-blue-50 rounded-lg active:scale-90 transition-all" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.judul)} 
                            className="cursor-pointer p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg active:scale-90 transition-all" 
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Component */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-medium text-sm">Tidak ada pengumuman ditemukan</p>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: SIDEBAR & STATISTIK */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Tombol Buat Desktop */}
            <div className="hidden lg:block">
              <button onClick={() => setIsModalOpen(true)} className="w-full cursor-pointer flex items-center justify-center gap-2 p-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md shadow-primary/20 group">
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                <span>Buat Pengumuman Baru</span>
              </button>
            </div>

            {/* Widget Ringkasan */}
            <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <Megaphone size={20} className="text-white/80" /> Ringkasan Pengumuman
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-xs font-medium text-white/70 flex items-center gap-2"><CheckCircle2 size={14} /> Pengumuman Aktif</span>
                    <span className="text-sm font-black text-green-300">{stats.aktif}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-xs font-medium text-white/70 flex items-center gap-2"><Clock size={14} /> Draft Disimpan</span>
                    <span className="text-sm font-black text-orange-300">{stats.draft}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10 border-transparent">
                    <span className="text-xs font-medium text-white/70 flex items-center gap-2"><AlertCircle size={14} /> Total Pengumuman</span>
                    <span className="text-sm font-black text-white">{stats.total}</span>
                  </div>
                </div>
              </div>
              {/* Efek Glow di background */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Kotak Info/Tips */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-primary text-sm mb-2">💡 Tips Pengumuman</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Gunakan fitur <b>Sematkan (Pin)</b> untuk membuat pengumuman penting selalu berada di urutan teratas pada dashboard alumni. Pengumuman dengan status Draft tidak akan terlihat oleh alumni.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}