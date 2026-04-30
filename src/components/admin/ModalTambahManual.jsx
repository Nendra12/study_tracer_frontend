import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import SmoothDropdown from './SmoothDropdown'; // Pastikan path ini benar relatif terhadap komponen ini

export default function ModalTambahManual({ isOpen, onClose, onSubmit, isSubmitting, jurusanOptions }) {
  const [formData, setFormData] = useState({ nisn: '', nama: '', jurusan: 'Semua Jurusan' });

  // Jangan render apa-apa jika modal tidak dibuka
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, () => {
      // Callback: jika sukses, reset form
      setFormData({ nisn: '', nama: '', jurusan: 'Semua Jurusan' });
    });
  };

  // Hilangkan opsi "Semua Jurusan" agar admin tidak bisa memilihnya sebagai jurusan asli siswa
  const validJurusanOptions = jurusanOptions.filter(j => j !== 'Semua Jurusan');

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* PERBAIKAN: overflow-hidden diubah menjadi overflow-visible agar dropdown bisa keluar dari card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-visible animate-in zoom-in-95 duration-200">
        
        {/* PERBAIKAN: Ditambahkan rounded-t-2xl agar sudut atas tetap melengkung walau overflow visible */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-primary">Tambah Data Manual</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Modal */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Input NISN */}
          <div>
            <label className="block text-xs font-black text-primary uppercase tracking-wider mb-2">
              NISN
            </label>
            <input 
              type="text" 
              required
              value={formData.nisn}
              onChange={(e) => setFormData({...formData, nisn: e.target.value})}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Masukkan NISN siswa"
            />
          </div>

          {/* Input Nama */}
          <div>
            <label className="block text-xs font-black text-primary uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <input 
              type="text" 
              required
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Masukkan nama lengkap siswa"
            />
          </div>

          {/* Input Jurusan (SmoothDropdown) */}
          <div className="relative z-50"> {/* Ditambahkan z-50 dan relative untuk angkat layer dropdown */}
            <label className="block text-xs font-black text-primary uppercase tracking-wider mb-2">
              Jurusan
            </label>
            
            {/* Wrapper SmoothDropdown agar tingginya proporsional dengan input text */}
            <div className="w-full [&>div]:!w-full [&_button]:!h-[42px] [&_button]:!min-h-[42px] [&_button]:!py-0 [&_button]:!border-slate-200 [&_button]:!bg-white [&_button]:!rounded-xl [&_button_span]:!font-medium [&_button_span]:!text-slate-700">
              <SmoothDropdown
                options={validJurusanOptions}
                value={formData.jurusan === 'Semua Jurusan' ? 'Pilih Jurusan' : formData.jurusan}
                onSelect={(val) => setFormData({...formData, jurusan: val})}
              />
            </div>
          </div>

          {/* Action Modal */}
          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || formData.jurusan === 'Semua Jurusan' || formData.jurusan === 'Pilih Jurusan'}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan Data
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}