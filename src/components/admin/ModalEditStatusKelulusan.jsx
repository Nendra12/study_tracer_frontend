import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, UserCircle2 } from 'lucide-react';

export default function ModalEditStatusKelulusan({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  editData 
}) {
  const [status, setStatus] = useState('lulus');

  // Populate data when modal opens
  useEffect(() => {
    if (isOpen && editData) {
      setStatus(editData.status_kelulusan || 'lulus');
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(status);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-slate-800">Ubah Status Kelulusan</h2>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Siswa */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <UserCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{editData?.nama || 'Siswa'}</p>
            <p className="text-xs font-medium text-slate-500">NISN: {editData?.nisn || '-'}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
              {editData?.jurusan || editData?.jurusan?.nama_jurusan || '-'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Status Kelulusan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
              >
                <option value="lulus">Lulus</option>
                <option value="tidak_lulus">Tidak Lulus</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
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
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-[#2e4042] text-white text-sm font-bold rounded-xl transition-all cursor-pointer disabled:opacity-70"
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
    </div>
  );
}
