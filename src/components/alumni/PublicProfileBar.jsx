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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3.5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      {/* Kiri — Label Profil Publik */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#3C5759]/10 flex items-center justify-center">
          <Eye size={16} className="text-[#3C5759]" />
        </div>
        <span className="text-sm font-bold text-[#3C5759]">Profil Publik</span>
      </div>

      {/* Kanan — Tombol Unduh PDF & Kembali */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3C5759] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#2A3E3F] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} />
          )}
          {downloading ? 'Mengunduh...' : 'Unduh PDF'}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#3C5759]/20 text-[#3C5759] rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
        >
          <ArrowLeft size={15} /> Kembali
        </button>
      </div>
    </div>
  );
}
