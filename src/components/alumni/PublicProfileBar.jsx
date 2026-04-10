import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useThemeSettings } from '../../context/ThemeContext';
import DefaultLogo from '../../assets/icon.png';
import { toastError } from '../../utilitis/alert';

// ═══════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════

function loadImageAsDataUrl(url) {
  return new Promise((resolve) => {
    if (!url) { resolve(null); return; }
    let finalUrl = url;
    const storagePrefix = 'http://localhost:8000/storage/';
    if (typeof finalUrl === 'string' && finalUrl.startsWith(storagePrefix)) {
      finalUrl = `${window.location.origin}/storage/${finalUrl.replace(storagePrefix, '')}`;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 100;
      c.height = img.naturalHeight || 100;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = finalUrl;
  });
}

function addWatermark(doc, webLink, logoDataUrl, namaSekolah) {
  const x = 5, y = 5.5, logoSize = 5.2;
  const displayText = webLink.replace(/^https?:\/\//i, '');
  const titleText = `Study Tracer | ${namaSekolah || 'SMK'}`;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', x, y - 1, logoSize, logoSize, undefined, 'FAST');
  }

  const textX = logoDataUrl ? x + logoSize + 2.2 : x;

  // Baris 1: "Study Tracer | nama smk"
  doc.setFontSize(9.5);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(61, 90, 92);
  doc.text(titleText, textX, y + 1.8);

  // Baris 2: link web
  doc.setFontSize(7.5);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(160, 160, 160);
  doc.textWithLink(displayText, textX, y + 5, { url: webLink });
}

function proxyStorageImages(container) {
  const rewritten = [];
  const prefix = 'http://localhost:8000/storage/';
  container.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith(prefix)) {
      rewritten.push({ img, originalSrc: src });
      img.setAttribute('src', `${window.location.origin}/storage/${src.replace(prefix, '')}`);
    }
  });
  return rewritten;
}

function restoreProxiedImages(list) {
  list.forEach(({ img, originalSrc }) => img.setAttribute('src', originalSrc));
}

async function captureElement(el) {
  const imgs = el.querySelectorAll('img');
  await Promise.all(Array.from(imgs).map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise((r) => {
      img.addEventListener('load', r, { once: true });
      img.addEventListener('error', r, { once: true });
    });
  }));
  return toPng(el, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#f8f9fa',
    skipAutoScale: false,
    style: { margin: '0' },
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ═══════════════════════════════════════════
// GENERATE PDF — Section-aware, layout preserved
// ═══════════════════════════════════════════
//
// Strategi:
// 1. Capture setiap [data-pdf-section] sebagai gambar TANPA mengubah layout
//    → Profile Header (full-width) dan Grid 2-kolom (sidebar+konten) tetap sama
// 2. Untuk setiap section image:
//    a. Jika muat di sisa halaman → letakkan langsung
//    b. Jika tidak muat tapi muat di halaman penuh → halaman baru, letakkan utuh
//    c. Jika lebih tinggi dari halaman penuh → slice dengan canvas per halaman
// 3. Watermark di setiap halaman

async function generateCvPdf(alumni, webLink, logoUrl, namaSekolah) {
  const logoDataUrl = await loadImageAsDataUrl(logoUrl || DefaultLogo);

  const sourceRoot = document.querySelector('main.w-full.max-w-7xl') || document.querySelector('main');
  if (!sourceRoot) throw new Error('Area profil tidak ditemukan');

  // Capture dari clone offscreen agar UI asli tidak flicker saat bar disembunyikan
  const cloneRoot = sourceRoot.cloneNode(true);
  cloneRoot.style.position = 'fixed';
  cloneRoot.style.left = '-10000px';
  cloneRoot.style.top = '0';
  cloneRoot.style.width = `${sourceRoot.getBoundingClientRect().width || sourceRoot.offsetWidth}px`;
  cloneRoot.style.zIndex = '-1';
  cloneRoot.style.pointerEvents = 'none';
  cloneRoot.style.opacity = '1';
  document.body.appendChild(cloneRoot);

  const cloneBarEl = cloneRoot.querySelector('[data-public-profile-bar]');
  if (cloneBarEl) cloneBarEl.style.display = 'none';

  // Proxy gambar untuk CORS hanya di clone
  const rewrittenImgs = proxyStorageImages(cloneRoot);
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => setTimeout(r, 150));

  const sections = cloneRoot.querySelectorAll('[data-pdf-section]');
  const sectionImages = [];

  try {
    for (const section of sections) {
      try {
        const dataUrl = await captureElement(section);
        const img = await loadImage(dataUrl);
        sectionImages.push({ dataUrl, width: img.width, height: img.height });
      } catch (err) {
        console.warn('Gagal capture section, skip:', err);
      }
    }
  } finally {
    restoreProxiedImages(rewrittenImgs);
    cloneRoot.remove();
  }

  if (sectionImages.length === 0) throw new Error('Tidak ada section yang bisa di-capture');

  // ══════════════════════
  // BUILD PDF (A4)
  // ══════════════════════
  const doc = new jsPDF('p', 'mm', 'a4');
  const pw = doc.internal.pageSize.getWidth();  // ~210mm
  const ph = doc.internal.pageSize.getHeight(); // ~297mm

  const margin = 8;
  const watermarkH = 9;
  const sectionGap = 6;
  const availableW = pw - margin * 2;
  const contentStartY = margin + watermarkH;
  const pageBottom = ph - margin;
  const fullPageH = pageBottom - contentStartY; // tinggi satu halaman penuh

  let cursorY = contentStartY;

  // Watermark halaman pertama
  addWatermark(doc, webLink, logoDataUrl, namaSekolah);

  for (const { dataUrl, width, height } of sectionImages) {
    const imgW = availableW;
    const imgH = (height / width) * imgW;
    const remainingH = pageBottom - cursorY;

    // ── CASE A: Muat di sisa halaman → letakkan langsung ──
    if (imgH <= remainingH) {
      doc.addImage(dataUrl, 'PNG', margin, cursorY, imgW, imgH, undefined, 'FAST');
      cursorY += imgH + sectionGap;
      continue;
    }

    // ── CASE B: Tidak muat di sisa, tapi muat di halaman penuh → halaman baru, letakkan utuh ──
    if (imgH <= fullPageH) {
      doc.addPage();
      cursorY = contentStartY;
      addWatermark(doc, webLink, logoDataUrl, namaSekolah);
      doc.addImage(dataUrl, 'PNG', margin, cursorY, imgW, imgH, undefined, 'FAST');
      cursorY += imgH + sectionGap;
      continue;
    }

    // ── CASE C: Lebih tinggi dari halaman penuh → slice per halaman ──
    // Langsung slice dari posisi saat ini (tanpa membuang ruang kosong)
    const fullImg = await loadImage(dataUrl);
    const scale = imgW / fullImg.width; // mm per pixel

    let srcY = 0;
    while (srcY < fullImg.height) {
      const slotH = pageBottom - cursorY; // sisa ruang di halaman ini (mm)
      const slotHPx = slotH / scale;       // sisa ruang dalam pixel

      const remainPx = fullImg.height - srcY;
      const slicePx = Math.min(slotHPx, remainPx);
      const sliceMM = slicePx * scale;

      // Canvas slice
      const canvas = document.createElement('canvas');
      canvas.width = fullImg.width;
      canvas.height = Math.ceil(slicePx);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fullImg, 0, srcY, fullImg.width, slicePx, 0, 0, fullImg.width, slicePx);

      const sliceUrl = canvas.toDataURL('image/jpeg', 0.95);
      doc.addImage(sliceUrl, 'JPEG', margin, cursorY, imgW, sliceMM, undefined, 'FAST');

      srcY += slicePx;
      cursorY += sliceMM;

      // Jika masih ada sisa gambar, buat halaman baru
      if (srcY < fullImg.height) {
        doc.addPage();
        cursorY = contentStartY;
        addWatermark(doc, webLink, logoDataUrl, namaSekolah);
      }
    }

    cursorY += sectionGap;
  }

  doc.save(`CV_${(alumni?.nama || 'Alumni').replace(/\s+/g, '_')}.pdf`);
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

export default function PublicProfileBar({ alumniData }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const { theme } = useThemeSettings();

  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      const webLink = window.location.origin;
      await generateCvPdf(alumniData, webLink, theme?.logo, theme?.namaSekolah);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toastError('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div data-public-profile-bar className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 p-3 pr-3 sm:pr-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 relative">
      
      {/* BAGIAN KIRI — Tombol Kembali & Label Profil Publik */}
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto pl-1">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold shadow-sm hover:border-primary/30 hover:text-primary hover:bg-slate-50 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <ArrowLeft size={16} strokeWidth={2.5} /> 
          Kembali
        </button>
        <div className="w-px h-6 bg-slate-200 hidden sm:block shrink-0"></div>
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
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold shadow-md hover:bg-primary/80 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
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