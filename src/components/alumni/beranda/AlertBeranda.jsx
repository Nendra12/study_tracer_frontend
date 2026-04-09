import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function AlertBeranda({ isVerified, hasCompletedKuesioner, kuesionerPending, setIsStatusOpen, navigate }) {
  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="popLayout">
        {!isVerified && (
          <motion.div key="verifikasi-alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-amber-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
              <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 shrink-0">
                <AlertCircle size={30} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Akun Menunggu Verifikasi</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">Akses fitur bursa kerja dan jejaring alumni sedang dibatasi. Tim admin kami akan melakukan verifikasi data Anda segera.</p>
              </div>
              <button onClick={() => setIsStatusOpen(true)} className="w-full md:w-auto bg-amber-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-lg shadow-amber-200">
                CEK STATUS
              </button>
            </div>
          </motion.div>
        )}

        {kuesionerPending.length > 0 && (
          <motion.div key="kuesioner-alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Isi Tracer Study</h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">Mohon bantu almamater dengan mengisi kuesioner pelacakan alumni untuk meningkatkan kualitas mutu pendidikan.</p>
              </div>
              <button
                onClick={() => {
                  if (kuesionerPending[0]?.id) navigate(`/alumni/kuesioner/${kuesionerPending[0].id}`);
                }}
                disabled={!isVerified}
                className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all cursor-pointer hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:shadow-none"
              >
                {isVerified ? 'ISI SEKARANG' : 'TUNGGU VERIFIKASI'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}