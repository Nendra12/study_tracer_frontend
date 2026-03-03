import React from 'react';
import { X, Hourglass, CheckCircle2, RefreshCcw, CheckCircle } from 'lucide-react';

export default function StatusPengajuanModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    // Overlay Background
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm">
      
      {/* Drawer Container: Dihapus class rounded-nya agar ujungnya lurus kotak */}
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#3C5759]">Status Pengajuan</h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY / CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          
          {/* Box Estimasi */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 flex items-center gap-4 mb-8">
            <div className="bg-slate-200/50 p-2.5 rounded-full text-slate-500">
              <Hourglass size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Estimasi Waktu Penyelesaian</p>
              <p className="text-sm font-bold text-slate-800">2-3 Hari Kerja</p>
            </div>
          </div>

          {/* TIMELINE CONTAINER */}
          <div className="mt-2">
            
            {/* STEP 1: Pendaftaran Dikirim */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <CheckCircle2 size={24} className="text-emerald-500 shrink-0" />
                <div className="w-[2px] h-full bg-slate-200 my-2"></div>
              </div>
              
              <div className="flex-1 pb-8">
                <h3 className="text-base font-bold text-[#4B6B6D] flex items-center gap-2">
                  Pendaftaran telah Dikirim
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">14 Agustus 2024 • 09:30</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  <p className="text-sm text-[#4B6B6D] font-medium leading-relaxed">
                    Detail akun dan dokumen verifikasi alumni Anda telah Diterima
                  </p>
                </div>
              </div>
            </div>

            {/* STEP 2: Sedang Diverifikasi */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-[#3C5759] rounded-full p-1.5 shrink-0">
                  <RefreshCcw size={14} className="text-white" />
                </div>
                <div className="w-[2px] h-full bg-slate-200 my-2"></div>
              </div>
              
              <div className="flex-1 pb-8">
                <h3 className="text-base font-bold text-[#3C5759] flex items-center gap-2 flex-wrap">
                  Verifikasi Sedang Berlangsung
                </h3>
                <div className="inline-block bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-1 rounded-full mt-1 mb-2.5">
                  Langkah Saat Ini
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tim admin kami sedang memvalidasi tahun kelulusan dan Nomor Induk Mahasiswa Anda dengan data universitas.
                </p>
                
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden flex">
                  <div className="w-[60%] h-full bg-[#3C5759] rounded-full"></div>
                </div>
              </div>
            </div>

            {/* STEP 3: Persetujuan Akhir (Belum Selesai) */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <CheckCircle size={24} className="text-slate-200 shrink-0" />
              </div>
              
              <div className="flex-1 opacity-50 pb-2">
                <h3 className="text-base font-bold text-slate-400">
                  Persetujuan Akhir
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  Menunggu Penyelesaian verifikasi
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER / ACTION */}
        <div className="px-6 py-5 border-t border-slate-100 bg-white">
          <button 
            onClick={onClose}
            className="w-full bg-[#3C5759] text-white py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#3C5759]/20 hover:bg-[#2A3E3F] transition-all cursor-pointer"
          >
            Mengerti
          </button>
        </div>

      </div>
    </div>
  );
}