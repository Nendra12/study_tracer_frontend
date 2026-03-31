import React, { useState, useMemo } from "react";
import { Search, Plus, Megaphone, X } from "lucide-react";
import { alertSuccess, alertConfirm } from "../../utilitis/alert";
import Pagination from "../../components/admin/Pagination";

// Import Komponen yang sudah dipisah
import TambahPengumuman from "./TambahPengumuman";
import PengumumanCard from "../../components/admin/PengumumanCard";
import PengumumanSidebar from "../../components/admin/PengumumanSidebar";

// Import Gambar Lokal
import imgPengumuman from '../../assets/pengumuman.jpg';

// --- DATA DUMMY AWAL ---
const DUMMY_PENGUMUMAN = [
  {
    id: 1,
    judul: "Pembaruan Sistem Tracer Study 2024",
    konten: "Diberitahukan kepada seluruh alumni bahwa sistem Tracer Study akan mengalami pemeliharaan rutin pada tanggal 15 Agustus 2024.\n\nSelama proses ini, portal tidak dapat diakses selama 2 jam. Mohon maaf atas ketidaknyamanan yang ditimbulkan.",
    tanggal_dibuat: "2024-08-10",
    status: "aktif",
    is_pinned: true,
    foto: imgPengumuman
  },
  {
    id: 2,
    judul: "Undangan Job Fair Kampus 2024",
    konten: "Kampus akan mengadakan Job Fair tahunan yang dihadiri oleh lebih dari 50 perusahaan nasional dan multinasional.\n\nAcara akan diselenggarakan di Gedung Serbaguna Utama. Jangan lupa siapkan CV terbaik Anda!",
    tanggal_dibuat: "2024-08-05",
    status: "aktif",
    is_pinned: false,
    foto: imgPengumuman
  }
];

const ITEMS_PER_PAGE = 4;

export default function Pengumuman() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pengumumanData, setPengumumanData] = useState(DUMMY_PENGUMUMAN);
  
  // State untuk Modal Form (Tambah/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // State untuk Modal Detail Pop-up (Khusus Gambar)
  const [selectedImage, setSelectedImage] = useState(null);

  // --- HANDLERS MODAL FORM ---
  const handleOpenCreate = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleFormSuccess = (formData) => {
    if (editData) {
      // Update data jika sedang dalam mode Edit
      setPengumumanData(prevData => 
        prevData.map(item => item.id === editData.id ? { ...item, ...formData } : item)
      );
      alertSuccess("Pengumuman berhasil diperbarui!");
    } else {
      // Tambah data baru jika sedang dalam mode Create
      const newPengumuman = {
        ...formData,
        id: Date.now(), // Generate ID palsu
        tanggal_dibuat: new Date().toISOString().split('T')[0],
        // Preview gambar dari file yang diupload, kalau tidak ada pakai default
        foto: formData.foto ? URL.createObjectURL(formData.foto) : imgPengumuman, 
      };
      setPengumumanData(prevData => [newPengumuman, ...prevData]);
      alertSuccess("Pengumuman baru berhasil ditambahkan!");
    }
    handleModalClose();
  };

  // --- HANDLERS CARD (Hapus & Pin) ---
  const handleDelete = async (id, judul) => {
    const result = await alertConfirm(`Yakin ingin menghapus pengumuman "${judul}"?`);
    if (!result.isConfirmed) return;
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
      // Urutkan yang di-pin agar selalu di atas
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.tanggal_dibuat) - new Date(a.tanggal_dibuat);
    });
  }, [pengumumanData, searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset pagination ke halaman 1 setiap kali filter/search berubah
  React.useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // --- STATS UNTUK SIDEBAR ---
  const stats = {
    total: pengumumanData.length,
    aktif: pengumumanData.filter(i => i.status === 'aktif').length,
    draft: pengumumanData.filter(i => i.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="space-y-6">

        {/* TOMBOL "BUAT" UNTUK TAMPILAN MOBILE */}
        <div className="grid grid-cols-1 gap-3 lg:hidden">
          <button onClick={handleOpenCreate} className="cursor-pointer flex items-center justify-center gap-2 p-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-all text-xs shadow-md shadow-primary/20">
            <Plus size={16} /> <span>Buat Pengumuman</span>
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          
          {/* --- KOLOM KIRI (DAFTAR PENGUMUMAN) --- */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Filter Tab & Search Bar */}
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

            {/* List Pengumuman Card (Format Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedData.length > 0 ? (
                <>
                  {paginatedData.map((item) => (
                    <PengumumanCard 
                      key={item.id} 
                      item={item} 
                      onTogglePin={handleTogglePin} 
                      onEdit={handleOpenEdit} 
                      onDelete={handleDelete}
                      onViewImage={setSelectedImage} // Lempar fungsi pop-up gambar ke Card
                    />
                  ))}
                  
                  {/* Pagination full width (Span 2 kolom di layar medium) */}
                  <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-medium text-sm">Tidak ada pengumuman ditemukan</p>
                </div>
              )}
            </div>
          </div>

          {/* --- KOLOM KANAN (SIDEBAR STATISTIK & TOMBOL BUAT) --- */}
          <div className="lg:col-span-4">
            <PengumumanSidebar stats={stats} onOpenCreate={handleOpenCreate} />
          </div>

        </div>
      </div>

      {/* --- RENDER MODAL FORM (TAMBAH/EDIT) --- */}
      <TambahPengumuman
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      {/* --- RENDER MODAL GAMBAR SAJA (POP-UP LIGHTBOX) --- */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200"
          onClick={() => setSelectedImage(null)} // Klik area gelap (background) untuk menutup
        >
          <div 
            className="relative flex justify-center items-center max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Hindari tertutup kalau gambarnya sendiri yang diklik
          >
            {/* Tombol Close Mengambang di atas gambar */}
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-black/60 border border-white/20 text-white p-2 rounded-full hover:bg-black/90 transition-all cursor-pointer shadow-xl z-10"
            >
              <X size={20} />
            </button>
            
            {/* Tampilan Gambar Full */}
            <img 
              src={selectedImage.foto} 
              alt={selectedImage.judul} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}