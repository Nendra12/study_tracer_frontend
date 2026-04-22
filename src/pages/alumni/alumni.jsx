import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, AlertCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Komponen
import Pagination from '../../components/admin/Pagination';
import SmoothDropdown from '../../components/admin/SmoothDropdown';
import AlumniProfileCard from '../../components/alumni/AlumniProfile';
import Connection from '../../components/alumni/Connection';
import { AlumniSkeleton } from '../../components/alumni/skeleton';

import AlumniImg from '../../assets/svg/people-who-support-svgrepo-com.svg'

// API
import { alumniApi } from '../../api/alumni';
import { useConnections } from '../../hooks/useConnections';

const getAlumniId = (entity) => entity?.id || entity?.id_alumni || entity?.alumni_id || null;

export default function Alumni() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const {
    statusMap,
    loadingStatusMap,
    actionLoadingMap,
    fetchStatuses,
    registerAlumniIds,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeOrCancel,
    block,
    unblock,
  } = useConnections();

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
        
        const formattedTahun = (data.tahun || [])
          .map(String)
          .sort((a, b) => b - a);

        setFilterOptions({
          tahun: formattedTahun,
          status: data.status || [],
          universitas: data.universitas || [],
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    fetchFilters();
  }, []);

  const fetchAlumni = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const hasAngkatanFilter = selectedTahun && selectedTahun !== 'Semua Angkatan';

      const params = { page, per_page: hasAngkatanFilter ? 100 : 8 };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      
      // Tidak mengirim param tahun ke backend karena backend tidak support filter angkatan
      if (selectedStatus && selectedStatus !== 'Semua Status') params.status = selectedStatus;
      if (selectedUniv && selectedUniv !== 'Semua Universitas') params.universitas = selectedUniv;

      const res = await alumniApi.getAlumniDirectory(params);
      const responseData = res.data.data;

      if (responseData?.data) {
        let items = responseData.data;

        // Client-side filter by angkatan (sebagai fallback jika backend tidak mendukung)
        if (hasAngkatanFilter) {
          items = items.filter(a => String(a.angkatan) === String(selectedTahun));
        }

        setAlumniData(items);
        setTotalPages(hasAngkatanFilter ? 1 : (responseData.last_page || 1));
        setCurrentPage(hasAngkatanFilter ? 1 : (responseData.current_page || 1));
      } else if (Array.isArray(responseData)) {
        let items = responseData;
        if (hasAngkatanFilter) {
          items = items.filter(a => String(a.angkatan) === String(selectedTahun));
        }
        setAlumniData(items);
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

  // Sync status koneksi pada alumni yang tampil di grid.
  useEffect(() => {
    const ids = alumniData
      .map((item) => getAlumniId(item))
      .filter((id) => id !== null && id !== undefined);

    if (ids.length === 0) return;

    registerAlumniIds(ids);
    fetchStatuses(ids);
  }, [alumniData, fetchStatuses, registerAlumniIds]);

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

  // PERUBAHAN: Opsi default diubah jadi 'Semua Angkatan'
  const tahunOptions = ['Semua Angkatan', ...filterOptions.tahun];
  const statusOptions = ['Semua Status', ...filterOptions.status];
  const univOptions = ['Semua Universitas', ...filterOptions.universitas];

  return (
    <div className='w-full min-h-screen bg-[#f8f9fa]'>
      {/* --- HEADER SECTION DENGAN BACKGROUND GELAP (KONSISTEN DENGAN BERANDA) --- */}
      <section className=" relative pt-20 pb-20 lg:pb-8 w-full z-30 bg-primary rounded-b-[2.5rem]">
        <div className=" relative z-10 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center md:items-center gap-8">
          
          <div className="max-w-2xl">
            <h1 className="text-3xl mt-5 md:mt-0 md:text-5xl font-black text-white tracking-tight mb-4 capitalize">
              Direktori Alumni
            </h1>
            <p className="text-white/80 text-sm md:text-base font-medium leading-relaxed">
              Portal ini dirancang untuk memantau progres karir Anda, menemukan peluang eksklusif, 
              dan menjaga silaturahmi dengan almamater tercinta.
            </p>
          </div>

          {/* Elemen Dekoratif Kanan */}
          <div className="hidden lg:flex items-center justify-center opacity-80">
            <img src={AlumniImg} alt="alumni" className='w-70'/>
          </div>

        </div>
      </section>

      {/* --- FLOATING FILTER & SEARCH SECTION --- */}
      <section className="relative z-40 max-w-7xl mx-auto px-6 lg:px-12 -mt-10 mb-8">
        <div className="bg-white p-4 md:px-4 md:pt-4 md:pb-7 rounded-md shadow-xl border border-slate-100">
          
          {/* SEARCH & FILTER FORM - Dibuat sejajar mengikuti referensi Lowongan */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 w-full">

            {/* FORM PENCARIAN - Menggunakan flex-1 agar mengambil sisa ruang */}
            <form 
              onSubmit={handleSearch} 
              className="flex h-11.75 w-full lg:flex-1 border-2 border-gray-100 rounded-xl bg-white overflow-hidden transition-all focus-within:border-gray-200"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, perusahaan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-10 pr-4 bg-transparent text-sm text-slate-700 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary text-white px-6 md:px-8 h-full font-bold text-sm hover:bg-[#2e4042] transition-colors cursor-pointer border-l-2 border-gray-100"
              >
                Cari
              </button>
            </form>

            {/* DROPDOWN FILTERS - Tetap sejajar di kanan */}
            <div className="flex flex-wrap lg:flex-nowrap gap-3 mt-3 lg:mt-0 w-full lg:w-auto shrink-0">
              <div className="w-[calc(50%-6px)] lg:w-40 relative z-60">
                <SmoothDropdown 
                  options={tahunOptions} 
                  value={selectedTahun} 
                  onSelect={(val) => setSelectedTahun(val === 'Semua Angkatan' ? '' : val)} 
                  placeholder="Tahun Angkatan" 
                />
              </div>
              <div className="w-[calc(50%-6px)] lg:w-44 relative z-50">
                <SmoothDropdown 
                  options={statusOptions} 
                  value={selectedStatus} 
                  onSelect={(val) => setSelectedStatus(val === 'Semua Status' ? '' : val)} 
                  placeholder="Status Pekerjaan" 
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- MAIN CONTENT (CARD AREA) --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-12 relative z-20 flex flex-col pb-12">
        {loading ? (
          <AlumniSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-700 mb-2">Gagal Memuat Data</h2>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button onClick={() => fetchAlumni(currentPage)} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-[#2e4042] transition-colors">
                Coba Lagi
              </button>
            </div>
          </div>
        ) : alumniData.length === 0 ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-md shadow-sm border border-slate-100">
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
              {alumniData.map((alumni) => {
                const alumniId = getAlumniId(alumni);
                const myAlumniId = getAlumniId(authUser?.profile) || getAlumniId(authUser);
                const isSelf = String(alumniId) === String(myAlumniId);

                return (
                <AlumniProfileCard 
                  key={alumniId || alumni.id} 
                  alumni={alumni} 
                  onClick={() => navigate(`/alumni/daftar-alumni/${alumniId || alumni.id}`, { state: { alumni } })}
                  onImageClick={(src) => setSelectedImage(src)}
                  connectionSlot={(
                    <Connection
                      alumniId={alumniId}
                      isSelf={isSelf}
                      statusEntry={statusMap[String(alumniId)]}
                      isLoading={loadingStatusMap[String(alumniId)]}
                      isActionLoading={actionLoadingMap[String(alumniId)]}
                      onConnect={sendRequest}
                      onAccept={acceptRequest}
                      onReject={rejectRequest}
                      onRemove={removeOrCancel}
                      onBlock={block}
                      onUnblock={unblock}
                      compact
                    />
                  )}
                />
                );
              })}
            </div>

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
              <div className="mt-12 mb-4 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
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