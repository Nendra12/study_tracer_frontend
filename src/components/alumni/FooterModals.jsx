import React from 'react';
import { createPortal } from 'react-dom'; // 1. IMPORT CREATEPORTAL
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Headphones, Check } from 'lucide-react';

export default function FooterModals({ isOpen, type, onClose }) {
  // Konten dinamis berdasarkan tipe yang dipilih
  const content = {
    privasi: {
      title: 'Kebijakan Privasi',
      icon: <ShieldCheck className="text-emerald-500" size={24} />,
      text: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>Kami sangat menghargai privasi data Anda. Informasi yang dikumpulkan melalui sistem Alumni Tracer hanya digunakan untuk:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Pemetaan distribusi karir alumni secara anonim.</li>
            <li>Keperluan akreditasi Universitas.</li>
            <li>Menghubungkan alumni dengan peluang kerja yang relevan.</li>
          </ul>
          <p>Data pribadi Anda tidak akan pernah dijual atau dibagikan kepada pihak ketiga untuk tujuan komersial tanpa izin eksplisit dari Anda.</p>
        </div>
      )
    },
    layanan: {
      title: 'Ketentuan Layanan',
      icon: <FileText className="text-blue-500" size={24} />,
      text: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>Dengan menggunakan platform ini, Anda setuju untuk:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Memberikan informasi yang akurat dan jujur terkait status karir Anda.</li>
            <li>Tidak menyalahgunakan informasi lowongan kerja untuk tujuan penipuan.</li>
            <li>Menjaga kesantunan dalam berinteraksi dengan sesama alumni.</li>
          </ul>
          <p>Pelanggaran terhadap ketentuan ini dapat mengakibatkan pembatasan akses akun Anda pada platform Alumni Tracer.</p>
        </div>
      )
    },
    kontak: {
      title: 'Kontak Dukungan',
      icon: <Headphones className="text-amber-500" size={24} />,
      text: (
        <div className="space-y-4 text-slate-600 text-sm leading-relaxed text-center">
          <p>Butuh bantuan atau menemukan masalah teknis? Tim dukungan kami siap membantu Anda.</p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 inline-block w-full mt-2">
            <p className="font-bold text-slate-800">Email:</p>
            <p className="text-[#425A5C]">smkn1gondangstudytracer@gmail.com</p>
            <p className="font-bold text-slate-800 mt-3">Jam Operasional:</p>
            <p>Senin - Jumat | 08.00 - 16.00 WIB</p>
          </div>
        </div>
      )
    }
  };

  const activeContent = content[type] || content.privasi;

  // 2. BUNGKUS RETURN DENGAN CREATEPORTAL
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 rounded-xl">
                  {activeContent.icon}
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {activeContent.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {activeContent.text}
            </div>

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="bg-[#425A5C] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#2e4042] transition-all cursor-pointer flex items-center gap-2"
              >
                <Check size={16} /> Mengerti
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // 3. RENDER KE BODY
  );
}