import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Headphones, Check } from 'lucide-react';
import { useThemeSettings } from '../../context/ThemeContext'; // Import pengaturan tema

export default function FooterModals({ isOpen, type, onClose }) {
  const { theme } = useThemeSettings(); // Ambil data dinamis

  // Konten dinamis berdasarkan tipe yang dipilih
  const content = {
    privasi: {
      title: 'Kebijakan Privasi',
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      text: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
          {theme?.teksPrivasi || `Kami sangat menghargai privasi data Anda. Informasi yang dikumpulkan melalui sistem Alumni Tracer hanya digunakan untuk:\n\n• Pemetaan distribusi karir alumni secara anonim.\n• Keperluan akreditasi Sekolah.\n• Menghubungkan alumni dengan peluang kerja yang relevan.\n\nData pribadi Anda tidak akan pernah dijual atau dibagikan kepada pihak ketiga untuk tujuan komersial tanpa izin eksplisit dari Anda.`}
        </div>
      )
    },
    layanan: {
      title: 'Ketentuan Layanan',
      icon: <FileText className="text-blue-500" size={24} />,
      text: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed whitespace-pre-line">
          {theme?.teksLayanan || `Dengan menggunakan platform ini, Anda setuju untuk:\n\n• Memberikan informasi yang akurat dan jujur terkait status karir Anda.\n• Tidak menyalahgunakan informasi lowongan kerja untuk tujuan penipuan.\n• Menjaga kesantunan dalam berinteraksi dengan sesama alumni.\n\nPelanggaran terhadap ketentuan ini dapat mengakibatkan pembatasan akses akun Anda pada platform Alumni Tracer.`}
        </div>
      )
    },
    kontak: {
      title: 'Kontak Dukungan',
      icon: <Headphones className="text-amber-500" size={24} />,
      text: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed text-center flex flex-col items-center">
          <p className="max-w-md">{theme?.teksDukungan || 'Butuh bantuan atau menemukan masalah teknis? Tim dukungan kami siap membantu Anda.'}</p>
          
          {/* Card Detail Kontak yang memuat Email, Web, dan Telpon */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 w-full mt-4 text-left shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-1">Email</p>
                <p className="text-primary font-bold">{theme?.emailKontak || 'smkn1gondang@yahoo.co.id'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-1">Website Resmi</p>
                <p className="text-primary font-bold">{theme?.webKontak || 'smkn1gondang-nganjuk.sch.id'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-1">Telepon</p>
                <p className="text-primary font-bold">{theme?.telpKontak || '(0358) 611606'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  const activeContent = content[type] || content.privasi;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-4xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  {activeContent.icon}
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {activeContent.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
              {activeContent.text}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-primary/80 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <Check size={16} /> Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}