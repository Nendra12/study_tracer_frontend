import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ScrollToBottomButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 md:bottom-[88px] right-6 p-2.5 md:p-3 bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.15)] rounded-full text-primary hover:bg-gray-50 transition-all z-20 animate-in fade-in zoom-in slide-in-from-bottom-5 cursor-pointer"
      title="Ke pesan terbaru"
    >
      <ChevronDown size={20} className="stroke-[2.5]" />
    </button>
  );
}
