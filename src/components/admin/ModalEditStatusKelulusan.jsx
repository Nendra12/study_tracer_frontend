import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, UserCircle2 } from 'lucide-react';
import SmoothDropdown from './SmoothDropdown'; // Pastikan path import ini sesuai

export default function ModalEditStatusKelulusan({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  editData 
}) {
  // Gunakan format label (huruf besar) untuk ditampilkan di SmoothDropdown
  const [statusDisplay, setStatusDisplay] = useState('Lulus');

  // Mengisi data awal dan mengunci scroll saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (editData) {
        // Konversi dari format database ('lulus'/'tidak_lulus') ke format label Dropdown
        setStatusDisplay(editData.status_kelulusan === 'tidak_lulus' ? 'Tidak Lulus' : 'Lulus');
      }
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Konversi kembali dari label Dropdown ke format database
    const payloadStatus = statusDisplay === 'Tidak Lulus' ? 'tidak_lulus' : 'lulus';
    onSubmit(payloadStatus);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur animate-in fade-in duration-200"
      onClick={!isSubmitting ? onClose : undefined}
    >
      {/* Modal Box */}
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-[0_0_40px_-15px_rgba(0,0,0,0.2)] border border-slate-100 overflow-visible animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat area dalam diklik
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <h2 className="text-lg font-black text-slate-800">Ubah Status Kelulusan</h2>
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Siswa */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <UserCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{editData?.nama || 'Siswa'}</p>
            <p className="text-xs font-medium text-slate-500 mt-0.5">NISN: {editData?.nisn || '-'}</p>
            <span className="inline-block mt-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded-md shadow-sm">
              {editData?.jurusan || editData?.jurusan?.nama_jurusan || '-'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="p-6 space-y-5">
            <div className="relative z-50">
              <label className="block text-[11px] font-black text-primary uppercase tracking-wider mb-2">
                Status Kelulusan
              </label>
              
              {/* Menggunakan Smooth Dropdown */}
              <SmoothDropdown
                options={["Lulus", "Tidak Lulus"]}
                value={statusDisplay}
                onSelect={(val) => setStatusDisplay(val)}
                disabled={isSubmitting}
              />

            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end rounded-b-2xl mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/80 text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
              ) : (
                <><Save size={16} /> Simpan Perubahan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}