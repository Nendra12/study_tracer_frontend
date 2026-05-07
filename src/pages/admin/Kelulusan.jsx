import React, { useState, useEffect, useRef } from 'react';
import { Save, Trash2, Search, History, GraduationCap, Upload, Download, Loader2, Plus, Info, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown'; 
import ModalTambahManual from '../../components/admin/ModalTambahManual'; 
import { adminApi } from '../../api/admin'; 
import { alertSuccess, alertError, alertConfirm } from '../../utilitis/alert'; 
import KelulusanSkeleton from '../../components/admin/skeleton/KelulusanSkeleton';

export default function Kelulusan() {
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('riwayat'); // 'riwayat' | 'proses'

  const [calonLulus, setCalonLulus] = useState([]);
  const [lulusan, setLulusan] = useState([]);
  
  const [loadingCalon, setLoadingCalon] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false); 

  const [filterTop, setFilterTop] = useState({ search: '', jurusan: 'Semua Jurusan' });
  const [filterBottom, setFilterBottom] = useState({ search: '', jurusan: 'Semua Jurusan', tahun: 'Semua Tahun' });

  // Options KHUSUS Filter Tabel (Format String biasa agar SmoothDropdown tampil bersih)
  const [jurusanOptions, setJurusanOptions] = useState(['Semua Jurusan']); 
  const [tahunOptions, setTahunOptions] = useState(['Semua Tahun']);

  // Options KHUSUS form Modal Tambah (Format Object {value, label} agar backend mendapat ID)
  const [masterJurusan, setMasterJurusan] = useState([]);

  // ==========================================
  // HELPER PENGURAI ARRAY (ANTI CRASH PAGINATION)
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
    fetchFilters();
    fetchMasterJurusan();
  }, []);

  useEffect(() => {
    if (activeTab === 'proses') {
      const timer = setTimeout(() => fetchCalon(), 500);
      return () => clearTimeout(timer);
    }
  }, [filterTop, activeTab]);

  useEffect(() => {
    if (activeTab === 'riwayat') {
      const timer = setTimeout(() => fetchRiwayat(), 500);
      return () => clearTimeout(timer);
    }
  }, [filterBottom, activeTab]);


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
    try {
      await adminApi.deleteCalonLulusan(id);
      fetchCalon();
    } catch (err) {
      alertError('Gagal menghapus calon lulusan.');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'lulus' ? 'tidak_lulus' : 'lulus';
    try {
      await adminApi.updateCalonStatus(id, newStatus);
      fetchCalon();
    } catch (err) {
      alertError('Gagal mengubah status.');
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
  const searchInputClass = "w-full pl-10 pr-4 h-[42px] bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const dropdownWrapperClass = "w-full md:w-auto [&>div]:!w-full md:[&>div]:!w-auto md:[&>div]:!min-w-[180px] [&_button]:!h-[42px] [&_button]:!min-h-[42px] [&_button]:!py-0 [&_button]:!border-slate-200 [&_button]:!bg-white [&_button]:!rounded-xl [&_button_span]:!font-medium [&_button_span]:!text-slate-700 [&_button_span]:!whitespace-nowrap [&_ul]:!min-w-[180px] [&_li]:!whitespace-nowrap";
  
  const isInitialLoading = masterJurusan.length === 0 && (loadingRiwayat || loadingCalon);

  if (isInitialLoading) {
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

      {/* TAB 1: RIWAYAT KELULUSAN */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row flex-wrap md:flex-nowrap items-stretch md:items-center gap-3 rounded-t-2xl relative z-20">
            <div className="relative w-full md:flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Nama atau NISN..." 
                value={filterBottom.search}
                onChange={(e) => setFilterBottom({...filterBottom, search: e.target.value})}
                className={searchInputClass}
              />
            </div>
            <div className={`relative z-[60] ${dropdownWrapperClass}`}>
               <SmoothDropdown
                options={tahunOptions}
                value={filterBottom.tahun}
                onSelect={(val) => setFilterBottom({...filterBottom, tahun: val})}
              />
            </div>
            <div className={`relative z-[50] ${dropdownWrapperClass}`}>
              <SmoothDropdown
                options={jurusanOptions}
                value={filterBottom.jurusan}
                onSelect={(val) => setFilterBottom({...filterBottom, jurusan: val})}
              />
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full md:w-auto whitespace-nowrap h-[42px] px-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download size={16} /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">No</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">NISN</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jurusan</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Tahun Lulus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingRiwayat ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-sm text-slate-400"></td>
                  </tr>
                ) : lulusan.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-sm text-slate-400">Tidak ada data kelulusan yang ditemukan.</td>
                  </tr>
                ) : (
                  lulusan.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400 font-medium text-center">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-bold">{item.nisn}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">{item.nama}</td>
                      <td className="px-6 py-4 text-xs font-bold">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(item.status_kelulusan || 'lulus') === 'lulus' ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-bold">Lulus</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs font-bold">Tidak Lulus</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                        {item.tahun_lulus || item.tahunLulus || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROSES KELULUSAN BARU */}
      {activeTab === 'proses' && (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Instruksi Card */}
          <div className="bg-third/10 border border-third/20 p-5 rounded-2xl flex gap-4 items-start">
            <div className="p-2 bg-third/20 text-third rounded-xl shrink-0 mt-0.5">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-bold text-third mb-1">Alur Penetapan Kelulusan</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                1. Masukkan data siswa yang akan diluluskan menggunakan tombol <b>Tambah Manual</b> atau <b>Import Excel</b>.<br/>
                2. Periksa kembali daftar siswa di bawah ini. Hapus jika ada kesalahan.<br/>
                3. Klik tombol <b>Simpan & Tetapkan Kelulusan</b> untuk meresmikan kelulusan mereka.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowModal(true)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Plus size={14} /> Tambah Manual
                </button>
                <input type="file" accept=".xlsx, .xls, .csv" ref={fileInputRef} className="hidden" onChange={handleImportExcel} />
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} 
                  Import Excel
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-2xl relative z-20">
              <div>
                <h3 className="text-base font-bold text-slate-800">Daftar Calon Lulusan</h3>
                <p className="text-xs text-slate-500 mt-1">Total: <span className="font-bold text-third">{calonLulus.length}</span> siswa siap diproses</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                {calonLulus.length > 0 && (
                  <button
                    onClick={handleClearStaging}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-10 px-4 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors cursor-pointer text-center"
                  >
                    Batal
                  </button>
                )}
                <button
                  onClick={handleSimpanKelulusan}
                  disabled={calonLulus.length === 0 || isSubmitting}
                  className="w-full sm:w-auto h-10 px-5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                  Simpan & Tetapkan Kelulusan
                </button>
              </div>
            </div>

            <div className="overflow-x-auto relative z-10 min-h-[300px]">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">No</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">NISN</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jurusan</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCalon ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-sm text-slate-400"></td>
                    </tr>
                  ) : calonLulus.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-sm text-slate-400">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                            <GraduationCap size={28} className="text-slate-300" />
                          </div>
                          <span className="font-medium text-slate-500 mb-1">Daftar masih kosong</span>
                          <span className="text-xs">Gunakan tombol Tambah Manual atau Import Excel di atas.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    calonLulus.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-3 text-sm text-slate-400 font-medium text-center">{index + 1}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 font-bold">{item.nisn}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-slate-800">{item.nama}</td>
                        <td className="px-6 py-3 text-xs font-bold">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan || '-'}</span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <select
                            value={item.status_kelulusan || 'lulus'}
                            className={`px-2 py-1 outline-none text-xs font-bold rounded-md border cursor-pointer ${
                              (item.status_kelulusan || 'lulus') === 'lulus'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              // Call the API directly instead of using handleToggleStatus which toggles based on current
                              adminApi.updateCalonStatus(item.id, newStatus).then(() => {
                                fetchCalon();
                              }).catch(() => {
                                alertError('Gagal mengubah status.');
                              });
                            }}
                          >
                            <option value="lulus">Lulus</option>
                            <option value="tidak_lulus">Tidak Lulus</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button 
                            onClick={() => handleDeleteCalon(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center"
                            title="Hapus baris ini"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <ModalTambahManual 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleTambahManualSubmit}
        isSubmitting={isSubmitting}
        jurusanOptions={masterJurusan} 
      />

    </div>
  );
}