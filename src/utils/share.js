import toast from 'react-hot-toast';

/**
 * Membuat URL publik untuk lowongan berdasarkan ID.
 * @param {number|string} id - ID lowongan
 * @returns {string} URL lengkap lowongan publik
 */
export function getLowonganShareUrl(id) {
  return `${window.location.origin}/lowongan/${id}`;
}

/**
 * Share lowongan menggunakan Web Share API (native share dialog) dengan
 * fallback copy-to-clipboard jika browser tidak mendukung.
 *
 * @param {object} options
 * @param {number|string} options.id    - ID lowongan
 * @param {string}        options.judul - Judul lowongan
 * @param {string}        [options.perusahaan] - Nama perusahaan
 */
export async function shareLowongan({ id, judul, perusahaan }) {
  const url = getLowonganShareUrl(id);

  const shareTitle = judul || 'Lowongan Kerja';
  const shareText = perusahaan
    ? `Lihat lowongan "${shareTitle}" di ${perusahaan}`
    : `Lihat lowongan "${shareTitle}"`;

  // Gunakan Web Share API jika tersedia (mobile & beberapa desktop browser)
  if (navigator.share) {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url,
      });
      // Jangan tampilkan toast setelah native share karena user bisa cancel
      return;
    } catch (err) {
      // User membatalkan share dialog — bukan error sebenarnya
      if (err.name === 'AbortError') return;
      // Fallthrough ke clipboard jika share gagal
      console.warn('Web Share API failed, falling back to clipboard:', err);
    }
  }

  // Fallback: copy link ke clipboard
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link lowongan berhasil disalin!', {
      icon: '🔗',
      style: { fontWeight: 600 },
    });
  } catch (err) {
    // Fallback terakhir: execCommand (untuk browser lama)
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link lowongan berhasil disalin!', {
        icon: '🔗',
        style: { fontWeight: 600 },
      });
    } catch (fallbackErr) {
      toast.error('Gagal menyalin link. Salin manual: ' + url);
    }
  }
}
