import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Megaphone, X, Loader2 } from "lucide-react";
import { alertSuccess, alertConfirm, alertError } from "../../utilitis/alert";
import Pagination from "../../components/admin/Pagination";

// Import Komponen yang sudah dipisah
import TambahPengumuman from "./TambahPengumuman";
import PengumumanCard from "../../components/admin/PengumumanCard";
import PengumumanSidebar from "../../components/admin/PengumumanSidebar";
import SmoothDropdown from "../../components/admin/SmoothDropdown";
import { PengumumanCardSkeleton, PengumumanSidebarSkeleton } from "../../components/admin/skeleton/PengumumanSkeleton";

// Import API
import { adminApi } from "../../api/admin";

const ITEMS_PER_PAGE = 8;

export default function Pengumuman() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pengumumanData, setPengumumanData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter tambahan
  const [selectedSort, setSelectedSort] = useState("Terbaru");
  const [selectedPinned, setSelectedPinned] = useState("Semua Tipe (Pin)");
  
  // State untuk Statistik Sidebar
  const [stats, setStats] = useState({ total: 0, aktif: 0, draft: 0, berakhir: 0 });

  // State untuk Modal Form (Tambah/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // State untuk Modal Detail Pop-up (Khusus Gambar)
  const [selectedImage, setSelectedImage] = useState(null);

  // --- FETCH DATA DARI API ---
  const fetchPengumuman = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (activeTab !== "Semua") filters.status = activeTab.toLowerCase();
      if (selectedSort !== "Terbaru") filters.sort = selectedSort.toLowerCase();
      if (selectedPinned === "Di-pin") filters.pinned = true;
      if (selectedPinned === "Tidak Di-pin") filters.pinned = false;

      const response = await adminApi.getPengumuman(filters, ITEMS_PER_PAGE);
      const responseData = response.data?.data;
      
      // Handle paginated response
      if (responseData?.data) {
        setPengumumanData(responseData.data);
        setTotalPages(responseData.last_page || 1);
      } else if (Array.isArray(responseData)) {
        setPengumumanData(responseData);
        setTotalPages(1);
      } else {
        setPengumumanData([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch pengumuman:", err);
      setPengumumanData([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, currentPage, selectedSort, selectedPinned]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await adminApi.getPengumumanStats();
      const statsData = response.data?.data;
      if (statsData) {
        setStats({
          total: statsData.total || 0,
          aktif: statsData.aktif || 0,
          draft: statsData.draft || 0,
          berakhir: statsData.berakhir || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchPengumuman();
  }, [fetchPengumuman]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset pagination ke halaman 1 setiap kali filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedSort, selectedPinned]);

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

  const handleFormSuccess = () => {
    handleModalClose();
    fetchPengumuman();
    fetchStats();
  };

  // --- HANDLERS CARD (Hapus & Pin) ---
  const handleDelete = async (id, judul) => {
    const result = await alertConfirm(`Yakin ingin menghapus pengumuman "${judul}"?`);
    if (!result.isConfirmed) return;
    
    try {
      await adminApi.deletePengumuman(id);
      alertSuccess("Pengumuman berhasil dihapus");
      fetchPengumuman();
      fetchStats();
    } catch (err) {
      console.error("Failed to delete:", err);
      alertError("Gagal menghapus pengumuman");
    }
  };

  const handleTogglePin = async (id) => {
    try {
      const response = await adminApi.togglePinPengumuman(id);
      const message = response.data?.message || "Status pin diperbarui";
      alertSuccess(message);
      fetchPengumuman();
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      alertError("Gagal mengubah status pin");
    }
  };

  // --- HANDLER UBAH STATUS (Publish / Draft / Arsip) ---
  const handleChangeStatus = async (id, targetStatus, judul) => {
    const statusLabels = {
      aktif: 'Publikasikan',
      draft: 'Jadikan Draft',
      berakhir: 'Arsipkan',
    };
    const confirmMsg = `${statusLabels[targetStatus] || 'Ubah status'} pengumuman "${judul}"?`;
    const result = await alertConfirm(confirmMsg);
    if (!result.isConfirmed) return;

    try {
      await adminApi.updatePengumumanStatus(id, targetStatus);
      alertSuccess(`Pengumuman berhasil di-${targetStatus === 'aktif' ? 'publikasikan' : targetStatus === 'draft' ? 'jadikan draft' : 'arsipkan'}`);
      fetchPengumuman();
      fetchStats();
    } catch (err) {
      console.error("Failed to change status:", err);
      alertError("Gagal mengubah status pengumuman");
    }
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
          <div className="lg:col-span-8 space-y-4 lg:space-y-6">
            
            {/* Filter Tab & Search Bar */}
            <div className="flex flex-col gap-4">
              
              {/* 1. TABS */}
              {loading ? (
                <div className="flex gap-2 w-full overflow-x-hidden p-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-20 h-9 bg-gray-200/70 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-1">
                  {["Semua", "Aktif", "Draft", "Berakhir"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`cursor-pointer px-5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                        activeTab === tab ? "bg-primary text-white shadow-md" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {/* 2. SEARCH BAR & DROPDOWNS */}
              {loading ? (
                <div className="flex flex-col md:flex-row w-full gap-3 mt-3">
                  <div className="flex-1 h-[50px] bg-gray-200/70 rounded-xl animate-pulse"></div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex-1 md:w-[180px] h-[50px] bg-gray-200/70 rounded-xl animate-pulse"></div>
                    <div className="flex-1 md:w-[200px] h-[50px] bg-gray-200/70 rounded-xl animate-pulse"></div>
                  </div>
                </div>
              ) : (
                // PERUBAHAN: Gunakan items-start agar margin-top bawaan SmoothDropdown sejajar dengan Search Bar
                <div className="flex flex-col md:flex-row w-full gap-3 items-start">
                  
                  {/* Kolom Pencarian - Disamakan persis: mt-3, p-3, border-2, rounded-xl */}
                  <div className="relative w-full md:flex-1 group mt-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-gray-400 group-focus-within:text-primary" size={18} />
                    <input
                      type="text"
                      placeholder="Cari pengumuman..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 p-3 bg-white border-2 border-gray-100 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* Grup Dropdown */}
                  <div className="flex flex-row gap-3 w-full md:w-auto shrink-0">
                    
                    {/* Width dibuat minimal 180px agar tidak bentrok dengan setingan dalam SmoothDropdown */}
                    <div className="flex-1 md:w-[180px] relative z-50">
                      <SmoothDropdown
                        options={["Terbaru", "Terlama"]}
                        value={selectedSort}
                        onSelect={(val) => setSelectedSort(val)}
                        placeholder="Urutkan"
                      />
                    </div>

                    {/* Width diperlebar jadi 200px agar "Semua Tipe (Pin)" muat 1 baris utuh */}
                    <div className="flex-1 md:w-[200px] relative z-40">
                      <SmoothDropdown
                        options={["Semua Tipe (Pin)", "Di-pin", "Tidak Di-pin"]}
                        value={selectedPinned}
                        onSelect={(val) => setSelectedPinned(val)}
                        placeholder="Filter Pin"
                      />
                    </div>

                  </div>
                </div>
              )}
              
            </div>

            {/* List Pengumuman Card (Format Grid) */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <PengumumanCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pengumumanData.length > 0 ? (
                  <>
                    {pengumumanData.map((item) => (
                      <PengumumanCard 
                        key={item.id} 
                        item={item} 
                        onTogglePin={handleTogglePin} 
                        onEdit={handleOpenEdit} 
                        onDelete={handleDelete}
                        onViewImage={setSelectedImage}
                        onChangeStatus={handleChangeStatus}
                      />
                    ))}
                    
                    {/* Pagination full width (Span 2 kolom di layar medium) */}
                    {totalPages > 1 && (
                      <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="md:col-span-2 text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-sm">Tidak ada pengumuman ditemukan</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* --- KOLOM KANAN (SIDEBAR STATISTIK & TOMBOL BUAT) --- */}
          {/* Hapus duplikasi div lg:col-span-4 di sini */}
          <div className="lg:col-span-4">
            {loading ? (
              <PengumumanSidebarSkeleton />
            ) : (
              <PengumumanSidebar stats={stats} onOpenCreate={handleOpenCreate} />
            )}
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
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8 animate-in zoom-in-95 duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative flex justify-center items-center w-full max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close diletakkan di dalam layar agar aman di HP */}
            <button 
              onClick={() => setSelectedImage(null)} 
              className="absolute top-2 right-2 sm:-top-5 sm:-right-5 bg-black/60 border border-white/20 text-white p-2 rounded-full hover:bg-black transition-all cursor-pointer shadow-xl z-10"
            >
              <X size={20} />
            </button>
            
            {/* Tampilan Gambar Full */}
            <img 
              src={selectedImage.foto} 
              alt={selectedImage.judul} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
}