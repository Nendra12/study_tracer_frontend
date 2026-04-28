import React from 'react';
import { X } from 'lucide-react';

export default function AttachmentPreviewBox({ attachmentPreview, onCancel }) {
  if (!attachmentPreview) return null;

  return (
    <div className="mb-4 p-3 bg-primary/10 rounded-2xl border border-primary/10 flex items-start justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4">
        {attachmentPreview.type === 'image' && (
          <img
            src={attachmentPreview.url}
            className="w-16 h-16 object-cover rounded-xl shadow-sm border border-primary/10"
            alt="preview"
          />
        )}
        {attachmentPreview.type === 'gif' && (
          <img
            src={attachmentPreview.url}
            className="w-16 h-16 object-cover rounded-xl shadow-sm border border-primary/10"
            alt="preview"
          />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-800 truncate max-w-[200px] md:max-w-sm">{attachmentPreview.fileName}</span>
          <span className="text-xs text-primary mt-0.5">Tambahkan pesan keterangan (opsional)...</span>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors shadow-sm bg-gray-50/50 backdrop-blur"
        title="Batal lampiran"
      >
        <X size={18} />
      </button>
    </div>
  );
}
