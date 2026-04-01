import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useThemeSettings } from '../../context/ThemeContext';
import DefaultLogo from '../../assets/icon.png';

/**
 * Convert image URL ke data URL untuk dipakai di jsPDF.
 */
function loadImageAsDataUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * Render watermark logo + "Alumni Tracer | Nama Sekolah" di kiri atas setiap halaman PDF.
 */
function addWatermark(doc, namaSekolah, logoDataUrl) {
  const x = 14;
  const y = 8;
  const logoSize = 8;

  // Gambar logo di kiri atas
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', x, y - 1, logoSize, logoSize, undefined, 'FAST');
  }

  // Teks watermark di sebelah kanan logo
  const textX = logoDataUrl ? x + logoSize + 3 : x;
  const watermarkText = `Alumni Tracer | ${namaSekolah}`;

  doc.setFontSize(14);
  doc.setTextColor(160, 160, 160);
  doc.text(watermarkText, textX, y + 5);
}

async function generateCvPdf(alumni, namaSekolah, logoUrl) {
  // Pre-load logo sebagai data URL
  const logoDataUrl = await loadImageAsDataUrl(logoUrl || DefaultLogo);

  const captureRoot = document.querySelector('main.w-full.max-w-7xl') || document.querySelector('main');
  if (!captureRoot) {
    throw new Error('Area profil tidak ditemukan');
  }

  const barEl = document.querySelector('[data-public-profile-bar]');
  const prevDisplay = barEl ? barEl.style.display : null;

  // Hide action bar so PDF contains only profile content
  if (barEl) {
    barEl.style.display = 'none';
  }

  // Convert backend storage URLs to same-origin proxied URLs for export capture.
  // This avoids CORS errors when html-to-image fetches image assets.
  const rewrittenImgs = [];
  const imgElements = captureRoot.querySelectorAll('img');
  const storagePrefix = 'http://localhost:8000/storage/';
  imgElements.forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith(storagePrefix)) {
      const path = src.replace(storagePrefix, '');
      const proxied = `${window.location.origin}/storage/${path}`;
      rewrittenImgs.push({ img, src });
      img.setAttribute('src', proxied);
    }
  });

  // Give browser one frame to reflow before capture
  await new Promise((resolve) => requestAnimationFrame(resolve));

  let dataUrl;
  try {
    const imagePromises = rewrittenImgs.map(({ img }) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    });
    await Promise.all(imagePromises);

    dataUrl = await toPng(captureRoot, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#f8f9fa',
      skipAutoScale: false,
      style: {
        margin: '0',
      },
    });
  } finally {
    rewrittenImgs.forEach(({ img, src }) => {
      img.setAttribute('src', src);
    });

    if (barEl) {
      barEl.style.display = prevDisplay;
    }
  }

  const doc = new jsPDF('p', 'mm', 'a2');
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  const margin = 14;
  const availableW = pw - margin * 2;
  const availableH = ph - margin * 2;

  const imgData = dataUrl;
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imgData;
  });

  const imgW = availableW;
  const imgH = (img.height * imgW) / img.width;

  // Multi-page split if content exceeds one A2 page
  let heightLeft = imgH;
  let position = margin;

  doc.addImage(imgData, 'JPEG', margin, position, imgW, imgH, undefined, 'FAST');
  addWatermark(doc, namaSekolah, logoDataUrl);
  heightLeft -= availableH;

  while (heightLeft > 0) {
    doc.addPage();
    position = margin - (imgH - heightLeft);
    doc.addImage(imgData, 'JPEG', margin, position, imgW, imgH, undefined, 'FAST');
    addWatermark(doc, namaSekolah, logoDataUrl);
    heightLeft -= availableH;
  }

  doc.save(`CV_${(alumni?.nama || 'Alumni').replace(/\s+/g, '_')}.pdf`);
}

export default function PublicProfileBar({ alumniData }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const { theme } = useThemeSettings();

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      await generateCvPdf(alumniData, theme?.namaSekolah || 'SMK Negeri 1 Gondang', theme?.logo);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div data-public-profile-bar className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-3 pr-3 sm:pr-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 relative">
      
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