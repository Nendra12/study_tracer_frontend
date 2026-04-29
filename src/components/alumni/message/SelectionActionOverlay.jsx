import React from 'react';
import { Trash2 } from 'lucide-react';

export default function SelectionActionOverlay({
  selectedCount,
  totalCount,
  isAllSelected,
  onToggleSelectAll,
  onDeleteSelected,
}) {
  if (selectedCount <= 0) return null;

  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-gray-100 p-3 z-20 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between text-sm px-1">
        <span className="font-bold text-gray-800 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">
          {selectedCount} dipilih
        </span>
        <button
          onClick={onToggleSelectAll}
          className="text-indigo-600 font-bold hover:underline cursor-pointer"
        >
          {isAllSelected && totalCount > 0 ? 'Batal Pilih Semua' : 'Pilih Semua'}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onDeleteSelected}
          className="flex-1 cursor-pointer flex justify-center items-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
        >
          <Trash2 size={14} /> Hapus
        </button>
      </div>
    </div>
  );
}
