import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Building2, Search, Bookmark, BookmarkCheck,
  ArrowRight, X, SlidersHorizontal, Clock, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../../components/alumni/Navbar';
import Footer from '../../components/alumni/Footer';
import { alumniApi } from '../../api/alumni';
import { STORAGE_BASE_URL } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import hitungMundur from '../../utilitis/hitungMundurTanggal';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_BASE_URL}/${path}`;
}

// --- Lowongan Card ---
function LowonganCard({ data, onImageClick, onToggleSave, savingId }) {
  const deadline = data.lowongan_selesai ? hitungMundur(data.lowongan_selesai) : null;
  const fotoUrl = getImageUrl(data.foto);
  const perusahaanNama = data.perusahaan?.nama || '-';
  const lokasi = data.perusahaan?.kota
    ? `${data.perusahaan.kota.nama}${data.perusahaan.kota.provinsi ? ', ' + data.perusahaan.kota.provinsi.nama : ''}`
    : (data.lokasi || '-');

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col h-full transition-all duration-300 group"
    >
      <div
        className="h-56 overflow-hidden relative cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(fotoUrl || '/Desain Poster Job.jpg');
        }}
      >
        <img
          src={fotoUrl || '/Desain Poster Job.jpg'}
          alt="Lowongan"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Poster+Not+Found'; }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent z-10" />
      </div>

      <div className="p-5 flex-1 flex flex-col relative z-20">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-black text-[#3C5759] text-lg leading-tight flex-1 line-clamp-2">{data.judul}</h3>
          {deadline && deadline !== '-' && (
            <span className="text-red-500 text-[10px] font-black uppercase bg-red-50 px-2 py-1 rounded-md ml-2 shrink-0">
              {deadline}
            </span>
          )}
        </div>

        {data.lowongan_selesai && (
          <div className="mb-3">
            <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium">
              <Clock size={12} />
              Berakhir: {new Date(data.lowongan_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[#3C5759]">
            <Building2 size={16} />
          </div>
          <span className="font-bold text-sm text-slate-700 line-clamp-1">{perusahaanNama}</span>
        </div>

        <div className="bg-slate-50 rounded-xl px-3 py-2 self-start mb-4 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
            <MapPin size={14} className="text-[#3C5759]" />
            <span className="line-clamp-1">{lokasi}</span>
          </div>
        </div>

        {data.deskripsi && (
          <p className="text-slate-500 text-[12px] leading-relaxed mb-6 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: data.deskripsi }} />
        )}

        {data.skills && data.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {data.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {skill.nama || skill}
              </span>
            ))}
            {data.skills.length > 3 && (
              <span className="text-slate-400 text-[10px] font-medium">+{data.skills.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
          <div className="flex flex-col">
            {data.tipe_pekerjaan && (
              <span className="text-slate-400 text-[10px] font-medium italic">{data.tipe_pekerjaan}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleSave(data.id)}
              disabled={savingId === data.id}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              {data.is_saved ? (
                <BookmarkCheck size={18} className="text-[#3C5759]" />
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
        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
          <div className="h-56 bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="h-8 bg-slate-100 rounded w-1/3" />
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
  const navigate = useNavigate();

  const [lowongan, setLowongan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [activeTab, setActiveTab] = useState('semua'); // 'semua' | 'disimpan'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLowongan = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, per_page: 12 };
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = activeTab === 'disimpan'
        ? await alumniApi.getSavedLowongan(params)
        : await alumniApi.getLowongan(params);

      const responseData = res.data.data;

      if (activeTab === 'disimpan') {
        // SavedLowonganResource wraps lowongan data under .lowongan
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
        // LowonganAlumniResource + saved_ids as additional data
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
  }, [searchQuery, activeTab]);

  useEffect(() => {
    fetchLowongan(1);
  }, [fetchLowongan]);

  // Lock scroll when image modal open
  useEffect(() => {
    document.body.style.overflow = selectedImage ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  const handleSearch = (e) => {
    e.preventDefault();
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

  const namaAlumni = authUser?.alumni?.nama_alumni || 'Alumni';
  const navUser = { nama_alumni: namaAlumni };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-[#3C5759]/20 overflow-x-hidden">
      <Navbar user={navUser} />

      {/* Header */}
      <div className="pt-24 pb-8 bg-white border-b border-slate-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#3C5759] tracking-tight">Lowongan Pekerjaan</h1>
              <p className="text-slate-400 text-sm font-medium mt-1">Temukan peluang karir terbaik dari perusahaan mitra</p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari lowongan..."
                  className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3C5759]/20 focus:border-[#3C5759] w-64"
                />
              </div>
              <button type="submit" className="bg-[#3C5759] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#2A3E3F] transition-all cursor-pointer">
                Cari
              </button>
            </form>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => { setActiveTab('semua'); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'semua' ? 'bg-[#3C5759] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Semua Lowongan
            </button>
            <button
              onClick={() => { setActiveTab('disimpan'); setCurrentPage(1); }}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'disimpan' ? 'bg-[#3C5759] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <BookmarkCheck size={14} /> Disimpan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[1440px] mx-auto px-6 lg:px-12 py-10 w-full">
        {loading ? (
          <LowonganSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button onClick={() => fetchLowongan(currentPage)} className="bg-[#3C5759] text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : lowongan.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center text-slate-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">
                {activeTab === 'disimpan' ? 'Belum Ada Lowongan Tersimpan' : 'Belum Ada Lowongan'}
              </h2>
              <p className="text-sm">
                {activeTab === 'disimpan' ? 'Simpan lowongan yang menarik untuk dilihat nanti.' : 'Lowongan pekerjaan belum tersedia saat ini.'}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => { setCurrentPage(p => p - 1); fetchLowongan(currentPage - 1); }}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-bold text-slate-600 px-4">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => { setCurrentPage(p => p + 1); fetchLowongan(currentPage + 1); }}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}