import React from 'react';
import { Info, Plus, FileSpreadsheet, Loader2, CheckCircle2, GraduationCap, Trash2 } from 'lucide-react';

export default function TabProsesKelulusan({
  setShowModal,
  isSubmitting,
  fileInputRef,
  handleImportExcel,
  calonLulus,
  handleClearStaging,
  handleSimpanKelulusan,
  loadingCalon,
  handleToggleStatus,
  handleDeleteCalon
}) {
  return (
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
                  <td colSpan="6" className="text-center py-12 text-sm text-slate-400">
                    <Loader2 size={24} className="animate-spin text-third mx-auto mb-2" /> Memuat data...
                  </td>
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
                        onChange={(e) => handleToggleStatus(item.id, e.target.value)}
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
  );
}