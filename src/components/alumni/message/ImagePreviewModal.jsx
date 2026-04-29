import React from 'react';
import { Download, X } from 'lucide-react';

export default function ImagePreviewModal({ previewImage, onClose, getImageUrl }) {
  if (!previewImage) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute top-6 right-6 flex gap-4 z-50">
        <a
          href={getImageUrl(previewImage.file_url)}
          download={previewImage.file_name || 'image.png'}
          onClick={(e) => e.stopPropagation()}
          className="p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          title="Unduh Gambar"
        >
          <Download size={24} />
        </a>
        <button
          className="p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          onClick={onClose}
          title="Tutup Preview"
        >
          <X size={24} />
        </button>
      </div>
      <img
        src={getImageUrl(previewImage.file_url)}
        className="max-w-full max-h-full object-contain rounded-md"
        onClick={(e) => e.stopPropagation()}
        alt="Preview"
      />
    </div>
  );
}
