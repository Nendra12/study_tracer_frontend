import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Loader2 } from 'lucide-react';

const SECTION_LABELS = {
  personal_info: 'Detail Pribadi',
  skills: 'Keahlian',
  social_media: 'Media Sosial',
  portofolio: 'Portofolio',
  deskripsi_karier: 'Deskripsi Karier',
};

export default function ProfileUpdateDetailModal({
  isOpen,
  detail,
  onClose,
  onApprove,
  onReject,
  actionLoading,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !detail) return null;

  const sectionLabel = SECTION_LABELS[detail.section] || detail.field || detail.section;
  const loadingKey = `profile-${detail.id}`;
  const isActionLoading = actionLoading === loadingKey;

  // Backend already provides pre-built changes array
  const changes = detail.changes || [];

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

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 md:px-8 md:pt-8 md:pb-6 flex items-start justify-between bg-white relative z-10">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Detail Pembaruan {sectionLabel}
              </h2>
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

          {/* Body — comparison table */}
          <div className="px-6 md:px-8 pb-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
            {/* Action badge */}
            <div className="mb-4">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                detail.action === 'create' ? 'bg-emerald-50 text-emerald-600' :
                detail.action === 'delete' ? 'bg-red-50 text-red-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {detail.action === 'create' ? 'Tambah Baru' : detail.action === 'delete' ? 'Hapus Data' : 'Perubahan Data'}
              </span>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-widest">
              <div className="col-span-3">Jenis Perubahan</div>
              <div className="col-span-4">Data Sebelumnya</div>
              <div className="col-span-1 text-center"></div>
              <div className="col-span-4">Hasil Perubahan</div>
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-4 mt-4">
              {changes.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Tidak ada detail perubahan yang tersedia.</p>
              ) : (
                changes.map((change, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 items-center p-2 -mx-2 rounded-2xl hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-3">
                      <div className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center h-full">
                        {change.label}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="px-4 py-3 bg-white border border-slate-100 text-slate-400 rounded-xl text-xs font-medium h-full flex items-center break-all">
                        {renderValue(change.old)}
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center text-slate-300">
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </div>
                    <div className="col-span-4">
                      <div className="px-4 py-3 bg-emerald-50/50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold h-full flex items-center break-all shadow-sm shadow-emerald-100/50">
                        {renderValue(change.new)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 md:px-8 md:py-6 bg-white flex items-center justify-between sm:justify-end gap-4 relative z-10 border-t border-slate-50">
            <button
              onClick={onClose}
              className="font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer text-sm hidden sm:block mr-2"
            >
              Tutup
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onReject(detail.id)}
                disabled={isActionLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer text-sm disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} strokeWidth={3} />} Tolak
              </button>
              <button
                onClick={() => onApprove(detail.id)}
                disabled={isActionLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-[#425A5C] shadow-md hover:bg-[#2e4042] transition-colors cursor-pointer text-sm disabled:opacity-50"
              >
                {isActionLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />} Terima
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

function renderValue(val) {
  if (val === null || val === undefined || val === '-') return '-';
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.join(', ') || '-';
    return JSON.stringify(val);
  }
  return String(val) || '-';
}
