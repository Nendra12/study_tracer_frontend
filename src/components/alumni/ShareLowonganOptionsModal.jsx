import React from 'react';
import { Share2, MessageCircle, X } from 'lucide-react';

export default function ShareLowonganOptionsModal({ isOpen, onClose, onShareChat, onShareExternal }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800">Bagikan lowongan</h3>
            <p className="text-[11px] text-gray-500">Pilih tujuan share.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <button
            onClick={onShareChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Bagikan ke chat</p>
              <p className="text-[11px] text-gray-500">Kirim ke percakapan di aplikasi.</p>
            </div>
          </button>

          <button
            onClick={onShareExternal}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-colors cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Share2 size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Bagikan ke aplikasi lain</p>
              <p className="text-[11px] text-gray-500">Gunakan native share / copy link.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
