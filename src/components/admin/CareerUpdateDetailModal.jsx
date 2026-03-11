import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Loader2, Save } from 'lucide-react';

export default function CareerUpdateDetailModal({ 
  isOpen, 
  detail, 
  onClose, 
  onApprove, // Akan dipanggil saat Terima Semua atau Simpan Parsial
  onReject,  // Akan dipanggil saat Tolak Semua
  actionLoading 
}) {
  // State untuk menyimpan aksi per baris/field (misal: { 0: 'approve', 1: 'reject' })
  const [fieldActions, setFieldActions] = useState({});

  // Reset state jika modal dibuka/ditutup
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFieldActions({}); // Reset pilihan saat modal baru dibuka
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, detail]);

  if (!isOpen || !detail) return null;

  // Fungsi untuk handle klik ACC/Tolak per baris
  const handleSingleAction = (idx, action) => {
    setFieldActions(prev => ({
      ...prev,
      [idx]: prev[idx] === action ? null : action // Toggle pembatalan jika diklik 2x
    }));
  };

  // Cek apakah ada field yang dipilih secara individual
  const hasPartialSelection = Object.values(fieldActions).some(val => val !== null);

  // Handler saat tombol Simpan/Terima diklik
  const handleSave = () => {
    if (hasPartialSelection) {
      // Jika ada yang dipilih satu-satu, kita bisa mengirim data parsial ke parent
      // (Pastikan backend Anda mendukung persetujuan parsial jika menggunakan ini)
      onApprove(detail.id, fieldActions); 
    } else {
      // Jika tidak ada yang dipilih satu-satu, berarti "Terima Semua"
      onApprove(detail.id, 'all');
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
        />
        
        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-6 md:px-8 md:pt-8 md:pb-6 flex items-start justify-between bg-white relative z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Detail Pembaruan Karier</h2>
              <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
                <span className="text-slate-700">{detail.name}</span> • {detail.time}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body (Tabel Komparasi) */}
          <div className="px-6 md:px-8 pb-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            
            {/* Header Tabel (Grid Diubah Menjadi 12 Kolom dengan area Aksi) */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Jenis Perubahan</div>
              <div className="col-span-3">Data Sebelumnya</div>
              <div className="col-span-1 text-center"></div>
              <div className="col-span-3">Hasil Perubahan</div>
              <div className="col-span-2 text-center">Aksi</div> {/* Tambahan Kolom Aksi */}
            </div>

            {/* Isi Tabel */}
            <div className="flex flex-col gap-4 mt-4">
              {(detail.changes || []).map((change, idx) => {
                const status = fieldActions[idx];
                
                return (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-12 gap-4 items-center p-2 -mx-2 rounded-2xl transition-colors ${status === 'approve' ? 'bg-emerald-50/30' : status === 'reject' ? 'bg-red-50/30' : 'hover:bg-slate-50/50'}`}
                  >
                    {/* Jenis Perubahan */}
                    <div className="col-span-3">
                      <div className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center h-full">
                        {change.label}
                      </div>
                    </div>

                    {/* Data Sebelumnya */}
                    <div className="col-span-3">
                      <div className="px-4 py-3 bg-white border border-slate-100 text-slate-400 rounded-xl text-xs font-medium h-full flex items-center">
                        {change.old || '-'}
                      </div>
                    </div>

                    {/* Ikon Arah */}
                    <div className="col-span-1 flex justify-center text-slate-300">
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </div>

                    {/* Hasil Perubahan */}
                    <div className="col-span-3">
                      <div className="px-4 py-3 bg-emerald-50/50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold h-full flex items-center shadow-sm shadow-emerald-100/50">
                        {change.new || '-'}
                      </div>
                    </div>

                    {/* Tombol Aksi Individual (ACC Satu-satu) */}
                    <div className="col-span-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSingleAction(idx, 'reject')}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          status === 'reject' 
                            ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
                        }`}
                        title="Tolak perubahan ini"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => handleSingleAction(idx, 'approve')}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          status === 'approve' 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50'
                        }`}
                        title="Terima perubahan ini"
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Modal Footer (Action Buttons) */}
          <div className="p-6 md:px-8 md:py-6 bg-white flex items-center justify-between sm:justify-end gap-4 relative z-10 border-t border-slate-50">
            <button 
              onClick={onClose}
              className="font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer text-sm hidden sm:block mr-2"
            >
              Tutup
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              
              {/* Tombol Tolak Semua (Hanya muncul jika tidak ada yang di-ACC manual) */}
              {!hasPartialSelection && (
                <button 
                  onClick={() => onReject(detail.id)} 
                  disabled={actionLoading === detail.id}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  {actionLoading === detail.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} strokeWidth={3} />} Tolak Semua
                </button>
              )}

              {/* Tombol Terima Semua / Simpan Parsial */}
              <button 
                onClick={handleSave} 
                disabled={actionLoading === detail.id}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#425A5C] shadow-md hover:bg-[#2e4042] transition-colors cursor-pointer text-sm disabled:opacity-50"
              >
                {/* PERBAIKAN SINTAKS TERNARY DI SINI */}
                {actionLoading === detail.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : hasPartialSelection ? (
                  <Save size={16} strokeWidth={2.5} />
                ) : (
                  <Check size={16} strokeWidth={3} />
                )} 
                
                {hasPartialSelection ? 'Simpan Keputusan' : 'Terima Semua'}
              </button>

            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}