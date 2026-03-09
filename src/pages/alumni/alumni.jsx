import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Komponen
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import AlumniProfileCard from '../../components/alumni/AlumniProfile';
import { AlumniSkeleton } from '../../components/alumni/skeleton';

// API
import { alumniApi } from '../../api/alumni';

export default function Alumni() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // Data state
  const [alumniData, setAlumniData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUniv, setSelectedUniv] = useState('');

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    tahun: [],
    status: [],
    universitas: [],
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Image preview modal
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    async function fetchFilters() {
      try {
        const res = await alumniApi.getAlumniDirectoryFilters();
        const data = res.data.data;
        setFilterOptions({
          tahun: data.tahun || [],
          status: data.status || [],
          universitas: data.universitas || [],
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    fetchFilters();
  }, []);

  // Fetch alumni directory
  const fetchAlumni = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, per_page: 8 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedTahun && selectedTahun !== 'Semua Tahun') params.tahun = selectedTahun;
      if (selectedStatus && selectedStatus !== 'Semua Status') params.status = selectedStatus;
      if (selectedUniv && selectedUniv !== 'Semua Universitas') params.universitas = selectedUniv;

      const res = await alumniApi.getAlumniDirectory(params);
      const responseData = res.data.data;

      if (responseData?.data) {
        setAlumniData(responseData.data);
        setTotalPages(responseData.last_page || 1);
        setCurrentPage(responseData.current_page || 1);
      } else if (Array.isArray(responseData)) {
        setAlumniData(responseData);
        setTotalPages(1);
      } else {
        setAlumniData([]);
      }
    } catch (err) {
      console.error('Failed to load alumni directory:', err);
      setError(err.response?.data?.message || 'Gagal memuat data alumni');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTahun, selectedStatus, selectedUniv]);

  // Re-fetch when filters change (reset to page 1)
  useEffect(() => {
    fetchAlumni(1);
  }, [fetchAlumni]);

  // Lock scroll when image modal is open
  useEffect(() => {
    document.body.style.overflow = selectedImage ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAlumni(1);
  };

  // Build dropdown options with "Semua" prefix
  const tahunOptions = ['Semua Tahun', ...filterOptions.tahun];
  const statusOptions = ['Semua Status', ...filterOptions.status];
  const univOptions = ['Semua Universitas', ...filterOptions.universitas];

  return (
    <div className='w-full min-h-screen bg-[#f8f9fa]'>
      {/* --- HEADER & FILTER SECTION --- */}
      <section className="relative pt-24 pb-8 w-full z-40">
        <div className="absolute inset-0 z-0">
          <img src="/background3.jpeg" alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/50 md:bg-gradient-to-r md:from-white/80 md:via-white/60 md:to-white/20"></div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#f8f9fa]"></div>
        </div>

        <div className="relative z-10 mt-5 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2 uppercase">Direktori Alumni</h1>
            <p className="text-primary/90 text-sm md:text-base max-w-2xl font-semibold drop-shadow-sm">
              Terhubung dengan para lulusan dan perluas jaringan profesional Anda.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4 relative">
            {/* Kolom Pencarian */}
            <div className="relative flex-1 group shadow-sm border border-primary/10 rounded-2xl bg-white">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="cari berdasarkan nama, perusahaan, atau peran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all h-[52px] text-primary placeholder:text-primary/40"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
              <div className="w-[calc(50%-6px)] sm:w-40 xl:w-44 border-primary/10 relative z-[60]">
                <SmoothDropdown options={tahunOptions} value={selectedTahun} onSelect={(val) => setSelectedTahun(val === 'Semua Tahun' ? '' : val)} placeholder="Tahun Kelulusan" />
              </div>
              <div className="w-[calc(50%-6px)] sm:w-40 xl:w-48 border-primary/10 relative z-50">
                <SmoothDropdown options={statusOptions} value={selectedStatus} onSelect={(val) => setSelectedStatus(val === 'Semua Status' ? '' : val)} placeholder="Status Pekerjaan" />
              </div>
              <div className="w-full sm:w-48 xl:w-52 border-primary/10 relative z-40">
                <SmoothDropdown options={univOptions} value={selectedUniv} onSelect={(val) => setSelectedUniv(val === 'Semua Universitas' ? '' : val)} placeholder="Universitas" isSearchable={true} />
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* --- MAIN CONTENT (CARD AREA) --- */}
      <main className="flex-1 w-full mt-5 max-w-7xl mx-auto px-6 lg:px-12 relative z-20 flex flex-col pb-12">
        {loading ? (
          <AlumniSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button onClick={() => fetchAlumni(currentPage)} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#2A3E3F] transition-colors">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : alumniData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Users size={48} className="text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Tidak Ada Alumni Ditemukan</h2>
              <p className="text-slate-500 text-sm">Coba ubah kata kunci pencarian atau filter Anda.</p>
            </div>
          </div>
        ) : (
          <>
            {/* ALUMNI CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {alumniData.map((alumni) => (
                <AlumniProfileCard 
                  key={alumni.id} 
                  alumni={alumni} 
                  onClick={() => navigate(`/alumni/daftar-alumni/${alumni.id}`, { state: { alumni } })}
                  onImageClick={(src) => setSelectedImage(src)}
                />
              ))}
            </div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="mt-12 mb-4 bg-white rounded-xl shadow-sm border border-primary/10 overflow-hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    fetchAlumni(page);
                  }}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* --- MODAL POPUP PREVIEW GAMBAR --- */}
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
              className="relative w-max max-w-[90vw] md:max-w-[70vw] lg:max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="relative overflow-hidden flex items-center justify-center bg-slate-100">
                <img
                  src={selectedImage}
                  alt="Pratinjau Foto Alumni"
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Photo+Not+Found"; }}
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all cursor-pointer backdrop-blur-md"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-5 text-center bg-white border-t border-slate-100">
                <h3 className="text-sm sm:text-base font-bold text-primary">Pratinjau Foto Profil</h3>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}