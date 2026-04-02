import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut, RefreshCw } from 'lucide-react';

/**
 * Modal peringatan session timeout.
 * Muncul 5 menit sebelum auto-logout karena inactivity.
 */
export default function SessionWarningModal({ show, remainingSeconds, onExtend, onDismiss }) {
  if (!show) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = remainingSeconds <= 60;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header dengan gradient */}
            <div className={`p-8 text-center ${isUrgent ? 'bg-gradient-to-b from-red-50 to-white' : 'bg-gradient-to-b from-amber-50 to-white'}`}>
              {/* Icon animasi */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className={`w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center ${isUrgent ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500'} shadow-lg`}
              >
                <Clock size={40} strokeWidth={2.5} />
              </motion.div>

              <h2 className="text-xl font-black text-slate-800 mb-2">
                Sesi Akan Berakhir
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                Anda tidak aktif untuk sementara waktu. Sesi akan otomatis berakhir dalam:
              </p>

              {/* Countdown Timer */}
              <div className={`mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-mono text-3xl font-black ${
                isUrgent 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200' 
                  : 'bg-slate-800 text-white shadow-lg shadow-slate-300'
              }`}>
                <Clock size={24} />
                {timeDisplay}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3 border-t border-slate-100">
              <button
                onClick={onExtend}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-[#2e4344] transition-all shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer"
              >
                <RefreshCw size={18} />
                Lanjutkan Sesi
              </button>
              <button
                onClick={onDismiss}
                className="w-full px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Tutup Peringatan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
