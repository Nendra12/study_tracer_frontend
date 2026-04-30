import React, { useState, useMemo, useRef } from 'react';
import { Save, Trash2, Search, ChevronLeft, History, GraduationCap, Upload, Download } from 'lucide-react';
import SmoothDropdown from '../../components/admin/SmoothDropdown'; // Pastikan path ini benar!

export default function Kelulusan() {
  // === REFERENSI UNTUK INPUT FILE EXCEL ===
  const fileInputRef = useRef(null);

  // === STATE DATA (FULL DUMMY UNTUK TESTING) ===
  const [calonLulus, setCalonLulus] = useState([
    { id: 'new1', nisn: '0066778899', nama: 'Dimas Anggara', jurusan: 'TKJ' },
    { id: 'new2', nisn: '0077889900', nama: 'Rina Nose', jurusan: 'AKL' },
    { id: 'new3', nisn: '0088990011', nama: 'Kevin Julio', jurusan: 'RPL' },
    { id: 'new4', nisn: '0099001122', nama: 'Syifa Hadju', jurusan: 'TBSM' },
  ]);
  
  const [lulusan, setLulusan] = useState([
    { id: 'old1', nisn: '0011223344', nama: 'Budi Santoso', jurusan: 'RPL', tahunLulus: '2023' },
    { id: 'old2', nisn: '0022334455', nama: 'Siti Aminah', jurusan: 'TBSM', tahunLulus: '2022' },
    { id: 'old3', nisn: '0033445566', nama: 'Ahmad Fauzi', jurusan: 'TKJ', tahunLulus: '2023' },
    { id: 'old4', nisn: '0044556677', nama: 'Dewi Lestari', jurusan: 'AKL', tahunLulus: '2021' },
    { id: 'old5', nisn: '0055667788', nama: 'Rizky Pratama', jurusan: 'RPL', tahunLulus: '2022' },
  ]);

  // === STATE FILTER ===
  const [filterTop, setFilterTop] = useState({ search: '', jurusan: 'Semua Jurusan' });
  const [filterBottom, setFilterBottom] = useState({ search: '', jurusan: 'Semua Jurusan', tahun: 'Semua Tahun' });

  const jurusanOptions = ['Semua Jurusan', 'RPL', 'TKJ', 'TBSM', 'AKL', 'OTKP'];
  const tahunOptions = ['Semua Tahun', '2026', '2025', '2024', '2023', '2022', '2021'];

  // === FUNGSI: MENGUNGGAH & MEMBACA EXCEL (SIMULASI) ===
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simulasi jeda baca file
    setTimeout(() => {
      alert(`Berhasil membaca file: ${file.name}. Mengimpor 3 data dummy baru...`);
      
      const importedDummyData = [
        { id: Date.now() + 1, nisn: '0012345678', nama: 'Siswa Dari Excel 1', jurusan: 'TKJ' },
        { id: Date.now() + 2, nisn: '0012345679', nama: 'Siswa Dari Excel 2', jurusan: 'RPL' },
        { id: Date.now() + 3, nisn: '0012345680', nama: 'Siswa Dari Excel 3', jurusan: 'AKL' },
      ];
      
      setCalonLulus(prev => [...importedDummyData, ...prev]);
    }, 500);

    // Reset input agar file yang sama bisa di-upload ulang nanti
    e.target.value = null;
  };

  // === FUNGSI: MENDOWNLOAD EXCEL (SIMULASI) ===
  const handleExportExcel = () => {
    if (lulusan.length === 0) return alert("Tidak ada data untuk diexport!");
    alert(`(Simulasi) File Data_Riwayat_Lulusan.xlsx berhasil didownload! Berisi ${lulusan.length} baris data.`);
  };

  // === FUNGSI: HAPUS DATA TABEL ATAS ===
  const handleDeleteCalon = (idToRemove) => {
    setCalonLulus(calonLulus.filter(item => item.id !== idToRemove));
  };

  // === FUNGSI: SIMPAN & PINDAHKAN KE TABEL BAWAH ===
  const handleSimpanKelulusan = () => {
    if (calonLulus.length === 0) return;

    const tahunSekarang = new Date().getFullYear().toString();
    
    // Tambahkan field tahunLulus ke semua calon
    const dataSiapLulus = calonLulus.map(item => ({
      ...item,
      tahunLulus: tahunSekarang
    }));

    // Masukkan ke tabel bawah, kosongkan tabel atas
    setLulusan(prev => [...dataSiapLulus, ...prev]);
    setCalonLulus([]);
    alert(`(DUMMY) Berhasil menetapkan kelulusan untuk ${dataSiapLulus.length} siswa pada tahun ${tahunSekarang}!`);
  };

  // === FILTERING LOGIC ===
  const filteredCalon = useMemo(() => {
    return calonLulus.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(filterTop.search.toLowerCase()) || item.nisn.includes(filterTop.search);
      const matchJurusan = filterTop.jurusan !== 'Semua Jurusan' ? item.jurusan === filterTop.jurusan : true;
      return matchSearch && matchJurusan;
    });
  }, [calonLulus, filterTop]);

  const filteredLulusan = useMemo(() => {
    return lulusan.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(filterBottom.search.toLowerCase()) || item.nisn.includes(filterBottom.search);
      const matchJurusan = filterBottom.jurusan !== 'Semua Jurusan' ? item.jurusan === filterBottom.jurusan : true;
      const matchTahun = filterBottom.tahun !== 'Semua Tahun' ? item.tahunLulus === filterBottom.tahun : true;
      return matchSearch && matchJurusan && matchTahun;
    });
  }, [lulusan, filterBottom]);

  // CSS Class Standar untuk Desain Filter
  const searchInputClass = "w-full pl-10 pr-4 h-[42px] bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const dropdownWrapperClass = "[&>div]:!min-w-[150px] [&_button]:!h-[42px] [&_button]:!min-h-[42px] [&_button]:!py-0 [&_button]:!border-slate-200 [&_button]:!bg-white [&_button]:!rounded-xl [&_button_span]:!font-medium [&_button_span]:!text-primary";

  return (
    <div className="space-y-8 pb-12">
      
      {/* =========================================
          TABEL 1: DATA CALON LULUSAN TAHUN INI 
      ========================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            
            {/* Header Kiri */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Data Calon Lulusan Tahun Ini</h3>
                <p className="text-xs text-slate-500 mt-1">Total: <span className="font-bold text-primary">{filteredCalon.length}</span> siswa siap diproses</p>
              </div>
            </div>
            
            {/* Area Filter & Aksi Kanan */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Filter Search */}
              <div className="relative w-full sm:w-[200px]">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari Nama/NISN..." 
                  value={filterTop.search}
                  onChange={(e) => setFilterTop({...filterTop, search: e.target.value})}
                  className={searchInputClass}
                />
              </div>

              {/* Filter Jurusan (SmoothDropdown) */}
              <div className={dropdownWrapperClass}>
                <SmoothDropdown
                  options={jurusanOptions}
                  value={filterTop.jurusan}
                  onSelect={(val) => setFilterTop({...filterTop, jurusan: val})}
                />
              </div>

              {/* Input File Tersembunyi */}
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImportExcel} 
              />

              {/* Tombol Import Excel */}
              <button
                onClick={() => fileInputRef.current.click()}
                className="w-full sm:w-auto h-[42px] px-5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer ml-auto xl:ml-2"
              >
                <Upload size={16} className="text-primary" /> Import Excel
              </button>

              {/* Tombol Simpan Fix */}
              <button
                onClick={handleSimpanKelulusan}
                disabled={calonLulus.length === 0}
                className="w-full sm:w-auto h-[42px] px-5 rounded-xl bg-third text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} /> Simpan Kelulusan
              </button>

            </div>
          </div>
        </div>

        {/* List Geser (Swipe to Delete) */}
        <div className="overflow-hidden min-h-[150px] bg-slate-50/20">
          {filteredCalon.length === 0 ? (
             <div className="text-center py-10 text-sm text-slate-400 font-medium flex flex-col items-center">
               <span className="mb-2">Semua data calon lulusan sudah diproses/kosong.</span>
               <span className="text-xs">Klik tombol <b className="text-primary">Import Excel</b> di atas untuk menambahkan siswa.</span>
             </div>
          ) : (
            <div className="flex flex-col min-w-[600px] overflow-x-auto">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                <div className="col-span-1 text-center">No</div>
                <div className="col-span-3">NISN</div>
                <div className="col-span-4">Nama Siswa</div>
                <div className="col-span-3">Jurusan</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredCalon.map((item, index) => (
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
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan}</span>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 group-hover:opacity-0 transition-opacity">
                          <ChevronLeft size={14} /> Geser
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          TABEL 2: RIWAYAT LULUSAN FIX
      ========================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            
            {/* Header Kiri */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Tabel Riwayat Kelulusan</h3>
                <p className="text-xs text-slate-500 mt-1">Daftar siswa yang sudah resmi ditetapkan lulus.</p>
              </div>
            </div>
            
            {/* Area Filter & Export Kanan */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Filter Search */}
              <div className="relative w-full sm:w-[200px]">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari Nama/NISN..." 
                  value={filterBottom.search}
                  onChange={(e) => setFilterBottom({...filterBottom, search: e.target.value})}
                  className={searchInputClass}
                />
              </div>

              {/* Filter Tahun (SmoothDropdown) */}
              <div className={dropdownWrapperClass}>
                 <SmoothDropdown
                  options={tahunOptions}
                  value={filterBottom.tahun}
                  onSelect={(val) => setFilterBottom({...filterBottom, tahun: val})}
                />
              </div>

              {/* Filter Jurusan (SmoothDropdown) */}
              <div className={dropdownWrapperClass}>
                <SmoothDropdown
                  options={jurusanOptions}
                  value={filterBottom.jurusan}
                  onSelect={(val) => setFilterBottom({...filterBottom, jurusan: val})}
                />
              </div>

              {/* Tombol Export Excel */}
              <button
                onClick={handleExportExcel}
                className="w-full sm:w-auto h-[42px] px-5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 cursor-pointer ml-auto xl:ml-2"
              >
                <Download size={16} /> Export Data
              </button>

            </div>
          </div>
        </div>

        {/* Tabel Standar */}
        <div className="overflow-x-auto">
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
              {filteredLulusan.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-sm text-slate-400">Tidak ada riwayat kelulusan yang cocok.</td>
                </tr>
              ) : (
                filteredLulusan.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium text-center">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-primary font-bold">{item.nisn}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{item.nama}</td>
                    <td className="px-6 py-4 text-xs font-bold">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">{item.jurusan}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-emerald-600">
                      {item.tahunLulus}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}