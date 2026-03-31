import React from 'react';
import { Plus, Megaphone, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function PengumumanSidebar({ stats, onOpenCreate }) {
  return (
    <div className="space-y-6">
      {/* Tombol Buat Desktop */}
      <div className="hidden lg:block">
        <button 
          onClick={onOpenCreate} 
          className="w-full cursor-pointer flex items-center justify-center gap-2 p-3.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md shadow-primary/20 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Widget Ringkasan */}
      <div className="bg-primary p-6 rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
            <Megaphone size={20} className="text-white/80" /> Ringkasan Pengumuman
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-xs font-medium text-white/70 flex items-center gap-2">
                <CheckCircle2 size={14} /> Pengumuman Aktif
              </span>
              <span className="text-sm font-black text-green-300">{stats.aktif}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-xs font-medium text-white/70 flex items-center gap-2">
                <Clock size={14} /> Draft Disimpan
              </span>
              <span className="text-sm font-black text-orange-300">{stats.draft}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10 border-transparent">
              <span className="text-xs font-medium text-white/70 flex items-center gap-2">
                <AlertCircle size={14} /> Total Pengumuman
              </span>
              <span className="text-sm font-black text-white">{stats.total}</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
}