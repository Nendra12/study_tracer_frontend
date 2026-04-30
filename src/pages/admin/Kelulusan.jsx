import React, { useState, useEffect, useRef } from 'react';
import { Save, Trash2, Search, ChevronLeft, History, GraduationCap, Upload, Download, Loader2, XCircle, Plus } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown'; 
import ModalTambahManual from '../../components/admin/ModalTambahManual'; 
import { adminApi } from '../../api/admin'; 
import { alertSuccess, alertError, alertConfirm } from '../../utilitis/alert'; 

export default function Kelulusan() {
  const fileInputRef = useRef(null);

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
  
  // Mengambil data Tahun Lulus dari history filter
  const fetchFilters = async () => {
    try {
      const res = await adminApi.getKelulusanFilters();
      const data = extractDataArray(res);
      
      // Load data Tahun untuk Filter (Format String)
      if (data.tahun && data.tahun.length > 0) {
        const mappedTahun = data.tahun.map(t => typeof t === 'string' ? t : (t.tahun_lulus || t.tahun || String(t)));
        const uniqueTahun = [...new Set(mappedTahun.filter(Boolean))];
        setTahunOptions(['Semua Tahun', ...uniqueTahun]);
      }
    } catch (err) {
      console.error("Gagal memuat filter tahun", err);
    }
  };

  // Mengambil Jurusan langsung dari Database Master (API getJurusan)
  const fetchMasterJurusan = async () => {
    try {
      const res = await adminApi.getJurusan();
      const data = extractDataArray(res);
      
      // 1. Siapkan format {value, label} untuk Modal Tambah Data (Butuh ID)
      const formattedForModal = data.map(j => ({
        value: j.id || j.id_jurusan,
        label: j.nama_jurusan || j.nama || j.jurusan
      }));
      setMasterJurusan(formattedForModal);

      // 2. Siapkan format String Murni untuk Filter SmoothDropdown
      const formattedForFilter = data.map(j => j.nama_jurusan || j.nama || j.jurusan);
      const uniqueJurusan = [...new Set(formattedForFilter.filter(Boolean))]; // Hapus duplikat/kosong
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
    const timer = setTimeout(() => fetchCalon(), 500);
    return () => clearTimeout(timer);
  }, [filterTop]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRiwayat(), 500);
    return () => clearTimeout(timer);
  }, [filterBottom]);


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

  const handleClearStaging = async () => {
    const confirm = await alertConfirm("Apakah Anda yakin ingin mengosongkan semua data calon lulusan?");
    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await adminApi.clearCalonLulusan();
      alertSuccess('Berhasil mengosongkan data!');
      fetchCalon();
    } catch (err) {
      alertError('Gagal mengosongkan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpanKelulusan = async () => {
    if (calonLulus.length === 0) return;
    
    const confirm = await alertConfirm("Apakah Anda yakin ingin menetapkan status kelulusan untuk siswa ini?");
    if (!confirm.isConfirmed) return;

    try {
      setIsSubmitting(true);
      await adminApi.simpanKelulusan();
      alertSuccess('Berhasil memproses kelulusan!');
      fetchCalon();    
      fetchRiwayat();  
      fetchFilters();  
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
  // 3. UI COMPONENTS & CSS
  // ==========================================
  const searchInputClass = "w-full pl-10 pr-4 h-[42px] bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const dropdownWrapperClass = "w-full sm:w-auto [&>div]:!w-full sm:[&>div]:!w-auto sm:[&>div]:!min-w-[180px] [&_button]:!h-[42px] [&_button]:!min-h-[42px] [&_button]:!py-0 [&_button]:!border-slate-200 [&_button]:!bg-white [&_button]:!rounded-xl [&_button_span]:!font-medium [&_button_span]:!text-slate-700 [&_button_span]:!whitespace-nowrap [&_ul]:!min-w-[180px] [&_li]:!whitespace-nowrap";

  return (
    <div className="space-y-8 pb-12 relative">
      
      {/* TABEL 1: DATA CALON LULUSAN TAHUN INI */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-5 rounded-t-2xl relative z-20">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">Data Calon Lulusan Tahun Ini</h3>
              <p className="text-xs text-slate-500 mt-1">Total: <span className="font-bold text-primary">{calonLulus.length}</span> siswa siap diproses</p>
            </div>
          </div>
          
          <div className="flex flex-col xl:flex-row flex-wrap xl:flex-nowrap items-center gap-3 w-full relative z-[60]">
            
            <div className="relative w-full xl:flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Nama/NISN..." 
                value={filterTop.search}
                onChange={(e) => setFilterTop({...filterTop, search: e.target.value})}
                className={searchInputClass}
              />
            </div>

            {/* FILTER KEMBALI MENGGUNAKAN SMOOTH DROPDOWN UNTUK TAMPILAN BERSIH */}
            {/* Datanya diambil dari database via jurusanOptions (Array String) */}
            <div className={`relative z-[60] ${dropdownWrapperClass}`}>
              <SmoothDropdown
                options={jurusanOptions}
                value={filterTop.jurusan}
                onSelect={(val) => setFilterTop({...filterTop, jurusan: val})}
              />
            </div>

            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImportExcel} 
            />

            {calonLulus.length > 0 && (
              <button
                onClick={handleClearStaging}
                disabled={isSubmitting}
                className="w-full sm:w-auto whitespace-nowrap h-[42px] px-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                title="Hapus semua data di tabel ini"
              >
                <XCircle size={16} /> Batal
              </button>
            )}

            <button
              onClick={() => setShowModal(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto whitespace-nowrap h-[42px] px-5 rounded-xl border border-primary bg-primary/5 text-primary font-bold text-sm hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={16} /> Tambah Data
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isSubmitting}
              className="w-full sm:w-auto whitespace-nowrap h-[42px] px-5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin text-primary" /> : <Upload size={16} className="text-primary" />} 
              Import Excel
            </button>

            <button
              onClick={handleSimpanKelulusan}
              disabled={calonLulus.length === 0 || isSubmitting}
              className="w-full sm:w-auto whitespace-nowrap h-[42px] px-5 rounded-xl bg-third text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              Simpan Kelulusan
            </button>

          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-b-2xl overflow-hidden relative z-10">
          <div className="flex flex-col min-w-[600px]">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-[11px] text-slate-500 uppercase tracking-wider">
              <div className="col-span-1 text-center">No</div>
              <div className="col-span-3">NISN</div>
              <div className="col-span-4">Nama Siswa</div>
              <div className="col-span-3">Jurusan</div>
              <div className="col-span-1 text-center">Aksi</div>
            </div>
            
            <div className="divide-y divide-slate-100 bg-white">
              {loadingCalon ? (
                <div className="py-16 flex flex-col items-center justify-center text-sm text-slate-400 font-medium bg-slate-50/20">
                  <Loader2 size={24} className="animate-spin text-primary mb-2" /> Memuat data...
                </div>
              ) : calonLulus.length === 0 ? (
                 <div className="py-16 flex flex-col items-center justify-center text-sm text-slate-400 font-medium bg-slate-50/20">
                   <span className="mb-2">Belum ada data calon lulusan.</span>
                   <span className="text-xs">Klik tombol <b className="text-primary">Tambah Data</b> atau <b className="text-primary">Import Excel</b> di atas.</span>
                 </div>
              ) : (
                calonLulus.map((item, index) => (
                  <div key={item.id} className="relative group overflow-hidden bg-red-50">
                    <button 
                      onClick={() => handleDeleteCalon(item.id)}
                      className="absolute right-0 top-0 bottom-0 w-20 flex flex-col items-center justify-center bg-red-500 text-white cursor-pointer hover:bg-red-600 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={20} />
                      <span className="text-[10px] font-bold mt-1">HAPUS</span>
                    </button>
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white relative z-10 transition-transform duration-300 group-hover:-translate-x-20 items-center hover:bg-slate-50/50 cursor-pointer">
                      <div className="col-span-1 text-center text-sm font-medium text-slate-400">{index + 1}</div>
                      <div className="col-span-3 text-sm font-bold text-primary">{item.nisn}</div>
                      <div className="col-span-4 text-sm font-semibold text-slate-700">{item.nama}</div>
                      <div className="col-span-3 text-xs font-bold">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan || '-'}</span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 group-hover:opacity-0 transition-opacity">
                          <ChevronLeft size={14} /> Geser
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABEL 2: RIWAYAT LULUSAN FIX */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-5 rounded-t-2xl relative z-20">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">Tabel Riwayat Kelulusan</h3>
              <p className="text-xs text-slate-500 mt-1">Daftar siswa yang sudah resmi ditetapkan lulus.</p>
            </div>
          </div>
          
          <div className="flex flex-col xl:flex-row flex-wrap xl:flex-nowrap items-center gap-3 w-full relative z-[60]">
            
            <div className="relative w-full xl:flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Nama/NISN..." 
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
              className="w-full sm:w-auto whitespace-nowrap h-[42px] px-5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={16} /> Export Data
            </button>

          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-b-2xl overflow-hidden relative z-10">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">No</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">NISN</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jurusan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Tahun Lulus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingRiwayat ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-sm text-slate-400">
                    <Loader2 size={24} className="animate-spin text-emerald-500 mx-auto mb-2" /> Memuat riwayat...
                  </td>
                </tr>
              ) : lulusan.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-sm text-slate-400">Tidak ada riwayat kelulusan yang cocok.</td>
                </tr>
              ) : (
                lulusan.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-primary font-bold">{item.nisn}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.nama}</td>
                    <td className="px-6 py-4 text-xs font-bold">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600">
                      {item.tahun_lulus || item.tahunLulus || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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