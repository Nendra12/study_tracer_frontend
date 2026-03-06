import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { alumniApi } from '../../api/alumni';

export default function PublicProfileBar({ alumniId, alumniNama }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      const res = await alumniApi.downloadPublicProfilePdf(alumniId);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Profil_${alumniNama || 'Alumni'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-3 pr-3 sm:pr-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 relative">
      
      {/* BAGIAN KIRI — Tombol Kembali & Label Profil Publik */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto pl-1">
        
        {/* Tombol Kembali di Paling Kiri */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold shadow-sm hover:border-primary/30 hover:text-primary hover:bg-slate-50 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> 
          Kembali
        </button>

        {/* Garis Pemisah (Hanya terlihat di layar agak besar) */}
        <div className="w-px h-6 bg-slate-200 hidden sm:block shrink-0"></div>

        {/* Label Profil Publik */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-[14px] bg-slate-100 flex items-center justify-center shrink-0">
            <Eye size={18} strokeWidth={2.5} className="text-primary" />
          </div>
          <span className="text-[14px] sm:text-[15px] font-black text-primary tracking-tight truncate">
            Profil Publik
          </span>
        </div>

      </div>

      {/* BAGIAN KANAN — Tombol Unduh PDF */}
      <div className="flex w-full sm:w-auto justify-end">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
        >
          {downloading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} strokeWidth={2.5} />
          )}
          {downloading ? 'Mengunduh...' : 'Unduh PDF'}
        </button>
      </div>
      
    </div>
  );
}