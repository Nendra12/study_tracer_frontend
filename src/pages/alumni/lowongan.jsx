import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search, Bookmark, X, AlertCircle, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Komponen Global
import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import TambahLowongan from '../../components/alumni/TambahLowongan';

// Komponen Lowongan yang dipisah
import LowonganCard from '../../components/alumni/LowonganCard';
import MyLowonganCard from '../../components/alumni/MyLowonganCard';
import { LowonganSkeleton, MyLowonganSkeleton } from '../../components/alumni/skeleton/LowonganSkeleton';

// Konfigurasi & API
import { alumniApi } from '../../api/alumni';
import { useAuth } from '../../context/AuthContext';

// --- OPSI DROPDOWN FILTER ---
const tipeOptions = ['Semua Tipe', 'Full-time', 'Part-time', 'Kontrak', 'Freelance', 'Magang'];
const provinsiOptions = ['Semua Provinsi', 'Jawa Timur', 'Jawa Tengah', 'Jawa Barat', 'DKI Jakarta', 'Banten', 'DI Yogyakarta'];
const kotaOptions = ['Semua Kota', 'Surabaya', 'Malang', 'Sidoarjo', 'Bandung', 'Jakarta Selatan', 'Semarang'];
const waktuOptions = ['Terbaru', 'Terlama', 'Mendekati Deadline'];

export default function Lowongan() {
  const { user: authUser } = useAuth();
  const user = {
    nama_alumni: authUser?.alumni?.nama_alumni || authUser?.nama || 'Alumni',
    foto: authUser?.alumni?.foto || authUser?.foto
  };

  const navigate = useNavigate();

  const [lowongan, setLowongan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // State Tabs
  const [activeTab, setActiveTab] = useState('semua');

  // State Filters
  const [selectedTipe, setSelectedTipe] = useState('');
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [selectedKota, setSelectedKota] = useState('');
  const [selectedWaktu, setSelectedWaktu] = useState('Terbaru');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // My Lowongan State
  const [myLowongan, setMyLowongan] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myError, setMyError] = useState(null);
  const [myPage, setMyPage] = useState(1);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [mySearch, setMySearch] = useState('');

  const fetchLowongan = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, per_page: 6 };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      if (selectedTipe && selectedTipe !== 'Semua Tipe') params.tipe_pekerjaan = selectedTipe;
      if (selectedProvinsi && selectedProvinsi !== 'Semua Provinsi') params.provinsi = selectedProvinsi;
      if (selectedKota && selectedKota !== 'Semua Kota') params.kota = selectedKota;
      if (selectedWaktu) params.sort = selectedWaktu;

      const res = activeTab === 'disimpan'
        ? await alumniApi.getSavedLowongan(params)
        : await alumniApi.getLowongan(params);

      const responseData = res.data.data;

      if (activeTab === 'disimpan') {
        const items = Array.isArray(responseData?.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
        const unwrapped = items.map(item => ({
          ...(item.lowongan || item),
          is_saved: true,
          id_simpan: item.id_simpan,
        }));
        setLowongan(unwrapped);
        setTotalPages(responseData?.last_page || 1);
        setCurrentPage(responseData?.current_page || 1);
      } else {
        const savedIds = responseData?.saved_ids || [];

        if (Array.isArray(responseData)) {
          setLowongan(responseData.map(job => ({ ...job, is_saved: savedIds.includes(job.id) })));
          setTotalPages(1);
        } else if (responseData?.data) {
          const items = responseData.data.map(job => ({
            ...job,
            is_saved: savedIds.includes(job.id),
          }));
          setLowongan(items);
          setTotalPages(responseData.last_page || 1);
          setCurrentPage(responseData.current_page || 1);
        } else {
          setLowongan([]);
        }
      }
    } catch (err) {
      console.error('Failed to load lowongan:', err);
      setError(err.response?.data?.message || 'Gagal memuat data lowongan');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeTab, selectedTipe, selectedProvinsi, selectedKota, selectedWaktu]);

  const fetchMyLowongan = useCallback(async (page = 1) => {
    try {
      setMyLoading(true);
      setMyError(null);

      const params = { page, per_page: 10 };
      if (mySearch.trim()) params.search = mySearch.trim();

      const res = await alumniApi.getMyLowongan(params);
      const responseData = res.data?.data || res.data;

      if (Array.isArray(responseData)) {
        setMyLowongan(responseData);
        setMyTotalPages(1);
      } else if (responseData?.data) {
        setMyLowongan(responseData.data);
        setMyTotalPages(responseData.last_page || 1);
        setMyPage(responseData.current_page || 1);
      } else {
        setMyLowongan([]);
      }
    } catch (err) {
      console.error('Failed to load my lowongan:', err);
      setMyError(err.response?.data?.message || 'Gagal memuat data lowongan saya');
    } finally {
      setMyLoading(false);
    }
  }, [mySearch]);

  useEffect(() => {
    if (activeTab === 'saya') {
      fetchMyLowongan(1);
    } else {
      fetchLowongan(1);
    }
  }, [activeTab, fetchLowongan, fetchMyLowongan]);

  useEffect(() => {
    document.body.style.overflow = (selectedImage || isModalOpen) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, isModalOpen]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchLowongan(1);
  };

  const handleMySearch = (e) => {
    if (e) e.preventDefault();
    setMyPage(1);
    fetchMyLowongan(1);
  };

  const handleToggleSave = async (id) => {
    try {
      setSavingId(id);
      await alumniApi.toggleSaveLowongan(id);
      setLowongan(prev => prev.map(job =>
        job.id === id ? { ...job, is_saved: !job.is_saved } : job
      ));
    } catch (err) {
      console.error('Toggle save failed:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleFormSuccess = () => {
    if (activeTab === 'saya') fetchMyLowongan(myPage);
    else fetchLowongan(currentPage);
  };

  // Render "Lowongan Saya" tab content
  const renderMyLowongan = () => {
    if (myLoading) return <MyLowonganSkeleton />;
    if (myError) {
      return (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
            <p className="text-slate-500 text-sm mb-4">{myError}</p>
            <button onClick={() => fetchMyLowongan(myPage)} className="bg-[#425A5C] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#2e4042] transition-all cursor-pointer">
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    if (myLowongan.length === 0) {
      return (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-center text-slate-400">
            <FileText size={56} className="mx-auto mb-4 opacity-30 text-[#425A5C]" />
            <h2 className="text-lg font-black text-[#425A5C] mb-2">Belum Ada Lowongan</h2>
            <p className="text-sm font-medium mb-4">Anda belum mengajukan lowongan kerja apapun.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#425A5C] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#2e4042] transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Plus size={16} /> Pasang Lowongan
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4">
          {myLowongan.map((job) => (
            <MyLowonganCard key={job.id} data={job} />
          ))}
        </div>
        {myTotalPages > 1 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <Pagination
              currentPage={myPage}
              totalPages={myTotalPages}
              onPageChange={(page) => { setMyPage(page); fetchMyLowongan(page); }}
            />
          </div>
        )}
      </>
    );
  };

  // Render primary lowongan grid
  const renderLowonganGrid = () => {
    if (loading) return <LowonganSkeleton />;
    if (error) {
      return (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button onClick={() => fetchLowongan(currentPage)} className="bg-[#425A5C] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#2e4042] transition-all cursor-pointer">
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    if (lowongan.length === 0) {
      return (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-center text-slate-400">
            <Briefcase size={56} className="mx-auto mb-4 opacity-30 text-[#425A5C]" />
            <h2 className="text-lg font-black text-[#425A5C] mb-2">
              {activeTab === 'disimpan' ? 'Belum Ada Lowongan Tersimpan' : 'Pencarian Tidak Ditemukan'}
            </h2>
            <p className="text-sm font-medium">
              {activeTab === 'disimpan' ? 'Simpan lowongan yang menarik untuk dilihat nanti.' : 'Coba gunakan kata kunci atau filter lain.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {lowongan.map((job) => (
            <LowonganCard
              key={job.id}
              data={job}
              savingId={savingId}
              onImageClick={(img) => setSelectedImage(img)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-12 mb-4 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => { setCurrentPage(page); fetchLowongan(page); }}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-[#425A5C]/20 overflow-x-hidden">
      
      {/* --- HEADER SECTION --- */}
      <section className="relative pt-28 pb-24 w-full z-30 bg-[#425A5C] rounded-b-[2.5rem]">
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="max-w-2xl">        
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
              Bursa Kerja
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Temukan dan lamar peluang karir terbaik dari perusahaan mitra kami, atau bagikan informasi lowongan untuk sesama alumni.
            </p>
          </div>

          <div className="hidden lg:flex items-center justify-center opacity-80">
            <Briefcase size={120} className="text-white/10" />
          </div>
        </div>
      </section>

      {/* --- FLOATING CARD (TABS & FILTER) --- */}
      <section className="relative z-40 w-full max-w-7xl mx-auto px-6 lg:px-12 -mt-10 mb-8">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-slate-100">
          
          {/* TABS & ACTION BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => { setActiveTab('semua'); setCurrentPage(1); }} 
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${activeTab === 'semua' ? 'bg-[#425A5C] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:text-[#425A5C] hover:bg-slate-100 border border-slate-200'}`}
              >
                Semua Lowongan
              </button>
              <button 
                onClick={() => { setActiveTab('disimpan'); setCurrentPage(1); }} 
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'disimpan' ? 'bg-[#425A5C] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:text-[#425A5C] hover:bg-slate-100 border border-slate-200'}`}
              >
                <Bookmark size={14} fill={activeTab === 'disimpan' ? 'currentColor' : 'none'} /> Disimpan
              </button>
              <button 
                onClick={() => { setActiveTab('saya'); setMyPage(1); }} 
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'saya' ? 'bg-[#425A5C] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:text-[#425A5C] hover:bg-slate-100 border border-slate-200'}`}
              >
                <FileText size={14} /> Lowongan Saya
              </button>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-white border-2 border-[#425A5C]/20 text-[#425A5C] px-5 py-2.5 rounded-xl text-[13px] font-bold shadow-sm hover:bg-[#425A5C] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Tambah Lowongan
            </button>
          </div>

          {/* SEARCH & FILTER FORMS (GAYA BARU SEJAJAR) */}
          {activeTab === 'saya' ? (
            <form onSubmit={handleMySearch} className="flex h-11 w-full max-w-md shadow-sm border border-slate-200 rounded-xl bg-white overflow-hidden transition-colors focus-within:border-slate-300">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={mySearch} 
                  onChange={(e) => setMySearch(e.target.value)} 
                  placeholder="Cari lowongan saya..." 
                  className="w-full h-full pl-10 pr-4 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none" 
                />
              </div>
              <button type="submit" className="bg-[#425A5C] text-white px-6 font-bold text-sm hover:bg-[#2e4042] transition-colors cursor-pointer">
                Cari
              </button>
            </form>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">
              
              {/* Form Pencarian (Tombol menyatu & tidak mengambang) */}
              <form onSubmit={handleSearch} className="flex h-11 w-full lg:flex-1 shadow-sm border border-slate-200 rounded-xl bg-white overflow-hidden transition-colors focus-within:border-slate-300">
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Cari berdasarkan judul pekerjaan..." 
                    className="w-full h-full pl-10 pr-4 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none" 
                  />
                </div>
                <button type="submit" className="bg-[#425A5C] text-white px-6 md:px-8 font-bold text-sm hover:bg-[#2e4042] transition-colors cursor-pointer border-l border-[#425A5C]">
                  Cari
                </button>
              </form>

              {/* Dropdowns Filter */}
              <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-auto shrink-0">
                <div className="w-[calc(50%-6px)] lg:w-36 h-11 relative z-[60]">
                  <SmoothDropdown options={tipeOptions} value={selectedTipe} onSelect={(val) => setSelectedTipe(val === 'Semua Tipe' ? '' : val)} placeholder="Tipe Pekerjaan" />
                </div>
                <div className="w-[calc(50%-6px)] lg:w-40 h-11 relative z-50">
                  <SmoothDropdown options={provinsiOptions} value={selectedProvinsi} onSelect={(val) => setSelectedProvinsi(val === 'Semua Provinsi' ? '' : val)} placeholder="Provinsi" isSearchable={true} />
                </div>
                <div className="w-[calc(50%-6px)] lg:w-40 h-11 relative z-40">
                  <SmoothDropdown options={kotaOptions} value={selectedKota} onSelect={(val) => setSelectedKota(val === 'Semua Kota' ? '' : val)} placeholder="Kota" isSearchable={true} />
                </div>
                <div className="w-[calc(50%-6px)] lg:w-36 h-11 relative z-30">
                  <SmoothDropdown options={waktuOptions} value={selectedWaktu} onSelect={(val) => setSelectedWaktu(val)} placeholder="Terbaru" />
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-20 flex flex-col pb-12">
        {activeTab === 'saya' ? renderMyLowongan() : renderLowonganGrid()}
      </main>

      <TambahLowongan isOpen={isModalOpen} onClose={handleModalClose} onSuccess={handleFormSuccess} editJob={editingJob} />

      {/* --- MODAL IMAGE PREVIEW --- */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                <img src={selectedImage} alt="Pratinjau Poster" className="max-w-full max-h-[85vh] object-contain" onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Poster+Not+Found'; }} />
                <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#425A5C]">Pratinjau Poster Lowongan</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}