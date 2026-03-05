import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Building2, Search, Bookmark,
  ArrowRight, X, Clock, AlertCircle, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import hitungMundur from '../../utilitis/hitungMundurTanggal';

// --- IMPORT MODAL ---
import TambahLowongan from '../../components/alumni/TambahLowongan';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

// --- OPSI DROPDOWN FILTER ---
const tipeOptions = ['Semua Tipe', 'Full-time', 'Part-time', 'Kontrak', 'Freelance', 'Magang'];
const provinsiOptions = ['Semua Provinsi', 'Jawa Timur', 'Jawa Tengah', 'Jawa Barat', 'DKI Jakarta', 'Banten', 'DI Yogyakarta'];
const kotaOptions = ['Semua Kota', 'Surabaya', 'Malang', 'Sidoarjo', 'Bandung', 'Jakarta Selatan', 'Semarang'];
const waktuOptions = ['Terbaru', 'Terlama', 'Mendekati Deadline'];

// --- Lowongan Card ---
function LowonganCard({ data, onImageClick, onToggleSave, savingId }) {
  const navigate = useNavigate();
  const deadline = data.lowongan_selesai ? hitungMundur(data.lowongan_selesai) : null;
  const fotoUrl = getImageUrl(data.foto);
  const perusahaanNama = data.perusahaan?.nama || '-';
  const lokasi = data.perusahaan?.kota
    ? `${data.perusahaan.kota.nama}${data.perusahaan.kota.provinsi ? ', ' + data.perusahaan.kota.provinsi.nama : ''}`
    : (data.lokasi || '-');

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/lowongan/${data.id}`)}
      className="bg-white rounded-3xl flex flex-col overflow-hidden border border-[#3C5759]/5 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
    >
      <div
        className="h-56 w-full bg-white relative overflow-hidden cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(fotoUrl || '/Desain Poster Job.jpg');
        }}
      >
        <img
          src={fotoUrl || '/Desain Poster Job.jpg'}
          alt="Lowongan"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Poster+Not+Found'; }}
        />
        
        {/* Efek Gelombang Bawah */}
        <svg 
          className="absolute bottom-0 left-0 w-[102%] -translate-x-[1%] h-10 z-20 translate-y-[1px]" 
          viewBox="0 0 1440 100" 
          preserveAspectRatio="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fill="#ffffff" 
            d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
          ></path>
        </svg>
      </div>

      <div className="p-6 pt-1 flex-1 flex flex-col relative z-20 bg-white">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-black text-[#3C5759] text-lg leading-tight flex-1 line-clamp-2">{data.judul}</h3>
          {deadline && deadline !== '-' && (
            <span className="text-red-500 text-[10px] font-black uppercase bg-red-50 px-2.5 py-1 rounded-md shrink-0">
              {deadline}
            </span>
          )}
        </div>

        {data.lowongan_selesai && (
          <div className="mb-4">
            <span className="text-slate-500 flex items-center gap-1.5 text-[11px] font-bold">
              <Clock size={12} />
              Berakhir: {new Date(data.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        )}

        <div className="space-y-3 mb-5 px-1">
          <div className="flex items-start gap-3 text-[#3C5759]/80">
            <Building2 size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold line-clamp-2">{perusahaanNama}</p>
          </div>
          <div className="flex items-start gap-3 text-[#3C5759]/80">
            <MapPin size={16} className="text-[#3C5759]/50 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold line-clamp-2">{lokasi}</p>
          </div>
        </div>

        {data.skills && data.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6 px-1">
            {data.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-[#3C5759]/5 text-[#3C5759] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#3C5759]/10">
                {skill.nama || skill}
              </span>
            ))}
            {data.skills.length > 3 && (
              <span className="text-[#3C5759]/60 text-[10px] font-bold px-1.5 py-1">+{data.skills.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-[#3C5759]/10 flex justify-between items-center">
          <div className="flex flex-col">
            {data.tipe_pekerjaan && (
              <span className="text-[#3C5759]/50 text-[11px] font-bold uppercase tracking-wider">{data.tipe_pekerjaan}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleSave(data.id)}
              disabled={savingId === data.id}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              {data.is_saved ? (
                <Bookmark size={18} className="text-[#3C5759]" fill="currentColor" />
              ) : (
                <Bookmark size={18} className="text-slate-300 hover:text-[#3C5759]" />
              )}
            </button>
            <button className="p-2 bg-[#3C5759]/5 hover:bg-[#3C5759]/10 rounded-full transition-colors cursor-pointer">
              <ArrowRight size={18} className="text-[#3C5759]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Loading Skeleton ---
function LowonganSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-[#3C5759]/5 shadow-sm animate-pulse">
          <div className="h-56 bg-slate-200" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-100 rounded w-1/3 mt-4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  const fetchLowongan = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, per_page: 12 };
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

  useEffect(() => {
    fetchLowongan(1);
  }, [fetchLowongan]);

  // Lock scroll when image modal or add job modal is open
  useEffect(() => {
    document.body.style.overflow = (selectedImage || isModalOpen) ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, isModalOpen]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
    fetchLowongan(1);
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

  // Handler for Modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleFormSuccess = () => {
    fetchLowongan(currentPage);
  };

  const navUser = { 
    nama_alumni: user.nama_alumni,
    foto: user.foto 
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col selection:bg-[#3C5759]/20 overflow-x-hidden">
      <Navbar user={navUser} />

      {/* --- HEADER SECTION --- */}
      <div className="relative pt-24 pb-8 w-full z-40">
        
        {/* GAMBAR BACKGROUND */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/background3.jpeg" 
            alt="Background" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-white/50 md:bg-gradient-to-r md:from-white/80 md:via-white/60 md:to-white/20"></div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#f8f9fa]"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-black text-[#3C5759] tracking-tight mb-2 uppercase">Bursa Kerja</h1>
            <p className="text-[#3C5759]/90 text-sm md:text-base max-w-2xl font-semibold drop-shadow-sm">
              Temukan dan lamar peluang karir terbaik dari perusahaan mitra kami.
            </p>
          </div>

          {/* TAB & TAMBAH LOWONGAN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('semua'); setCurrentPage(1); }}
                className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all cursor-pointer ${
                  activeTab === 'semua' ? 'bg-[#3C5759] text-white shadow-md' : 'bg-white text-[#3C5759]/70 hover:text-[#3C5759] border border-[#3C5759]/10'
                }`}
              >
                Semua Lowongan
              </button>
              <button
                onClick={() => { setActiveTab('disimpan'); setCurrentPage(1); }}
                className={`px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'disimpan' ? 'bg-[#3C5759] text-white shadow-md' : 'bg-white text-[#3C5759]/70 hover:text-[#3C5759] border border-[#3C5759]/10'
                }`}
              >
                <Bookmark size={14} fill={activeTab === 'disimpan' ? 'currentColor' : 'none'} /> Disimpan
              </button>
            </div>

            {/* BUTTON TRIGGER MODAL */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white border border-[#3C5759]/20 text-[#3C5759] px-5 py-2.5 rounded-2xl text-[13px] font-bold shadow-sm hover:bg-[#3C5759] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Tambah Lowongan
            </button>
          </div>

          {/* SEARCH BAR & DROPDOWN FILTERS */}
          <div className="flex flex-col xl:flex-row gap-4 relative">
            
            <form onSubmit={handleSearch} className="relative flex-1 group shadow-sm border border-[#3C5759]/10 rounded-2xl bg-white flex z-[70]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3C5759]/40 group-focus-within:text-[#3C5759] transition-colors" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan judul pekerjaan..." 
                className="w-full pl-12 pr-4 py-3 bg-transparent rounded-l-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20 focus:border-transparent transition-all h-[52px] text-[#3C5759] placeholder:text-[#3C5759]/40"
              />
              <button type="submit" className="bg-[#3C5759] text-white px-6 h-[52px] rounded-r-2xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] hover:shadow-lg transition-all cursor-pointer">
                Cari
              </button>
            </form>

            <div className="flex flex-wrap lg:flex-nowrap gap-3 shrink-0">
              <div className="w-[calc(50%-6px)] lg:w-36 border-[#3C5759]/10 relative z-[60]">
                <SmoothDropdown options={tipeOptions} value={selectedTipe} onSelect={(val) => setSelectedTipe(val === 'Semua Tipe' ? '' : val)} placeholder="Tipe Pekerjaan" />
              </div>
              <div className="w-[calc(50%-6px)] lg:w-40 border-[#3C5759]/10 relative z-[50]">
                <SmoothDropdown options={provinsiOptions} value={selectedProvinsi} onSelect={(val) => setSelectedProvinsi(val === 'Semua Provinsi' ? '' : val)} placeholder="Provinsi" isSearchable={true} />
              </div>
              <div className="w-[calc(50%-6px)] lg:w-40 border-[#3C5759]/10 relative z-[40]">
                <SmoothDropdown options={kotaOptions} value={selectedKota} onSelect={(val) => setSelectedKota(val === 'Semua Kota' ? '' : val)} placeholder="Kota" isSearchable={true} />
              </div>
              <div className="w-[calc(50%-6px)] lg:w-48 border-[#3C5759]/10 relative z-[30]">
                <SmoothDropdown options={waktuOptions} value={selectedWaktu} onSelect={(val) => setSelectedWaktu(val)} placeholder="Urutkan Waktu" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT (CARD AREA) --- */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-4 relative z-20 flex flex-col pb-12">
        {loading ? (
          <LowonganSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-[#3C5759]/5 shadow-sm">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button onClick={() => fetchLowongan(currentPage)} className="bg-[#3C5759] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : lowongan.length === 0 ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-[#3C5759]/5 shadow-sm">
            <div className="text-center text-slate-400">
              <Briefcase size={56} className="mx-auto mb-4 opacity-30 text-[#3C5759]" />
              <h2 className="text-lg font-black text-[#3C5759] mb-2">
                {activeTab === 'disimpan' ? 'Belum Ada Lowongan Tersimpan' : 'Pencarian Tidak Ditemukan'}
              </h2>
              <p className="text-sm font-medium">
                {activeTab === 'disimpan' ? 'Simpan lowongan yang menarik untuk dilihat nanti.' : 'Coba gunakan kata kunci atau filter lain.'}
              </p>
            </div>
          </div>
        ) : (
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
              <div className="mt-12 mb-4 bg-white rounded-xl shadow-sm border border-[#3C5759]/10 overflow-hidden">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    fetchLowongan(page);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* MODAL TAMBAH LOWONGAN */}
      <TambahLowongan
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleFormSuccess}
        editJob={editingJob}
      />

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                <img
                  src={selectedImage}
                  alt="Pratinjau Poster"
                  className="max-w-full max-h-[85vh] object-contain"
                  onError={(e) => { e.target.src = 'https://placehold.co/800x600?text=Poster+Not+Found'; }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-[#3C5759]">Pratinjau Poster Lowongan</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}