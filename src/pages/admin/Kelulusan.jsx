import React, { useState, useEffect, useRef } from 'react';
import { History, GraduationCap } from 'lucide-react';
import ModalTambahManual from '../../components/admin/ModalTambahManual';
import ModalEditStatusKelulusan from '../../components/admin/ModalEditStatusKelulusan';
import { adminApi } from '../../api/admin'; 
import { alertSuccess, alertError, alertConfirm } from '../../utilitis/alert'; 
import KelulusanSkeleton from '../../components/admin/skeleton/KelulusanSkeleton';

import TabDataLulusan from '../../components/admin/TabDataLulusan';
import TabProsesKelulusan from '../../components/admin/TabProsesKelulusan';

export default function Kelulusan() {
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('riwayat'); 
  const [isPageReady, setIsPageReady] = useState(false);

  const [calonLulus, setCalonLulus] = useState([]);
  const [lulusan, setLulusan] = useState([]);
  
  const [loadingCalon, setLoadingCalon] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modals
  const [showModal, setShowModal] = useState(false);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editRiwayatData, setEditRiwayatData] = useState(null);

  const [filterTop, setFilterTop] = useState({ search: '', jurusan: 'Semua Jurusan' });
  const [filterBottom, setFilterBottom] = useState({ search: '', jurusan: 'Semua Jurusan', tahun: 'Semua Tahun' });

  const [jurusanOptions, setJurusanOptions] = useState(['Semua Jurusan']); 
  const [tahunOptions, setTahunOptions] = useState(['Semua Tahun']);
  const [masterJurusan, setMasterJurusan] = useState([]);

  // ==========================================
  // HELPER PENGURAI ARRAY
  // ==========================================
  const extractDataArray = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data?.data?.data)) return response.data.data.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  // ==========================================
  // 1. FETCH DATA
  // ==========================================
  
  const fetchFilters = async () => {
    try {
      const res = await adminApi.getKelulusanFilters();
      const data = extractDataArray(res);
      
      if (data.tahun && data.tahun.length > 0) {
        const mappedTahun = data.tahun.map(t => typeof t === 'string' ? t : (t.tahun_lulus || t.tahun || String(t)));
        const uniqueTahun = [...new Set(mappedTahun.filter(Boolean))];
        setTahunOptions(['Semua Tahun', ...uniqueTahun]);
      }
    } catch (err) {
      console.error("Gagal memuat filter tahun", err);
    }
  };

  const fetchMasterJurusan = async () => {
    try {
      const res = await adminApi.getJurusan();
      const data = extractDataArray(res);
      
      const formattedForModal = data.map(j => ({
        value: j.id || j.id_jurusan,
        label: j.nama_jurusan || j.nama || j.jurusan
      }));
      setMasterJurusan(formattedForModal);

      const formattedForFilter = data.map(j => j.nama_jurusan || j.nama || j.jurusan);
      const uniqueJurusan = [...new Set(formattedForFilter.filter(Boolean))];
      setJurusanOptions(['Semua Jurusan', ...uniqueJurusan]);

    } catch (err) {
      console.error("Gagal memuat master jurusan", err);
    }
  };

  const fetchCalon = async () => {
    setLoadingCalon(true);
    try {
      const params = {};
      if (filterTop.search) params.search = filterTop.search;
      if (filterTop.jurusan !== 'Semua Jurusan') params.jurusan = filterTop.jurusan;

      const res = await adminApi.getCalonLulusan(params);
      setCalonLulus(extractDataArray(res));
    } catch (err) {
      console.error("Gagal memuat calon lulusan", err);
      setCalonLulus([]); 
    } finally {
      setLoadingCalon(false);
    }
  };

  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const params = {};
      if (filterBottom.search) params.search = filterBottom.search;
      if (filterBottom.jurusan !== 'Semua Jurusan') params.jurusan = filterBottom.jurusan;
      if (filterBottom.tahun !== 'Semua Tahun') params.tahun = filterBottom.tahun;

      const res = await adminApi.getRiwayatKelulusan(params);
      setLulusan(extractDataArray(res));
    } catch (err) {
      console.error("Gagal memuat riwayat", err);
      setLulusan([]); 
    } finally {
      setLoadingRiwayat(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchFilters(), fetchMasterJurusan()]);
      setIsPageReady(true); 
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'proses' && isPageReady) {
      const timer = setTimeout(() => fetchCalon(), 500);
      return () => clearTimeout(timer);
    }
  }, [filterTop, activeTab, isPageReady]);

  useEffect(() => {
    if (activeTab === 'riwayat' && isPageReady) {
      const timer = setTimeout(() => fetchRiwayat(), 500);
      return () => clearTimeout(timer);
    }
  }, [filterBottom, activeTab, isPageReady]);


  // ==========================================
  // 2. HANDLER ACTIONS
  // ==========================================
  
  const handleTambahManualSubmit = async (payload, onSuccessCallback) => {
    try {
      setIsSubmitting(true);
      await adminApi.addCalonLulusan(payload);
      await fetchCalon();
      alertSuccess("Berhasil menambahkan data calon lulusan!");
      onSuccessCallback(); 
      setShowModal(false); 
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menambahkan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRiwayatClick = (item) => {
    setEditRiwayatData(item);
    setShowEditStatusModal(true);
  };

  const handleUpdateRiwayatStatus = async (status) => {
    try {
      setIsSubmitting(true);
      await adminApi.updateRiwayatKelulusan(editRiwayatData.id_kelulusan || editRiwayatData.id, status);
      alertSuccess("Berhasil memperbarui status kelulusan!");
      setShowEditStatusModal(false);
      fetchRiwayat();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRiwayat = async (id) => {
    const isConfirm = await alertConfirm("Yakin ingin menghapus?", "Data riwayat kelulusan siswa ini akan dihapus permanen.");
    if (!isConfirm) return;

    try {
      await adminApi.deleteRiwayatKelulusan(id);
      alertSuccess("Berhasil menghapus data kelulusan!");
      fetchRiwayat();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {
      setIsSubmitting(true);
      await adminApi.importKelulusan(formDataFile);
      alertSuccess('Berhasil mengimpor data kelulusan!');
      fetchCalon();
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal mengimpor file.');
    } finally {
      setIsSubmitting(false);
      e.target.value = null;
    }
  };

  const handleDeleteCalon = async (id) => {
    const confirm = await alertConfirm("Apakah Anda yakin ingin menghapus data siswa ini dari daftar proses kelulusan?");
    if (!confirm.isConfirmed) return;

    try {
      await adminApi.deleteCalonLulusan(id);
      fetchCalon();
      alertSuccess('Data siswa berhasil dihapus dari daftar.');
    } catch (err) {
      alertError('Gagal menghapus calon lulusan.');
    }
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      await adminApi.updateCalonStatus(id, newStatus);
      fetchCalon();
      alertSuccess('Status kelulusan berhasil diperbarui!');
    } catch (err) {
      alertError('Gagal mengubah status kelulusan.');
    }
  };

  const handleClearStaging = async () => {
    const confirm = await alertConfirm("Apakah Anda yakin ingin membatalkan semua proses dan mengosongkan tabel?");
    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await adminApi.clearCalonLulusan();
      alertSuccess('Berhasil membatalkan proses!');
      fetchCalon();
    } catch (err) {
      alertError('Gagal membatalkan proses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpanKelulusan = async () => {
    if (calonLulus.length === 0) return;
    
    const confirm = await alertConfirm("Apakah Anda yakin data ini sudah benar? Siswa dalam daftar ini akan resmi ditetapkan sebagai alumni yang lulus.");
    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await adminApi.simpanKelulusan();
      alertSuccess('Berhasil menetapkan kelulusan siswa!');
      fetchCalon();    
      setActiveTab('riwayat'); // Kembali ke tab riwayat
    } catch (err) {
      alertError(err.response?.data?.message || 'Gagal memproses kelulusan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (filterBottom.search) params.search = filterBottom.search;
      if (filterBottom.jurusan !== 'Semua Jurusan') params.jurusan = filterBottom.jurusan;
      if (filterBottom.tahun !== 'Semua Tahun') params.tahun = filterBottom.tahun;

      const res = await adminApi.exportKelulusan(params);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Data_Kelulusan.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alertError('Gagal mengekspor data.');
    }
  };

  // ==========================================
  // 3. UI COMPONENTS
  // ==========================================
  
  if (!isPageReady) {
      return <KelulusanSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header & Tabs */}
      <div>
        <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center cursor-pointer gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'riwayat' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <History size={18} />
            <span>Data Lulusan</span>
          </button>
          <button 
            onClick={() => setActiveTab('proses')}
            className={`flex items-center cursor-pointer gap-2 px-4 sm:px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'proses' 
                ? 'border-third text-third' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <GraduationCap size={18} />
            <span className="hidden sm:inline">Proses Kelulusan Baru</span>
            <span className="sm:hidden">Proses Baru</span>
          </button>
        </div>
      </div>

      {/* RENDER TAB COMPONENTS */}
      {activeTab === 'riwayat' && (
        <TabDataLulusan 
          filterBottom={filterBottom}
          setFilterBottom={setFilterBottom}
          tahunOptions={tahunOptions}
          jurusanOptions={jurusanOptions}
          handleExportExcel={handleExportExcel}
          loadingRiwayat={loadingRiwayat}
          lulusan={lulusan}
          onEdit={handleEditRiwayatClick}
          onDelete={handleDeleteRiwayat}
        />
      )}

      {activeTab === 'proses' && (
        <TabProsesKelulusan 
          setShowModal={setShowModal}
          isSubmitting={isSubmitting}
          fileInputRef={fileInputRef}
          handleImportExcel={handleImportExcel}
          calonLulus={calonLulus}
          handleClearStaging={handleClearStaging}
          handleSimpanKelulusan={handleSimpanKelulusan}
          loadingCalon={loadingCalon}
          handleToggleStatus={handleToggleStatus}
          handleDeleteCalon={handleDeleteCalon}
        />
      )}

      {/* MODAL TAMBAH MANUAL */}
      <ModalTambahManual 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleTambahManualSubmit}
        isSubmitting={isSubmitting}
        jurusanOptions={masterJurusan} 
      />

      {/* MODAL EDIT STATUS KELULUSAN */}
      <ModalEditStatusKelulusan
        isOpen={showEditStatusModal}
        onClose={() => setShowEditStatusModal(false)}
        onSubmit={handleUpdateRiwayatStatus}
        isSubmitting={isSubmitting}
        editData={editRiwayatData}
      />

    </div>
  );
}