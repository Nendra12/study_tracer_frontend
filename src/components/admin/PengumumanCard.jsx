import React from 'react';
import { Calendar, Pencil, Trash2, Pin, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PengumumanCard({ item, onTogglePin, onEdit, onDelete, onViewImage }) {
  const navigate = useNavigate();
  const imageUrl = item.foto;

  // Fungsi untuk ke halaman detail (saat teks diklik)
  const handleTextClick = () => {
    navigate(`/wb-admin/pengumuman/detail/${item.id}`);
  };

  return (
    <div className={`bg-white rounded-2xl border ${item.is_pinned ? 'border-primary/40 bg-blue-50/20' : 'border-gray-100'} shadow-sm flex flex-col group transition-all hover:shadow-md overflow-hidden`}>
      
      {/* 1. AREA GAMBAR - Klik untuk pop-up gambar saja */}
      <div 
        onClick={() => onViewImage(item)} 
        className="w-full h-32 sm:h-40 overflow-hidden relative bg-gray-100 flex-shrink-0 cursor-pointer"
      >
        <img 
          src={imageUrl} 
          alt={item.judul} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            item.status === 'aktif' ? 'bg-green-500 text-white' : 
            item.status === 'draft' ? 'bg-gray-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {item.status}
          </span>
        </div>
      </div>

      {/* 2. AREA TEKS - Klik untuk pindah ke halaman detail */}
      <div 
        onClick={handleTextClick}
        className="p-5 flex flex-col gap-4 flex-1 cursor-pointer hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl text-white flex-shrink-0 ${item.status === 'aktif' ? 'bg-primary' : item.status === 'draft' ? 'bg-gray-400' : 'bg-red-400'}`}>
            <Megaphone size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {item.is_pinned && <Pin size={12} className="text-primary fill-primary" />}
              <h3 className="font-bold text-primary text-base line-clamp-1">{item.judul}</h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center gap-1"><Calendar size={12} /> {item.tanggal_dibuat}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed whitespace-pre-line">
          {item.konten}
        </p>
        
        {/* Aksi (Gunakan e.stopPropagation agar tidak ikut pindah halaman saat tombol aksi diklik) */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePin(item.id); }} 
            className={`text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${item.is_pinned ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
          >
            <Pin size={14} /> {item.is_pinned ? 'Lepas Sematan' : 'Sematkan'}
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
              className="cursor-pointer p-2 text-gray-400 hover:text-[#3C5759] hover:bg-blue-50 rounded-lg active:scale-90 transition-all" 
            >
              <Pencil size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id, item.judul); }} 
              className="cursor-pointer p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg active:scale-90 transition-all" 
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}